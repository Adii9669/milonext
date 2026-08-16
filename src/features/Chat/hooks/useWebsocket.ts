"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/src/features/Chat/types/messages";
import { User } from "@/src/types/user";

/* =========================
   Types
========================= */

export type OutgoingWSMessage =
  | { type: "dm"; receiverId: string; content: string }
  | { type: "crew_message"; crewId: string; content: string }
  | { type: "typing_start"; crewId: string }
  | { type: "typing_stop"; crewId: string }
  | { type: "join_crew"; crewId: string }
  | { type: "leave_crew"; crewId: string }
  | { type: "delivered"; messageId: string }
  | { type: "read"; messageId: string };

export type WSRequestMessage =
  | { type: "dm"; receiverId: string; content: string }
  | { type: "crew"; crewId: string; content: string };

export type WSMessageEvent = {
  event: "message";
  data: {
    id: string;
    type: "dm" | "crew";
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
    receiverId?: string | null;
    crewId?: string | null;
  };
};

export type WSAckEvent = {
  event: "ack";
  data: {
    messageId: string;
    status: "sent" | "delivered" | "read";
  };
};

export type IncomingWS = WSMessageEvent | WSAckEvent;

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
  const [typing, setTyping] = useState<Record<string, string[]>>({});

  const reconnectRef = useRef<number | null>(null);
  const destroyedRef = useRef(false);
  const connectingRef = useRef(false);

  const typingTimeouts = useRef<Record<string, Record<string, number>>>({});

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

      const ws = new WebSocket("ws://localhost:8000/api/ws");
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

          /* =========================
             ACK EVENT (FIXED)
          ========================== */
          if (raw.event === "ack" && raw.data) {
            const { messageId, status } = raw.data;

            setMessages((prev) => {
              if (!isValidStatus(status)) return prev;

              const id = String(messageId);
              return prev.map((m) =>
                m.id === id ? { ...m, status } : m
              );
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
              sender: m.sender,
              crewId: m.crewId ?? undefined,
              isMine: m.sender?.id === user?.id,
              status: "sent",
            };

            if (message.isMine) {
              setMessages((prev) => {
                const idx = prev.findIndex(
                  (p) =>
                    p.isMine &&
                    p.content === message.content &&
                    (!p.sender || !p.sender.id) &&
                    Math.abs(
                      new Date(p.createdAt).getTime() -
                      new Date(message.createdAt).getTime()
                    ) < 60000
                );

                if (idx !== -1) {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], ...message };
                  return copy;
                }

                return [...prev, message];
              });
            } else {
              setMessages((prev) => [...prev, message]);
            }

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
                prev.map((m) =>
                  m.id === id ? { ...m, status } : m
                )
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
      msg.type === "crew"
        ? { type: "crew_message", crewId: msg.crewId, content: msg.content }
        : { type: "dm", receiverId: msg.receiverId, content: msg.content };

    const optimistic: Message = {
      id: crypto.randomUUID(),
      type: msg.type,
      content: msg.content,
      createdAt: new Date().toISOString(),
      isMine: true,
      crewId: msg.type === "crew" ? msg.crewId : undefined,
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
  function joinCrew(crewId: string) {
    sendOutgoing({ type: "join_crew", crewId });
  }

  function leaveCrew(crewId: string) {
    sendOutgoing({ type: "leave_crew", crewId });
  }

  function startTyping(crewId: string) {
    sendOutgoing({ type: "typing_start", crewId });
  }

  function stopTyping(crewId: string) {
    sendOutgoing({ type: "typing_stop", crewId });
  }

  function getTypingUsers(crewId: string) {
    return typing[crewId] || [];
  }

  return {
    connected,
    messages,
    sendMessage,
    joinCrew,
    leaveCrew,
    sendDelivered,
    sendRead,
    startTyping,
    stopTyping,
    typing,
    getTypingUsers,
  };
}