"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/src/types/messages";
import { User } from "@/src/types/user";
import { useAuth } from "@/src/context/AuthContext";

export type WSMessage = {
    type: "dm" | "crew";
    sender_id?: string;
    receiver_id?: string;
    content: string;
    createdAt?: string;
};

export type IncomingWSPayload = {
    type?: "dm" | "crew";
    content?: string;
    createdAt?: string;
    senderID?: string;
    receiverID?: string;
    crewID?: string;
    Response?: {
        type: "dm" | "crew";
        content: string;
        createdAt: string;
    };
};

export function useWebsocket(user: User | null) {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const reconnectRef = useRef<number | null>(null);

    useEffect(() => {
        if (!user) return;

        const connect = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
                return;
            }
            const ws = new WebSocket("ws://localhost:8000/api/ws");
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                console.log("[WS] connected");
            };

            ws.onmessage = (e: MessageEvent<string>) => {
                try {
                    const payload: IncomingWSPayload = JSON.parse(e.data);

                    let type: "dm" | "crew" | undefined;
                    let content: string | undefined;
                    let createdAt: string | undefined;

                    if (payload.Response) {
                        type = payload.Response.type;
                        content = payload.Response.content;
                        createdAt = payload.Response.createdAt;
                    } else {
                        type = payload.type;
                        content = payload.content;
                        createdAt = payload.createdAt;
                    }

                    if (!type || !content) {
                        return;
                    }

                    const message: Message = {
                        id: crypto.randomUUID(),
                        type,
                        content,
                        createdAt: createdAt || new Date().toISOString(),
                        isMine: false,
                    };

                    setMessages((prev) => [...prev, message]);
                } catch (err) {
                    console.warn("[WS] invalid JSON:", e.data, err);
                }
            };

            ws.onerror = (err) => {
                console.warn("[WS] error", err);
            };

            ws.onclose = () => {
                setConnected(false);
                wsRef.current = null;
                console.log("[WS] closed");
                if (reconnectRef.current) {
                    window.clearTimeout(reconnectRef.current);
                }
                reconnectRef.current = window.setTimeout(() => {
                    connect();
                }, 1000);
            };
        };

        connect();

        return () => {
            if (reconnectRef.current) {
                window.clearTimeout(reconnectRef.current);
            }
            if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
                wsRef.current.close();
            }
        };
    }, [user]);

    function sendMessage(msg: Omit<WSMessage, "sender_id">) {
        const optimistic: Message = {
            id: crypto.randomUUID(),
            type: msg.type,
            content: msg.content,
            createdAt: new Date().toISOString(),
            isMine: true,
        };

        setMessages((prev) => [...prev, optimistic]);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        } else {
            console.warn("[WS] send failed, socket not open. Will retry when connected.");
            const retry = setInterval(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify(msg));
                    clearInterval(retry);
                }
            }, 500);
            setTimeout(() => clearInterval(retry), 5000);
        }
    }

    return { connected, messages, sendMessage };
}