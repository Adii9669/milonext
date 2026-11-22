"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  Download,
  File as FileIcon,
  MoreHorizontal,
  Trash2,
  Check,
  CheckCheck,
  Play,
  Pause,
  Mic,
  Image as ImageIcon,
} from "lucide-react";
import { Message } from "@/src/features/Chat/types/messages";
import { Plan } from "@/src/features/Chat/types/plans";
import ChatSkeleton from "@/src/features/Chat/loading/ChatSkeleton";
import { OnechatPlanCard } from "./OnechatPlanCard";
import { parseJamMessage } from "@/src/features/Jam/utils/jamMessage";
import { OnechatJamCard } from "@/src/features/Jam/ui/OnechatJamCard";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu";

interface ChatTimelineItem {
  id: string;
  type: "message" | "plan";
  time: number;
  message?: Message;
  plan?: Plan;
}

interface OnechatMessageListProps {
  messages: Message[];
  plans: Plan[];
  loading: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  endRef: React.RefObject<HTMLDivElement | null>;
  isChannel?: boolean;
  typingNames?: string[];
  seenCount?: number;
  currentUserId?: string;
  onDeleteMessage?: (message: Message, scope: "me" | "everyone") => void;
  onPlanChanged?: (plan: Plan) => void;
  onPlanDeleted?: (planId: string) => void;
  refreshToken?: number;
}

export function OnechatMessageList({
  messages = [],
  plans = [],
  loading,
  containerRef,
  endRef,
  isChannel = false,
  typingNames = [],
  seenCount = 0,
  currentUserId,
  onDeleteMessage,
  onPlanChanged,
  onPlanDeleted,
  refreshToken = 0,
}: OnechatMessageListProps) {
  // Merge messages and plans chronologically
  const timelineItems = useMemo<ChatTimelineItem[]>(() => {
    const items: ChatTimelineItem[] = [];

    messages.forEach((m) => {
      items.push({
        id: `msg-${m.id}`,
        type: "message",
        time: new Date(m.createdAt).getTime(),
        message: m,
      });
    });

    plans.forEach((p) => {
      items.push({
        id: `plan-${p.id}`,
        type: "plan",
        time: new Date(p.createdAt).getTime(),
        plan: p,
      });
    });

    return items.sort((a, b) => a.time - b.time);
  }, [messages, plans]);

  const getDayLabel = (dateNum: number) => {
    const d = new Date(dateNum);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  const formatMessageTime = (dateNum: number) => {
    return new Date(dateNum).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const latestItemId = timelineItems[timelineItems.length - 1]?.id ?? null;
  const previousLatestItemId = useRef<string | null>(null);

  // Ensure the timeline scrolls down when the conversation loads or a new
  // message/plan arrives at the bottom. Loading older pages prepends items,
  // so the latest item ID stays the same and the viewport does not jump.
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    if (!loading) {
      const isInitial = previousLatestItemId.current === null;
      const hasNewLatestItem = latestItemId !== previousLatestItemId.current;

      if (timelineItems.length > 0 && (isInitial || hasNewLatestItem)) {
        el.scrollTop = el.scrollHeight;
      }

      previousLatestItemId.current = latestItemId;
    }

    const observer = new ResizeObserver(() => {
      // If user is near bottom (within 450px) or while content is initially loading, keep pinned to bottom
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distanceFromBottom < 450 || loading) {
        el.scrollTop = el.scrollHeight;
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, latestItemId, timelineItems.length, containerRef]);

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="oc-messages-timeline oc-scroll"
      role="log"
      aria-label="Messages timeline"
    >
      {loading && timelineItems.length === 0 ? (
        <ChatSkeleton />
      ) : timelineItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#71717a]">
          <div className="w-12 h-12 rounded-full border border-[var(--oc-border)] bg-[var(--oc-bg-surface)] flex items-center justify-center text-[var(--oc-accent)] mb-3">
            💬
          </div>
          <p className="text-sm font-medium text-[#f4f4f5]">Start a conversation</p>
          <p className="text-xs text-[#71717a] mt-1">Send a message below to begin chatting.</p>
        </div>
      ) : (
        <>
          {timelineItems.map((item, index) => {
            const previous = timelineItems[index - 1];
            const isNewDay =
              !previous ||
              new Date(previous.time).toDateString() !== new Date(item.time).toDateString();

            return (
              <React.Fragment key={item.id}>
                {/* Date Divider with horizontal line */}
                {isNewDay && (
                  <div className="flex items-center justify-center my-3">
                    <span className="px-3.5 py-1 rounded-full bg-[#181a1f] border border-[#22242a] text-[#9ba1a6] text-[11px] font-medium shadow-sm">
                      {getDayLabel(item.time)}
                    </span>
                  </div>
                )}

                {/* Render Dedicated Plan Card in Timeline */}
                {item.type === "plan" && item.plan ? (
                  <div className="w-full my-1">
                    <OnechatPlanCard
                      plan={item.plan}
                      currentUserId={currentUserId}
                      onPlanChanged={onPlanChanged}
                      onPlanDeleted={onPlanDeleted}
                      refreshToken={refreshToken}
                    />
                    <div className="text-[11px] text-[#71717a] mt-1 pl-1">
                      {formatMessageTime(item.time)}
                    </div>
                  </div>
                ) : item.type === "message" && item.message ? (
                  parseJamMessage(item.message.content) ? (
                    <div
                      className={`w-full my-2 flex flex-col ${
                        item.message.isMine ? "items-end" : "items-start"
                      }`}
                    >
                      <OnechatJamCard
                        station={parseJamMessage(item.message.content)!}
                        sender={item.message.sender}
                        isMine={item.message.isMine}
                        time={formatMessageTime(item.time)}
                      />
                      <div className="text-[11px] text-[#71717a] mt-1 px-1">
                        {formatMessageTime(item.time)}
                      </div>
                    </div>
                  ) : item.message.content.startsWith("Voice message") ||
                    item.message.content.startsWith("Voice note") ||
                    item.message.mimeType?.startsWith("audio/") ? (
                    <div
                      className={`w-full my-1 flex flex-col ${
                        item.message.isMine ? "items-end" : "items-start"
                      }`}
                    >
                      <VoiceMessagePlayer
                        id={item.message.id}
                        fileUrl={item.message.fileUrl}
                        content={item.message.content}
                        time={formatMessageTime(item.time)}
                        isMine={item.message.isMine}
                        status={item.message.status}
                        senderName={item.message.sender?.name}
                        isChannel={isChannel}
                      />
                    </div>
                  ) : (
                  /* Render Standard Message Bubble */
                  <div
                    className={`oc-msg-row ${
                      item.message.isMine ? "outgoing" : "incoming"
                    }`}
                  >
                    {/* Incoming Avatar on Left */}
                    {!item.message.isMine && (
                      <div className="w-8 h-8 rounded-full bg-[#1e2025] border border-[#26282f] text-xs font-bold text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5">
                        {(item.message.sender?.name || "A").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${
                        item.message.isMine ? "items-end" : "items-start"
                      } max-w-[78%]`}
                    >
                      {/* Sender name for channel messages */}
                      {isChannel && !item.message.isMine && (
                        <span className="text-[11px] font-semibold text-[#A78BFA] mb-1 pl-1">
                          {item.message.sender?.name || "Member"}
                        </span>
                      )}

                      {/* Rich Media Mockup Attachment or Bubble */}
                      {item.message.fileUrl &&
                      item.message.filePreviewUrl &&
                      isInlineImage(item.message.mimeType) ? (
                        <div
                          className={`p-1.5 rounded-[12px] shadow-sm overflow-hidden flex flex-col gap-2 max-w-sm border ${
                            item.message.isMine
                              ? "bg-[#6E53CC] border-[#7E64E0]/40 text-white rounded-br-[2px] shadow-[0_2px_10px_rgba(110,83,204,0.3)]"
                              : "bg-[#1F1F1F] border-[#333338] text-[#f0f2f5] rounded-bl-[2px]"
                          }`}
                        >
                          <div className="relative w-full h-44 rounded-[8px] overflow-hidden bg-[#24262c]">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${item.message.filePreviewUrl || item.message.fileUrl}`}
                              alt={item.message.fileName || "Image"}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c0e]/85 via-transparent to-transparent" />
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <ImageIcon size={16} className="text-[#A78BFA] shrink-0" />
                                <span className="text-xs text-white font-medium truncate">
                                  {item.message.fileName || "attachment.png"}
                                </span>
                              </div>
                              <span className="text-[11px] text-white/70 shrink-0 ml-2">
                                {formatFileSize(item.message.fileSize)}
                              </span>
                            </div>
                          </div>
                          {item.message.content && (
                            <div className="px-2 pb-1">
                              <p className="text-sm leading-relaxed">{item.message.content}</p>
                              <div className="flex justify-end items-center gap-1 mt-1">
                                <span
                                  className={`text-[11px] ${
                                    item.message.isMine ? "text-white/80" : "text-[#9ba1a6]"
                                  }`}
                                >
                                  {formatMessageTime(item.time)}
                                </span>
                                {item.message.isMine && (
                                  <CheckCheck size={14} className="text-white" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="oc-msg-bubble group">
                          {/* File Attachment Pill */}
                          {item.message.fileUrl && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#18181c] border border-[#25252b] mb-2">
                              <FileIcon size={18} className="text-[#f4f4f5] shrink-0" />
                              <div className="min-w-0 flex-1 text-xs">
                                <span className="block truncate font-medium text-[#f4f4f5]">
                                  {item.message.fileName || "Attachment"}
                                </span>
                                <span className="text-[#71717a]">
                                  {formatFileSize(item.message.fileSize)}
                                </span>
                              </div>
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL}${item.message.fileUrl}`}
                                download
                                className="p-1 text-[#a1a1aa] hover:text-[#f4f4f5]"
                              >
                                <Download size={15} />
                              </a>
                            </div>
                          )}

                          {/* Text Content with Inline Float Timestamp */}
                          <div className="oc-msg-body">
                            {item.message.content && (
                              <span className="oc-msg-text">
                                {item.message.content}
                              </span>
                            )}

                            <span className="oc-msg-meta">
                              <span className="oc-msg-time">
                                {formatMessageTime(item.time)}
                              </span>
                              {item.message.isMine && (
                                <span className="oc-msg-status">
                                  {item.message.status === "read" ? (
                                    <CheckCheck size={13} className="text-[#E9D5FF]" />
                                  ) : item.message.status === "delivered" ? (
                                    <CheckCheck size={13} className="opacity-90" />
                                  ) : (
                                    <Check size={13} className="opacity-75" />
                                  )}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )
                ) : null}
              </React.Fragment>
            );
          })}

          {/* Typing Indicator Bubble (Divriots Mobile Stack Style) */}
          {typingNames.length > 0 && (
            <div className="flex items-center gap-2 self-start my-2">
              <div className="bg-[#1e2025] border border-[#26282f] px-4 py-3 rounded-[18px] rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#8b90a0] animate-bounce [animation-delay:0ms] [animation-duration:900ms]" />
                <span className="w-2 h-2 rounded-full bg-[#8b90a0] animate-bounce [animation-delay:180ms] [animation-duration:900ms]" />
                <span className="w-2 h-2 rounded-full bg-[#8b90a0] animate-bounce [animation-delay:360ms] [animation-duration:900ms]" />
              </div>
              <span className="text-[11px] text-[#9ba1a6] italic font-medium">
                {typingNames.join(", ")} is typing...
              </span>
            </div>
          )}
        </>
      )}

      {/* Auto-scroll Anchor */}
      <div ref={endRef as React.RefObject<HTMLDivElement>} />
    </div>
  );
}

function isInlineImage(mimeType?: string): boolean {
  return [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/bmp",
  ].includes((mimeType || "").toLowerCase());
}

function formatFileSize(size?: number): string {
  if (typeof size !== "number") return "File";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function VoiceNoteMessage({
  content,
  time,
  isMine,
  status,
}: {
  content: string;
  time: string;
  isMine?: boolean;
  status?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className={`px-3.5 py-2.5 rounded-[12px] shadow-sm w-full max-w-sm ${
        isMine
          ? "bg-[#6E53CC] rounded-br-[2px] text-white shadow-[0_2px_10px_rgba(110,83,204,0.3)]"
          : "bg-[#1F1F1F] rounded-bl-[2px] border border-[#333338] text-[#f0f2f5]"
      }`}
    >
      <div className="flex items-center gap-3 relative">
        <div className="relative flex-shrink-0">
          <button
            type="button"
            aria-label={isPlaying ? "Pause audio note" : "Play audio note"}
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer ${
              isMine
                ? "bg-white text-[#6E53CC] hover:brightness-105"
                : "bg-[#6E53CC] text-white hover:brightness-110"
            }`}
          >
            {isPlaying ? (
              <Pause size={18} className="fill-current" />
            ) : (
              <Play size={20} className="fill-current ml-0.5" />
            )}
          </button>
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm text-[11px] ${
              isMine
                ? "bg-[#1F1F24] border border-[#333338] text-[#A78BFA]"
                : "bg-[#1F1F1F] border border-[#333338] text-[#22C55E]"
            }`}
          >
            <Mic size={11} />
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
          {/* Animated waveform bars */}
          <div className="flex items-center gap-[2.5px] h-7 px-0.5 mb-1">
            {[4, 8, 14, 8, 12, 18, 10, 16, 8, 6, 12, 16, 10, 18, 12, 14, 10, 12, 6, 8, 4].map(
              (h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-1 rounded-full transition-all ${
                    i < 10
                      ? isMine
                        ? "bg-white"
                        : "bg-[#6E53CC]"
                      : isMine
                      ? "bg-white/45"
                      : "bg-[#8b90a0]/40"
                  } ${isPlaying ? "animate-pulse" : ""}`}
                />
              )
            )}
          </div>

          <div
            className={`flex items-center justify-between px-0.5 text-xs ${
              isMine ? "text-white/90" : "text-[#9ba1a6]"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-wide text-[11px]">
                {isPlaying ? "0:24" : "0:14"}
              </span>
              <span className="w-1 h-1 rounded-full bg-current opacity-50 inline-block" />
              <span className="opacity-70 text-[11px]">0:42</span>
            </div>
            <span className="text-[10px] opacity-75">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
