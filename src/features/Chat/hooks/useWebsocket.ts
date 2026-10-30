"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/src/features/Chat/types/messages";
import { User } from "@/src/types/user";

/* =========================
   Types
========================= */

export type OutgoingWSMessage =
  | { type: "dm"; receiverId: string; content: string }
  | { type: "channel_message"; channelId: string; content: string }
  | { type: "typing_start"; channelId: string }
  | { type: "typing_stop"; channelId: string }
  | { type: "join_channel"; channelId: string }
  | { type: "leave_channel"; channelId: string }
  | { type: "delivered"; messageId: string }
  | { type: "read"; messageId: string };

export type WSRequestMessage =
  | { type: "dm"; receiverId: string; content: string }
  | { type: "channel"; channelId: string; content: string };

export type WSMessageEvent = {
  event: "message";
  data: {
    id: string;
    type: "dm" | "channel";
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
    receiverId?: string | null;
    channelId?: string | null;
  };
};

export type WSMessageDeletedEvent = {
  event: "message.deleted";
  data: { messageId: string; senderId: string; receiverId?: string | null; channelId?: string | null };
};

export type PlanRealtimeEventName =
  | "plan.created"
  | "plan.response_changed"
  | "plan.updated"
  | "plan.confirmed"
  | "plan.cancelled"
  | "plan.status_changed"
  | "plan.poll_changed";

export type PlanRealtimeEvent = {
  event: PlanRealtimeEventName;
  data: {
    eventId: string;
    planId: string;
    channelId?: string;
    dmUserLowId?: string;
    dmUserHighId?: string;
  };
};

export type WSAckEvent = {
  event: "ack";
  data: {
    messageId: string;
    status: "sent" | "delivered" | "read";
  };
};

export type IncomingWS = WSMessageEvent | WSMessageDeletedEvent | WSAckEvent;

/* =========================
   Status Guard (FIX)
========================= */

const validStatuses = ["sent", "delivered", "read"] as const;
type MessageStatus = (typeof validStatuses)[number];

function isValidStatus(s: any): s is MessageStatus {
  return validStatuses.includes(s);
}

/* =========================
   Hook
========================= */

export function useWebsocket(user: User | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const outgoingQueue = useRef<OutgoingWSMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [deletedMessageIds, setDeletedMessageIds] = useState<string[]>([]);
  const [planEvents, setPlanEvents] = useState<PlanRealtimeEvent[]>([]);
  const [typing, setTyping] = useState<Record<string, string[]>>({});

  const reconnectRef = useRef<number | null>(null);
  const destroyedRef = useRef(false);
  const connectingRef = useRef(false);

  const typingTimeouts = useRef<Record<string, Record<string, number>>>({});
  const seenPlanEventIDs = useRef<Set<string>>(new Set());

  /* =========================
     Connect
  ========================== */

  useEffect(() => {
    if (!user) return;
    destroyedRef.current = false;

    if (connectingRef.current) return;
    connectingRef.current = true;

    const connect = () => {
      if (
        wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING
      ) {
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const WS_URL = API_URL.replace(/^http/, "ws");

      const ws = new WebSocket(`${WS_URL}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        connectingRef.current = false;

        while (
          outgoingQueue.current.length > 0 &&
          wsRef.current?.readyState === WebSocket.OPEN
        ) {
          const next = outgoingQueue.current.shift();
          if (next) wsRef.current.send(JSON.stringify(next));
        }
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const raw = JSON.parse(e.data);

          if (typeof raw.event === "string" && raw.event.startsWith("plan.") && raw.data?.eventId && raw.data?.planId) {
            const event = raw as PlanRealtimeEvent;
            if (!seenPlanEventIDs.current.has(event.data.eventId)) {
              seenPlanEventIDs.current.add(event.data.eventId);
              if (seenPlanEventIDs.current.size > 500) {
                const oldest = seenPlanEventIDs.current.values().next().value;
                if (oldest) seenPlanEventIDs.current.delete(oldest);
              }
              setPlanEvents((previous) => [...previous, event].slice(-200));
            }
            return;
          }

          if (raw.event === "message.deleted" && raw.data?.messageId) {
            const deletedId = String(raw.data.messageId);
            setDeletedMessageIds((previous) => previous.includes(deletedId) ? previous : [...previous, deletedId]);
            setMessages((previous) => previous.filter((message) => message.id !== deletedId));
            return;
          }

          /* =========================
             ACK EVENT (FIXED)
          ========================== */
          if (raw.event === "ack" && raw.data) {
            const { messageId, status } = raw.data;

            setMessages((prev) => {
              if (!isValidStatus(status)) return prev;

              const id = String(messageId);
              return prev.map((m) => (m.id === id ? { ...m, status } : m));
            });

            return;
          }

          /* =========================
             MESSAGE EVENT
          ========================== */
          if (raw.event === "message" && raw.data) {
            const m = raw.data;

            const message: Message = {
              id: m.id,
              type: m.type,
              content: m.content,
              createdAt: m.createdAt,
              isOptimistic: false,
              sender: m.sender,
              channelId: m.channelId ?? undefined,
              receiverId: m.receiverId ?? undefined,
              isMine: m.sender?.id === user?.id,
              status: "sent",
              fileUrl: m.fileUrl ?? undefined,
              filePreviewUrl: m.filePreviewUrl ?? undefined,
              fileName: m.fileName ?? undefined,
              fileSize: m.fileSize ?? undefined,
              mimeType: m.mimeType ?? undefined,
            };

            setMessages((prev) => {
              if (prev.some((existing) => existing.id === message.id)) return prev;
              if (message.isMine) {
                const idx = prev.findIndex(
                  (p) =>
                    p.isMine &&
                    p.content === message.content &&
                    (!p.sender || !p.sender.id) &&
                    Math.abs(
                      new Date(p.createdAt).getTime() -
                        new Date(message.createdAt).getTime(),
                    ) < 60000,
                );

                if (idx !== -1) {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], ...message };
                  return copy;
                }

                return [...prev, message];
              }
              return [...prev, message];
            });

            return;
          }

          /* =========================
             STATUS (LEGACY FIXED)
          ========================== */
          if (raw.type === "message.status") {
            const messageId = raw.message_id || raw.messageId;
            const status = raw.status;

            if (messageId && isValidStatus(status)) {
              const id = String(messageId);

              setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, status } : m)),
              );
            }

            return;
          }
        } catch (err) {
          console.warn("[WS] invalid JSON:", e.data, err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        connectingRef.current = false;
        wsRef.current = null;

        if (destroyedRef.current) return;

        reconnectRef.current = window.setTimeout(connect, 1000);
      };
    };

    connect();

    return () => {
      destroyedRef.current = true;

      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
      }

      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        wsRef.current.close();
      }
    };
  }, [user]);

  /* =========================
     Send Helpers
  ========================== */

  const sendOutgoing = (outgoing: OutgoingWSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(outgoing));
      return true;
    }

    outgoingQueue.current.push(outgoing);
    return false;
  };

  function sendMessage(msg: WSRequestMessage) {
    const outgoing: OutgoingWSMessage =
      msg.type === "channel"
        ? { type: "channel_message", channelId: msg.channelId, content: msg.content }
        : { type: "dm", receiverId: msg.receiverId, content: msg.content };

    const optimistic: Message = {
      id: crypto.randomUUID(),
      type: msg.type,
      content: msg.content,
      createdAt: new Date().toISOString(),
      isMine: true,
      isOptimistic: true,
      channelId: msg.type === "channel" ? msg.channelId : undefined,
      receiverId: msg.type === "dm" ? msg.receiverId : undefined,
      status: "sent",
    };

    setMessages((prev) => [...prev, optimistic]);

    if (!sendOutgoing(outgoing)) {
      const retry = window.setInterval(() => {
        if (sendOutgoing(outgoing)) clearInterval(retry);
      }, 500);

      window.setTimeout(() => clearInterval(retry), 5000);
    }
  }

  function sendDelivered(messageId: string) {
    sendOutgoing({ type: "delivered", messageId });
  }

  function sendRead(messageId: string) {
    sendOutgoing({ type: "read", messageId });
  }
  function joinChannel(channelId: string) {
    sendOutgoing({ type: "join_channel", channelId });
  }

  function leaveChannel(channelId: string) {
    sendOutgoing({ type: "leave_channel", channelId });
  }

  function startTyping(channelId: string) {
    sendOutgoing({ type: "typing_start", channelId });
  }

  function stopTyping(channelId: string) {
    sendOutgoing({ type: "typing_stop", channelId });
  }

  function getTypingUsers(channelId: string) {
    return typing[channelId] || [];
  }

  return {
    connected,
    messages,
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
