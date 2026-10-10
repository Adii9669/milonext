"use client";

import { Message } from "@/src/features/Chat/types/messages";
import ChatSkeleton from "@/src/features/Chat/loading/ChatSkeleton";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  endRef: React.RefObject<HTMLDivElement>;
  isCrew?: boolean;
  typingNames?: string[];
  seenCount?: number;
}

export function MessageList({
  messages,
  loading,
  containerRef,
  endRef,
  isCrew = false,
  typingNames = [],
  seenCount = 0,
}: MessageListProps) {
  const dayLabel = (value: string) => {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  };

  return (
    <div ref={containerRef} className="chat-messages flex-1 min-h-0 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
      {loading && messages.length === 0 ? (
        <ChatSkeleton />
      ) : (
        <>
          {messages.map((m, index) => {
            const date = new Date(m.createdAt);
            const previous = messages[index - 1];
            const startsNewDay = !previous || new Date(previous.createdAt).toDateString() !== date.toDateString();
            const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
            return (
              <div key={m.id}>
                {startsNewDay && (
                  <div className="chat-day-divider" aria-label={dayLabel(m.createdAt)}>
                    <span />{dayLabel(m.createdAt)} {date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}<span />
                  </div>
                )}
                <div className={`chat-message-row ${m.isMine ? "is-mine" : "is-theirs"}`}>
                  <div className={`chat-message-stack ${m.isMine ? "items-end" : "items-start"}`}>
                    {isCrew && !m.isMine && <p className="chat-message-author">{m.sender?.name || "A crew member"}</p>}
                    <div className={`chat-bubble ${m.isMine ? "chat-bubble-sent" : "chat-bubble-received"}`}>
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.45]">{m.content}</p>
                    </div>
                    <p className="chat-message-meta">
                      {m.isMine && m.status === "read" ? `${seenCount > 0 ? `Seen by ${seenCount}` : "Seen"} · ${time}` : m.isMine && m.status ? `${m.status} · ${time}` : time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {typingNames.length > 0 && <div className="chat-typing-indicator"><span /><span /><span /><em>{typingNames[0]} is typing</em></div>}
        </>
      )}

      <div ref={endRef} />
    </div>
  );
}
