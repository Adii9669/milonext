"use client";

import React, { useMemo } from "react";
import { Download, File as FileIcon, MoreHorizontal, Trash2, Check, CheckCheck } from "lucide-react";
import { Message } from "@/src/features/Chat/types/messages";
import { Plan } from "@/src/features/Chat/types/plans";
import ChatSkeleton from "@/src/features/Chat/loading/ChatSkeleton";
import { OnechatPlanCard } from "./OnechatPlanCard";
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
          <div className="w-12 h-12 rounded-full border border-[#25252b] bg-[#17171b] flex items-center justify-center text-[#3b82f6] mb-3">
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
                  <div className="oc-date-badge-wrap">
                    <span className="oc-date-badge">
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
                      refreshToken={refreshToken}
                    />
                    <div className="text-[11px] text-[#71717a] mt-1 pl-1">
                      {formatMessageTime(item.time)}
                    </div>
                  </div>
                ) : item.type === "message" && item.message ? (
                  /* Render Standard Message Bubble */
                  <div
                    className={`oc-msg-row ${
                      item.message.isMine ? "outgoing" : "incoming"
                    }`}
                  >
                    {/* Incoming Avatar on Left */}
                    {!item.message.isMine && (
                      <div className="w-8 h-8 rounded-full bg-[#17171b] border border-[#25252b] text-xs font-bold text-[#f4f4f5] flex items-center justify-center shrink-0 mt-0.5">
                        {(item.message.sender?.name || "A").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${
                        item.message.isMine ? "items-end" : "items-start"
                      } max-w-[75%]`}
                    >
                      {/* Sender name for channel messages */}
                      {isChannel && !item.message.isMine && (
                        <span className="text-[11px] font-semibold text-[#3b82f6] mb-1 pl-1">
                          {item.message.sender?.name || "Member"}
                        </span>
                      )}

                      <div className="oc-msg-bubble group">
                        {/* Inline Image or File Attachment */}
                        {item.message.fileUrl &&
                        item.message.filePreviewUrl &&
                        isInlineImage(item.message.mimeType) ? (
                          <div className="mb-2 rounded-lg overflow-hidden border border-[#25252b]">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}${item.message.filePreviewUrl}`}
                              alt={item.message.fileName || "Image"}
                              loading="lazy"
                              className="max-h-60 w-auto object-cover rounded-md"
                            />
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL}${item.message.fileUrl}`}
                              download
                              className="inline-flex items-center gap-1.5 text-xs text-[#f4f4f5] p-1.5 hover:underline"
                            >
                              <Download size={13} />
                              <span>Download</span>
                            </a>
                          </div>
                        ) : item.message.fileUrl ? (
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
                        ) : null}

                        {/* Text Content with Inline Float Timestamp (WhatsApp reference layout) */}
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
                                  <CheckCheck size={13} className="text-[#60a5fa]" />
                                ) : item.message.status === "delivered" ? (
                                  <CheckCheck size={13} className="opacity-80" />
                                ) : (
                                  <Check size={13} className="opacity-60" />
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}

          {/* Typing Indicator */}
          {typingNames.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-[#3b82f6] py-1 px-2 italic">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-bounce [animation-delay:0.4s]" />
              </span>
              <span>{typingNames.join(", ")} is typing…</span>
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
