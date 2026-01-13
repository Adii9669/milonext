"use client";

import { useEffect, useRef, useState } from "react";

export type WSMessage = {
    type: "dm" | "crew" | "system";
    sender_id?: string;
    receiver_id?: string;
    content: string;
};


export function useWebsocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<WSMessage[]>([]);


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
                setMessages((prev) => [...prev, msg]);
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
            wsRef.current.send(JSON.stringify(msg));
        }
    }
    return { connected, messages, sendMessage };
}