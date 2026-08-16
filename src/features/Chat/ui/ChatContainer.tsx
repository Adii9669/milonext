"use client";

import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useChatLogic } from "@/src/hooks/useChatLogic";
import { ChatHeader } from "@/src/features/Chat/ui/ChatHeader";
import { MessageList } from "@/src/features/Chat/ui/MessageList";
import { MessageComposer } from "../Components/MessageComposer/Composer";

interface SendMessagePayload {
  type: "crew" | "dm";
  crewId?: string;
  receiverId?: string;
  content: string;
}

interface ChatContainerProps {
  crew: Crew | null;
  friend: Friends | null;
  messages: Message[];
  sendMessage: (msg: SendMessagePayload) => void;
  connected: boolean;
  sendDelivered?: (messageId: string) => void;
  sendRead?: (messageId: string) => void;
}

export default function ChatContainer({
  crew,
  friend,
  messages,
  sendMessage,
  connected,
  sendDelivered,
  sendRead,
}: ChatContainerProps) {
  const { logout } = useAuth();

  const {
    input,
    setInput,
    allMessages,
    loadingHistory,
    containerRef,
    endRef,
    handleSend,
  } = useChatLogic({
    crew,
    friend,
    messages,
    sendMessage,
    sendDelivered,
    sendRead,
  });

  if (!crew && !friend) {
    return (
      <div className="chat-empty flex flex-1 items-center justify-center">
        Select a chat
      </div>
    );
  }

  return (
    <div className="chat-container flex h-full min-h-0 flex-col">
      <ChatHeader crew={crew} friend={friend} logout={logout} />

      <MessageList
        messages={allMessages}
        loading={loadingHistory}
        containerRef={containerRef}
        endRef={endRef}
      />

      <MessageComposer
        input={input}
        setInput={setInput}
        onSend={handleSend}
        connected={connected}
      />
    </div>
  );
}
