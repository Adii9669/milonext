"use client";

import { useWebsocket } from "./useWebsocket";
import { User } from "@/src/types/user";



export function useChatRealtime(user: User | null) {
  const {
    connected,
    messages,
    deletedMessageIds,
    planEvents,
    sendMessage,
    joinChannel,
    leaveChannel,
    sendDelivered,
    sendRead,
    startTyping,
    stopTyping,
    typing,
    getTypingUsers,
  } = useWebsocket(user) as any;

  return {
    connected,
    messages,
    deletedMessageIds,
    planEvents,
    sendMessage,
    joinChannel,
    leaveChannel,
    sendDelivered,
    sendRead,
    startTyping,
    stopTyping,
    typing,
    getTypingUsers,
  };
}
