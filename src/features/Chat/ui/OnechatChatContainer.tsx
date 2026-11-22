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
  Radio,
  Mic,
} from "lucide-react";
import { isJamEnabled } from "@/src/features/Jam/utils/featureFlag";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { Plan, CreatePlanInput } from "@/src/features/Chat/types/plans";
import { useChatLogic } from "@/src/hooks/useChatLogic";
import { createChannelPlan, createDMPlan, getChannelPlans, getDMPlans } from "@/src/features/Chat/api/planApi";
import { CreatePlanModal } from "@/src/features/Chat/ui/CreatePlanModal";
import { SidebarToggleIcon } from "@/src/shared/components/icons/SidebarIcons";
import { PlaceMessageDialog } from "@/src/features/Chat/ui/PlaceMessageDialog";
import { PlanRealtimeEvent } from "@/src/features/Chat/hooks/useWebsocket";
import { OnechatMessageList } from "./OnechatMessageList";
import { useAudioRecorder } from "@/src/features/Chat/hooks/useAudioRecorder";
import { VoiceRecorderBar } from "@/src/features/Chat/ui/VoiceRecorderBar";
import { useJamStore } from "@/src/features/Jam/store/useJamStore";
import { createJamMessageContent } from "@/src/features/Jam/utils/jamMessage";
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
    currentUser,
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
  const onPlansUpdatedRef = useRef(onPlansUpdated);

  const channelId = channel?.id;
  const friendId = friend?.id;

  const {
    isRecording,
    isPaused,
    recordingDuration,
    audioBlob,
    audioUrl,
    audioLevels,
    error: recorderError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    createAudioFile,
  } = useAudioRecorder();

  useEffect(() => {
    cancelRecording();
  }, [channelId, friendId, cancelRecording]);

  const handleStartVoiceRecording = async () => {
    try {
      await startRecording();
    } catch (err) {
      console.error("Failed to start voice recording:", err);
    }
  };

  const handleSendVoiceNote = async () => {
    try {
      let blob = audioBlob;
      if (isRecording) {
        blob = await stopRecording();
      }
      const file = createAudioFile(blob);
      if (!file) {
        console.warn("No audio recording found to send");
        return;
      }

      await handleUpload(file, "Voice message");
      cancelRecording();
    } catch (err: unknown) {
      console.error("Failed to upload voice message:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to send voice message";
      alert(errMsg);
    }
  };

  // Keep the callback in a ref so an inline parent callback cannot make
  // reloadPlans change identity and retrigger its own fetch effect.
  useEffect(() => {
    onPlansUpdatedRef.current = onPlansUpdated;
  }, [onPlansUpdated]);

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
      onPlansUpdatedRef.current?.([]);
      setPlansLoading(false);
      return;
    }
    setPlansLoading(true);
    const req = channelId ? getChannelPlans(channelId) : getDMPlans(friendId!);
    try {
      const res = await req;
      if (reqID === planRequestID.current) {
        setPlans(res);
        onPlansUpdatedRef.current?.(res);
      }
    } catch (e) {
      // Error handled gracefully
    } finally {
      if (reqID === planRequestID.current) setPlansLoading(false);
    }
  }, [channelId, friendId]);

  // Fetch plans when conversation changes (and immediately clear old plans)
  useEffect(() => {
    setPlans([]);
    onPlansUpdatedRef.current?.([]);
    void reloadPlans();
  }, [channelId, friendId, reloadPlans]);

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
    onPlansUpdatedRef.current?.(updatedPlans);
  };

  const handlePlanChanged = useCallback(
    (updated: Plan) => {
      setPlans((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? updated : p));
        queueMicrotask(() => {
          onPlansUpdatedRef.current?.(next);
        });
        return next;
      });
    },
    []
  );

  const handlePlanDeleted = useCallback((planId: string) => {
    setPlans((prev) => {
      const next = prev.filter((plan) => plan.id !== planId);
      queueMicrotask(() => {
        onPlansUpdatedRef.current?.(next);
      });
      return next;
    });
  }, []);

  const handleSharePlace = (place: string) => {
    const content = `Place: ${place}`;
    if (channel) sendMessage({ type: "channel", channelId: channel.id, content });
    else if (friend) sendMessage({ type: "dm", receiverId: friend.id, content });
  };

  const isJamFeatureEnabled = isJamEnabled();
  const currentJamStation = useJamStore((s) => s.currentStation);
  const openJamPanel = useJamStore((s) => s.openPanel);

  const handleOpenJam = () => {
    openJamPanel();
  };

  const handleShareJam = () => {
    if (currentJamStation) {
      const content = createJamMessageContent(currentJamStation);
      if (channel) sendMessage({ type: "channel", channelId: channel.id, content });
      else if (friend) sendMessage({ type: "dm", receiverId: friend.id, content });
    } else {
      openJamPanel();
    }
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
      <div className="oc-chat-center flex flex-col h-full">
        {/* Topbar with sidebar toggle */}
        <header className="oc-chat-topbar">
          <div className="oc-chat-topbar-left">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden md:flex oc-btn-icon"
                title={sidebarCollapsed ? "Open sidebar (Ctrl+\\)" : "Close sidebar (Ctrl+\\)"}
                aria-label="Toggle sidebar"
              >
                <SidebarToggleIcon className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs text-[#71717a] font-medium ml-1">No conversation selected</span>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div className="max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-[var(--oc-bg-surface)] border border-[var(--oc-border)] text-[var(--oc-accent)] flex items-center justify-center text-xl font-bold mx-auto mb-3">
              #
            </div>
            <h2 className="text-lg font-bold text-[var(--oc-text-primary)]">Select a conversation</h2>
            <p className="text-sm text-[var(--oc-text-secondary)] mt-1.5 leading-relaxed">
              Choose a direct message or channel from the left sidebar to start messaging.
            </p>
            {sidebarCollapsed && onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="mt-4 px-4 py-2 rounded-lg bg-[var(--oc-bg-subtle-accent)] text-[var(--oc-accent)] hover:bg-[var(--oc-bg-hover)] text-xs font-semibold border border-[var(--oc-accent)]/40 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <SidebarToggleIcon className="w-4 h-4" />
                <span>Open Conversations</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="oc-chat-center">
      {/* ── Mobile Topbar / Chat Header (Divriots Mobile Stack Style) ─ */}
      <header className="md:hidden fixed top-0 inset-x-0 z-50 bg-[#121316]/95 backdrop-blur-xl border-b border-[#22242a] pt-safe shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
        <div className="h-16 px-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#A78BFA] hover:bg-[#1e2025] transition-colors flex-shrink-0 active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <button
              type="button"
              onClick={onToggleRightPanel}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#1e2025] border border-[#22242a] flex items-center justify-center overflow-hidden text-[#A78BFA] font-semibold text-sm">
                  {displayInitials}
                </div>
                {!channel && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#41e575] rounded-full ring-2 ring-[#121316]" />
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <h1 className="text-[17px] font-semibold text-[#f0f2f5] truncate leading-tight">
                  {displayName}
                </h1>
                <p className="text-[11px] text-[#41e575] flex items-center gap-1 leading-none mt-0.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#41e575] inline-block animate-pulse" />
                  {channel ? `${channelMembers.length || 1} members` : "Online"}
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              aria-label="Start video call"
              onClick={() => alert("Video calls are scheduled to roll out in the upcoming update.")}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#A78BFA] hover:bg-[#1e2025] transition-colors active:scale-95"
            >
              <Video size={20} />
            </button>

            <button
              type="button"
              aria-label="Start audio call"
              onClick={() => alert("Voice calls are scheduled to roll out in the upcoming update.")}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#A78BFA] hover:bg-[#1e2025] transition-colors active:scale-95"
            >
              <Phone size={19} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="More options"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[#9ba1a6] hover:bg-[#1e2025] transition-colors active:scale-95"
                >
                  <MoreVertical size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 bg-[#17171b] text-[#f0f2f5] border-[#25252b] shadow-2xl rounded-xl p-1.5 z-50"
              >
                <DropdownMenuItem
                  className="text-xs focus:bg-[#202026] cursor-pointer rounded-lg px-2.5 py-1.5"
                  onClick={onToggleRightPanel}
                >
                  {rightPanelOpen ? "Hide Details" : "View Details"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs focus:bg-[#202026] cursor-pointer rounded-lg px-2.5 py-1.5"
                  onClick={() => setPlanDialogOpen(true)}
                >
                  Create a Plan
                </DropdownMenuItem>
                {isJamFeatureEnabled && (
                  <DropdownMenuItem
                    className="text-xs focus:bg-[#202026] cursor-pointer rounded-lg px-2.5 py-1.5 flex items-center gap-2"
                    onClick={handleOpenJam}
                  >
                    <Radio size={14} className="text-[#A78BFA]" />
                    <span>Open Onechat Jam</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Desktop Topbar / Chat Header ─────────────────────────── */}
      <header className="hidden md:flex oc-chat-topbar">
        <div className="oc-chat-topbar-left">
          {/* Desktop Toggle Conversation Sidebar */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden md:flex oc-btn-icon"
              title={sidebarCollapsed ? "Expand sidebar (Ctrl+\\)" : "Collapse sidebar (Ctrl+\\)"}
              aria-label="Toggle sidebar"
            >
              <SidebarToggleIcon className="w-4 h-4" />
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

          {isJamFeatureEnabled && (
            <button
              type="button"
              onClick={handleOpenJam}
              className="oc-btn-icon"
              title="Onechat Jam (Background Radio & Music)"
              aria-label="Onechat Jam"
            >
              <Radio size={18} />
            </button>
          )}

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
              {isJamFeatureEnabled && (
                <>
                  <DropdownMenuItem
                    className="text-xs focus:bg-[#202026] cursor-pointer flex items-center gap-2"
                    onClick={handleOpenJam}
                  >
                    <Radio size={13} className="text-[#A78BFA]" />
                    <span>Browse Jam Stations</span>
                  </DropdownMenuItem>
                  {currentJamStation && (
                    <DropdownMenuItem
                      className="text-xs focus:bg-[#202026] cursor-pointer flex items-center gap-2"
                      onClick={handleShareJam}
                    >
                      <Radio size={13} className="text-[#A78BFA]" />
                      <span>Share Jam in Chat</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuSeparator className="bg-[#25252b]" />
              <DropdownMenuItem
                className="text-xs text-[#f4f4f5] focus:bg-[#202026] cursor-pointer"
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
          className="flex-1 flex flex-col min-h-0 relative pt-16 md:pt-0 pb-20 md:pb-0"
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
            onPlanDeleted={handlePlanDeleted}
            refreshToken={planRefreshToken}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Fixed Message Composer (Divriots Mobile Stack Style) ──── */}
      <div className="oc-composer-container fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#121316]/95 backdrop-blur-xl border-t border-[#22242a] shadow-[0_-2px_16px_rgba(0,0,0,0.5)] md:relative md:bg-transparent md:border-0 md:shadow-none md:pb-0 px-2 py-2 md:p-3">
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
                <FileIcon size={14} className="text-[#A78BFA]" />
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
                <Calendar size={14} className="text-[#A78BFA]" />
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
                <MapPin size={14} className="text-[#A78BFA]" />
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
                <Vote size={14} className="text-[#A78BFA]" />
                <span>Create poll</span>
              </button>

              {isJamFeatureEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenJam();
                    setToolsOpen(false);
                  }}
                  className="px-2.5 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#202026] rounded-md flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Radio size={14} className="text-[#A78BFA]" />
                  <span>Start a Jam</span>
                </button>
              )}
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

        {/* Recorder Error Banner */}
        {recorderError && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <span>{recorderError}</span>
          </div>
        )}

        {/* Composer Form / Row */}
        <form
          className="flex items-center gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend) handleSend();
          }}
        >
          {/* Plus tool button */}
          <button
            type="button"
            onClick={() => setToolsOpen(!toolsOpen)}
            className="w-10 h-10 rounded-full text-[#A78BFA] hover:bg-[#1e2025] flex items-center justify-center shrink-0 transition-colors active:scale-95 cursor-pointer"
            title="Add tools / attachment"
            aria-label="Attach media"
          >
            {toolsOpen ? <X size={20} /> : <Plus size={22} />}
          </button>

          {/* Teams-style input container (Kept visible on large screens when recording) */}
          <div
            className={`flex-1 items-center bg-[#1F1F1F] border border-[#333338] rounded-lg px-3.5 py-1.5 min-h-[40px] focus-within:ring-1 focus-within:ring-[#6E53CC] focus-within:border-[#6E53CC] transition-all ${
              isRecording || !!audioUrl
                ? "hidden sm:flex opacity-60 pointer-events-none"
                : "flex"
            }`}
          >
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
              placeholder={isRecording || !!audioUrl ? "Recording audio message..." : "Type a message..."}
              disabled={!connected || uploading || isRecording || !!audioUrl}
              className="w-full bg-transparent border-0 outline-none text-[#f0f2f5] placeholder:text-[#8A8A8A] text-sm focus:ring-0 p-0 resize-none max-h-24 leading-snug"
            />

            {/* Emoji button */}
            <button
              type="button"
              onClick={() => setInput((prev) => prev + " 😊")}
              className="w-8 h-8 flex items-center justify-center rounded-md text-[#9ba1a6] hover:text-[#f0f2f5] transition-colors shrink-0 cursor-pointer"
              title="Insert stickers or emoji"
              aria-label="Insert stickers or emoji"
            >
              <Smile size={19} />
            </button>
          </div>

          {/* Right Action: Voice Recorder Pill if recording/reviewing, otherwise Mic or Send button */}
          {isRecording || !!audioUrl ? (
            <VoiceRecorderBar
              isRecording={isRecording}
              isPaused={isPaused}
              recordingDuration={recordingDuration}
              audioLevels={audioLevels}
              audioUrl={audioUrl}
              onPause={pauseRecording}
              onResume={resumeRecording}
              onCancel={cancelRecording}
              onSend={handleSendVoiceNote}
              onStopToPreview={stopRecording}
              isUploading={uploading}
            />
          ) : (
            <button
              type={canSend ? "submit" : "button"}
              disabled={!connected || uploading}
              onClick={(e) => {
                if (!canSend) {
                  e.preventDefault();
                  handleStartVoiceRecording();
                }
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#6E53CC] text-white hover:bg-[#7E64E0] active:scale-95 transition-all shadow-[0_2px_12px_rgba(110,83,204,0.35)] shrink-0 cursor-pointer"
              title={canSend ? "Send message (Enter)" : "Record voice message"}
              aria-label={canSend ? "Send message" : "Record voice message"}
            >
              {canSend ? <Send size={18} /> : <Mic size={20} />}
            </button>
          )}
        </form>
      </div>

      {/* Create Plan Modal */}
      <CreatePlanModal
        isOpen={planDialogOpen}
        onClose={() => setPlanDialogOpen(false)}
        onCreatePlan={handleCreatePlan}
        conversationName={displayName}
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
