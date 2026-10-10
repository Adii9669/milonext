"use client";

import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useChatLogic } from "@/src/hooks/useChatLogic";
import { ChatHeader } from "@/src/features/Chat/ui/ChatHeader";
import { MessageList } from "@/src/features/Chat/ui/MessageList";
import { MessageComposer } from "../Components/MessageComposer/Composer";
import { CalendarDays, Image as ImageIcon, MapPin, Pin, Vote } from "lucide-react";

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
  currentUser?: unknown;
  typing?: unknown;
  getTypingUsers?: (crewId: string) => string[];
  startTyping?: () => void;
  stopTyping?: () => void;
  onBack?: () => void;
  crewMembers?: Array<{ name?: string; username?: string; user?: { name?: string; username?: string } }>;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function ChatContainer({
  crew,
  friend,
  messages,
  sendMessage,
  connected,
  sendDelivered,
  sendRead,
  getTypingUsers,
  onBack,
  crewMembers = [],
  sidebarOpen = true,
  onToggleSidebar,
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
  const typingNames = crew ? getTypingUsers?.(crew.id) ?? [] : [];

  if (!crew && !friend) {
    return (
      <div className="chat-empty flex flex-1 items-center justify-center">
        Select a chat
      </div>
    );
  }

  return (
    <div className="chat-container flex h-full min-h-0 flex-col">
      <ChatHeader
        crew={crew}
        friend={friend}
        logout={logout}
        onBack={onBack}
        members={crewMembers}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
      />

      {crew && <div className="chat-pinned-plan"><Pin aria-hidden="true" className="size-4" /><span><strong>Pinned:</strong> Saturday 7pm at the café</span><b>3 going</b></div>}

      <MessageList
        messages={allMessages}
        loading={loadingHistory}
        containerRef={containerRef}
        endRef={endRef}
        isCrew={Boolean(crew)}
        typingNames={typingNames}
        seenCount={crew ? Math.max(crewMembers.length - 1, 0) : 0}
      />

      {crew && <div className="chat-composer-tools" aria-label="Quick message tools">
        <button type="button" onClick={() => setInput("Plan: Saturday 7pm — ")}><CalendarDays aria-hidden="true" />Plan</button>
        <button type="button" onClick={() => setInput("Poll: ")}><Vote aria-hidden="true" />Poll</button>
        <button type="button" onClick={() => setInput("Photo: ")}><ImageIcon aria-hidden="true" />Photo</button>
        <button type="button" onClick={() => setInput("Place: ")}><MapPin aria-hidden="true" />Place</button>
      </div>}

      <MessageComposer
        input={input}
        setInput={setInput}
        onSend={handleSend}
        connected={connected}
      />
    </div>
  );
}
