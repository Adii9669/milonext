"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/src/types/messages";

export type WSMessage = {
    type: "dm" | "crew" ;
    sender_id?: string;
    receiver_id?: string;
    content: string;
};


export function useWebsocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);


    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/api/ws");
        wsRef.current = ws;

        ws.onopen = () => {

            setConnected(true);
            console.log("[WS] connected");
        }

        ws.onmessage = (e: MessageEvent<string>) => {
            try {
                const msg: WSMessage = JSON.parse(e.data);
                // Convert WSMessage to Message before adding to state
                const message: Message = {
                    id: crypto.randomUUID(),
                    type: msg.type,
                    content: msg.content,
                    createdAt: new Date().toISOString(),
                    isMine: false,
                    // Optionally, add sender_id/receiver_id if Message type supports them
                };
                setMessages((prev) => [...prev, message]);
            } catch {
                console.warn("[WS] invalid JSON:", e.data);
            }
        };
        ws.onerror = (err) => {
            console.error("[WS] error", err);
        };
        ws.onclose = () => ws.close();

        return () => ws.close();
    }, []);


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