"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/src/types/messages";
import { User } from "@/src/types/user";

export type OutgoingWSMessage =
    | { type: "dm"; receiverId: string; content: string }
    | { type: "crew_message"; crewId: string; content: string }
    | { type: "typing"; crewId: string }
    | { type: "join_crew"; crewId: string }
    | { type: "leave_crew"; crewId: string };

export type WSRequestMessage =
    | { type: "dm"; receiverId: string; content: string }
    | { type: "crew"; crewId: string; content: string };

// export type IncomingWSPayload = {
//     type?: string;
//     message_id?: string;
//     status?: string;
//     id?: string;
//     content?: string;
//     createdAt?: string;
//     isMine?: boolean;
//     sender?: {
//         id: string;
//         name: string;
//     };
//     crewId?: string;
//     Response?: {
//         id: string;
//         type: "dm" | "crew" | "crew_message";
//         content: string;
//         createdAt: string;
//         isMine?: boolean;
//         sender?: {
//             id: string;
//             name: string;
//         };
//         crewId?: string;
//     };
// };
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
        status: "sent" | "delivered";
    };
};

export type IncomingWS = WSMessageEvent | WSAckEvent;


export function useWebsocket(user: User | null) {
    const wsRef = useRef<WebSocket | null>(null);
    const outgoingQueue = useRef<OutgoingWSMessage[]>([]);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const reconnectRef = useRef<number | null>(null);
    const destroyedRef = useRef(false);
    const connectingRef = useRef(false);



    useEffect(() => {
        if (!user) return;
        destroyedRef.current = false;
        if (connectingRef.current) return;
        connectingRef.current = true;


        const connect = () => {
            if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
                return;
            }
            const ws = new WebSocket("ws://localhost:8000/api/ws");
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                connectingRef.current = false;

                console.log("[WS] connected");
                while (outgoingQueue.current.length > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                    const next = outgoingQueue.current.shift();
                    if (next) {
                        wsRef.current.send(JSON.stringify(next));
                    }
                }
            };

            ws.onmessage = (e: MessageEvent<string>) => {
                try {
                    const payload: IncomingWS = JSON.parse(e.data);

                    if (payload.event === "ack") {
                        console.log("[WS] ack", payload.data.messageId, payload.data.status);
                        return;
                    }

                    if (payload.event === "message") {
                        const m = payload.data;

                        const message: Message = {
                            id: m.id,
                            type: m.type,
                            content: m.content,
                            createdAt: m.createdAt,
                            sender: m.sender,
                            crewId: m.crewId ?? undefined,
                            isMine: m.sender.id === user?.id,
                        };

                        setMessages((prev) => [...prev, message]);
                    }
                } catch (err) {
                    console.warn("[WS] invalid JSON:", e.data, err);
                }
            };
            

            ws.onerror = (err) => {
                console.warn("[WS] error", err);
            };

            ws.onclose = () => {
                setConnected(false);
                connectingRef.current = false;

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
            destroyedRef.current = true;
            if (reconnectRef.current) {
                window.clearTimeout(reconnectRef.current);
            }
            if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
                wsRef.current.close();
            }
        };
    }, [user]);

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
        };

        setMessages((prev) => [...prev, optimistic]);

        if (!sendOutgoing(outgoing)) {
            console.warn("[WS] send failed, socket not open. Will retry when connected.");
            const retry = window.setInterval(() => {
                if (sendOutgoing(outgoing)) {
                    window.clearInterval(retry);
                }
            }, 500);
            window.setTimeout(() => window.clearInterval(retry), 5000);
        }
    }

    function joinCrew(crewId: string) {
        sendOutgoing({ type: "join_crew", crewId });
    }

    function leaveCrew(crewId: string) {
        sendOutgoing({ type: "leave_crew", crewId });
    }

    return { connected, messages, sendMessage, joinCrew, leaveCrew };
}
