"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Phone,
  Video,
  PanelRight,
  MoreVertical,
  Plus,
  Paperclip,
  Smile,
  Send,
  Calendar,
  Vote,
  MapPin,
  File as FileIcon,
  X,
} from "lucide-react";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { Plan, CreatePlanInput } from "@/src/features/Chat/types/plans";
import { useChatLogic } from "@/src/hooks/useChatLogic";
import { createChannelPlan, createDMPlan, getChannelPlans, getDMPlans } from "@/src/features/Chat/api/planApi";
import { PlanComposerDialog } from "@/src/features/Chat/ui/PlanComposerDialog";
import { PlaceMessageDialog } from "@/src/features/Chat/ui/PlaceMessageDialog";
import { PlanRealtimeEvent } from "@/src/features/Chat/hooks/useWebsocket";
import { OnechatMessageList } from "./OnechatMessageList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";

interface SendMessagePayload {
  type: "channel" | "dm";
  channelId?: string;
  receiverId?: string;
  content: string;
}

interface OnechatChatContainerProps {
  channel: Channel | null;
  friend: Friends | null;
  messages: Message[];
  deletedMessageIds?: string[];
  sendMessage: (msg: SendMessagePayload) => void;
  connected: boolean;
  sendDelivered?: (messageId: string) => void;
  sendRead?: (messageId: string) => void;
  currentUser?: { id?: string; name?: string; username?: string } | null;
  typing?: unknown;
  getTypingUsers?: (channelId: string) => string[];
  startTyping?: () => void;
  stopTyping?: () => void;
  onBack?: () => void;
  channelMembers?: Array<{ name?: string; username?: string; user?: { name?: string; username?: string } }>;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  planEvents?: PlanRealtimeEvent[];
  onPlansUpdated?: (plans: Plan[]) => void;
}

export function OnechatChatContainer({
  channel,
  friend,
  messages,
  currentUser,
  deletedMessageIds = [],
  sendMessage,
  connected,
  sendDelivered,
  sendRead,
  getTypingUsers,
  onBack,
  channelMembers = [],
  sidebarCollapsed,
  onToggleSidebar,
  rightPanelOpen,
  onToggleRightPanel,
  planEvents = [],
  onPlansUpdated,
}: OnechatChatContainerProps) {
  const {
    input,
    setInput,
    allMessages,
    loadingHistory,
    containerRef,
    endRef,
    handleSend,
    handleUpload,
    removeMessage,
    deleteError,
    uploading,
  } = useChatLogic({
    channel,
    friend,
    messages,
    deletedMessageIds,
    sendMessage,
    sendDelivered,
    sendRead,
  });

  const typingNames = channel ? getTypingUsers?.(channel.id) ?? [] : [];
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [placeDialogOpen, setPlaceDialogOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [planRefreshToken, setPlanRefreshToken] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const planRequestID = useRef(0);
  const processedPlanEventIDs = useRef(new Set<string>());

  const channelId = channel?.id;
  const friendId = friend?.id;

  // Auto-resize composer textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  // Load plans for the active conversation
  const reloadPlans = useCallback(async () => {
    const reqID = ++planRequestID.current;
    if (!channelId && !friendId) {
      setPlans([]);
      onPlansUpdated?.([]);
      setPlansLoading(false);
      return;
    }
    setPlansLoading(true);
    const req = channelId ? getChannelPlans(channelId) : getDMPlans(friendId!);
    try {
      const res = await req;
      if (reqID === planRequestID.current) {
        setPlans(res);
        onPlansUpdated?.(res);
      }
    } catch (e) {
      // Error handled gracefully
    } finally {
      if (reqID === planRequestID.current) setPlansLoading(false);
    }
  }, [channelId, friendId, onPlansUpdated]);

  useEffect(() => {
    void reloadPlans();
  }, [reloadPlans, connected]);

  useEffect(() => {
    if (connected) setPlanRefreshToken((v) => v + 1);
  }, [connected]);

  // Real-time plan sync
  useEffect(() => {
    let shouldRefresh = false;
    for (const ev of planEvents) {
      if (processedPlanEventIDs.current.has(ev.data.eventId)) continue;
      processedPlanEventIDs.current.add(ev.data.eventId);
      if (processedPlanEventIDs.current.size > 500) {
        const oldest = processedPlanEventIDs.current.values().next().value;
        if (oldest) processedPlanEventIDs.current.delete(oldest);
      }
      const belongs = channelId
        ? ev.data.channelId === channelId
        : Boolean(
            friendId &&
              (ev.data.dmUserLowId === friendId || ev.data.dmUserHighId === friendId)
          );
      if (belongs) shouldRefresh = true;
    }
    if (shouldRefresh) {
      setPlanRefreshToken((v) => v + 1);
      void reloadPlans();
    }
  }, [planEvents, channelId, friendId, reloadPlans]);

  const handleCreatePlan = async (inData: CreatePlanInput) => {
    const created = channel
      ? await createChannelPlan(channel.id, inData)
      : friend
      ? await createDMPlan(friend.id, inData)
      : null;
    if (!created) throw new Error("Select a chat before creating a plan.");

    const updatedPlans = [...plans, created].sort(
      (a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)
    );
    setPlans(updatedPlans);
    onPlansUpdated?.(updatedPlans);
  };

  const handlePlanChanged = useCallback(
    (updated: Plan) => {
      setPlans((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? updated : p));
        onPlansUpdated?.(next);
        return next;
      });
    },
    [onPlansUpdated]
  );

  const handleSharePlace = (place: string) => {
    const content = `Place: ${place}`;
    if (channel) sendMessage({ type: "channel", channelId: channel.id, content });
    else if (friend) sendMessage({ type: "dm", receiverId: friend.id, content });
  };

  const displayName = channel ? `# ${channel.name}` : friend ? friend.name : "Select a conversation";
  const displayInitials = (channel?.name || friend?.name || "OC")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const canSend = connected && Boolean(input.trim()) && !uploading;

  if (!channel && !friend) {
    return (
      <div className="oc-chat-center flex items-center justify-center text-center p-8">
        <div className="max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-[#17171b] border border-[#25252b] text-[#3b82f6] flex items-center justify-center text-xl font-bold mx-auto mb-3">
            #
          </div>
          <h2 className="text-lg font-bold text-[#f4f4f5]">Select a conversation</h2>
          <p className="text-sm text-[#71717a] mt-1.5 leading-relaxed">
            Choose a direct message or channel from the left sidebar to start messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="oc-chat-center">
      {/* ── Topbar / Chat Header ─────────────────────────────────── */}
      <header className="oc-chat-topbar">
        <div className="oc-chat-topbar-left">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden oc-btn-icon"
              aria-label="Back to conversations"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Toggle Sidebar Collapse - shown ONLY when collapsed to expand */}
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="oc-btn-icon hidden md:inline-flex active"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Avatar & User/Channel Info (Clicking toggles right side panel) */}
          <button
            type="button"
            onClick={onToggleRightPanel}
            className="flex items-center gap-3 text-left p-1 -ml-1 rounded-lg hover:bg-[var(--oc-bg-hover)] transition-colors cursor-pointer group focus:outline-none"
            title={rightPanelOpen ? "Close details panel" : "View profile and details"}
            aria-label={rightPanelOpen ? "Close details panel" : "Open details panel"}
          >
            {/* Avatar with Online indicator */}
            <div className="oc-avatar-wrap">
              <div
                className={`oc-avatar ${channel ? "oc-avatar-channel" : ""}`}
                style={{ width: "38px", height: "38px" }}
              >
                {displayInitials}
              </div>
              {!channel && <span className="oc-online-badge" />}
            </div>

            {/* Name & Status */}
            <div className="min-w-0">
              <h1 className="oc-topbar-title group-hover:text-[var(--oc-accent)] transition-colors">
                {displayName}
              </h1>
              <div className="oc-topbar-status">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span>{channel ? `${channelMembers.length || 1} members` : "Online"}</span>
              </div>
            </div>
          </button>
        </div>

        {/* Right Action Icons (Search, Phone, Video, Toggle Panel, More) */}
        <div className="oc-chat-topbar-actions">
          <button
            type="button"
            className="oc-btn-icon"
            title="Search in conversation"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            className="oc-btn-icon"
            title="Voice call"
            aria-label="Voice call"
            onClick={() => alert("Voice calls are scheduled to roll out in the upcoming update.")}
          >
            <Phone size={18} />
          </button>

          <button
            type="button"
            className="oc-btn-icon"
            title="Video call"
            aria-label="Video call"
            onClick={() => alert("Video calls are scheduled to roll out in the upcoming update.")}
          >
            <Video size={18} />
          </button>

          <button
            type="button"
            onClick={onToggleRightPanel}
            className={`oc-btn-icon ${rightPanelOpen ? "active" : ""}`}
            title={rightPanelOpen ? "Hide details panel" : "Show details panel"}
            aria-label="Toggle details panel"
          >
            <PanelRight size={18} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="oc-btn-icon"
                title="More conversation options"
                aria-label="More options"
              >
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#17171b] text-[#f4f4f5] border-[#25252b]"
            >
              <DropdownMenuItem
                className="text-xs focus:bg-[#202026] cursor-pointer"
                onClick={onToggleRightPanel}
              >
                {rightPanelOpen ? "Hide Details" : "View Details"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs focus:bg-[#202026] cursor-pointer"
                onClick={() => setPlanDialogOpen(true)}
              >
                Create a Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#25252b]" />
              <DropdownMenuItem
                className="text-xs text-[#3b82f6] focus:bg-[#202026] cursor-pointer"
                onClick={() => setPlaceDialogOpen(true)}
              >
                Share Place Coordinates
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Message History & Plan Timeline ─────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={channelId || friendId}
          initial={{ opacity: 0.94 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col min-h-0 relative"
        >
          {deleteError && (
            <div className="px-6 py-2 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400">
              {deleteError}
            </div>
          )}

          <OnechatMessageList
            messages={allMessages}
            plans={plans}
            loading={loadingHistory || plansLoading}
            containerRef={containerRef}
            endRef={endRef}
            isChannel={Boolean(channel)}
            typingNames={typingNames}
            seenCount={channel ? Math.max(channelMembers.length - 1, 0) : 0}
            currentUserId={currentUser?.id}
            onDeleteMessage={async (msg, scope) => {
              if (
                scope === "everyone" &&
                !window.confirm("Delete this message for everyone?")
              )
                return;
              try {
                await removeMessage(msg.id, scope);
              } catch (e) {
                // error handled by hook
              }
            }}
            onPlanChanged={handlePlanChanged}
            refreshToken={planRefreshToken}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Fixed Message Composer (Inspired by Reference) ───────── */}
      <div className="oc-composer-container">
        {/* Quick Tools Popover */}
        <AnimatePresence>
          {toolsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 mb-2 p-1.5 rounded-lg bg-[#17171b] border border-[#25252b] shadow-lg w-max"
            >
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setToolsOpen(false);
                }}
                className="px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#202026] rounded-md flex items-center gap-1.5 font-medium transition-colors"
              >
                <FileIcon size={14} className="text-[#3b82f6]" />
                <span>Upload file</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlanDialogOpen(true);
                  setToolsOpen(false);
                }}
                className="px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#202026] rounded-md flex items-center gap-1.5 font-medium transition-colors"
              >
                <Calendar size={14} className="text-[#3b82f6]" />
                <span>Create plan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlaceDialogOpen(true);
                  setToolsOpen(false);
                }}
                className="px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#202026] rounded-md flex items-center gap-1.5 font-medium transition-colors"
              >
                <MapPin size={14} className="text-[#3b82f6]" />
                <span>Share place</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInput("Poll: ");
                  setToolsOpen(false);
                }}
                className="px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#202026] rounded-md flex items-center gap-1.5 font-medium transition-colors"
              >
                <Vote size={14} className="text-[#3b82f6]" />
                <span>Create poll</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (f.size > 50 * 1024 * 1024) {
              alert("File size exceeds 50MB limit.");
              return;
            }
            try {
              await handleUpload(f);
            } catch (err: any) {
              alert(err?.message || "File upload failed.");
            }
          }}
        />

        {/* Composer Rounded Bar */}
        <form
          className="oc-composer-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend) handleSend();
          }}
        >
          {/* Plus tool button */}
          <button
            type="button"
            onClick={() => setToolsOpen(!toolsOpen)}
            className="w-8 h-8 rounded-full bg-[#17171b] text-[#a1a1aa] hover:text-[#f4f4f5] flex items-center justify-center shrink-0 transition-colors"
            title="Add tools"
            aria-label="Add tools"
          >
            {toolsOpen ? <X size={15} /> : <Plus size={15} />}
          </button>

          {/* Multiline textarea input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (canSend) handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={!connected || uploading}
            className="oc-composer-input"
          />

          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setInput((prev) => prev + " 😊")}
            className="p-1.5 text-[#71717a] hover:text-[#f4f4f5] shrink-0 transition-colors"
            title="Emoji"
            aria-label="Emoji"
          >
            <Smile size={18} />
          </button>

          {/* Attachment paperclip button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-[#71717a] hover:text-[#f4f4f5] shrink-0 transition-colors"
            title="Attach file"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>

          {/* Circular Blue Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className="oc-composer-btn-send"
            title="Send (Enter)"
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Plan Composer Modal */}
      <PlanComposerDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        onSubmit={handleCreatePlan}
      />

      {/* Place Message Modal */}
      <PlaceMessageDialog
        open={placeDialogOpen}
        onOpenChange={setPlaceDialogOpen}
        onSubmit={handleSharePlace}
      />
    </div>
  );
}
