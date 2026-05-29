"use client";

import { Message } from "@/src/features/Chat/types/messages";
import ChatSkeleton from "@/src/features/Chat/loading/ChatSkeleton";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  endRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({
  messages,
  loading,
  containerRef,
  endRef,
}: MessageListProps) {
  return (
    <div
      ref={containerRef}
      className="chat-messages flex-1 min-h-0 overflow-y-auto p-4"
    >
      {loading && messages.length === 0 ? (
        <ChatSkeleton />
      ) : (
        <>
          {messages.map((m) => (
            <div key={m.id} className="mb-3">
              <span className="chat-message-sender">
                {m.isMine ? "You" : m.sender?.name || "Other"}:
              </span>{" "}
              <span>{m.content}</span>
              <span className="chat-message-meta ml-2 text-xs">
                {new Date(m.createdAt).toLocaleTimeString()}
              </span>
              {m.isMine && m.status && (
                <span className="chat-message-status ml-2 text-xs">
                  • {m.status}
                </span>
              )}
            </div>
          ))}
        </>
      )}

      <div ref={endRef} />
    </div>
  );
}
