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
};


export function useWebsocket(user: User | null) {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);



    useEffect(() => {
        if (!user) return;

        // If already open, don't reconnect
        if (wsRef.current?.readyState === WebSocket.OPEN) {
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
                const msg: WSMessage = JSON.parse(e.data);

                const message: Message = {
                    id: crypto.randomUUID(),
                    type: msg.type,
                    content: msg.content,
                    createdAt: new Date().toISOString(),
                    isMine: false,
                };

                setMessages((prev) => [...prev, message]);
            } catch {
                console.warn("[WS] invalid JSON:", e.data);
            }
        };

        ws.onerror = () => {
            // ignore dev-only handshake cancel noise
        };

        ws.onclose = () => {
            setConnected(false);
            wsRef.current = null;
            console.log("[WS] closed");
        };

        return () => {
            if (
                ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING
            ) {
                ws.close();
            }
        };
    }, [user]);




    function sendMessage(msg: Omit<WSMessage, "sender_id">) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {

            const optimistic: Message = {
                id: crypto.randomUUID(),
                type: msg.type,
                content: msg.content,
                createdAt: new Date().toISOString(),
                isMine: true,
            };

            setMessages((prev) => [...prev, optimistic]);

            wsRef.current.send(JSON.stringify(msg));
        }
    }
    return { connected, messages, sendMessage };
}