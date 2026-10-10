"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { chatApi } from "@/src/lib/api";


interface UseChatLogicProps {
    crew: Crew | null;
    friend: Friends | null;
    messages: Message[];
    sendMessage: (msg: any) => void;
    sendDelivered?: (messageId: string) => void;
    sendRead?: (messageId: string) => void;
}

export function useChatLogic({
    crew,
    friend,
    messages,
    sendMessage,
    sendDelivered,
    sendRead,
}: UseChatLogicProps) {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<Message[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null!);
    const endRef = useRef<HTMLDivElement>(null!);

    const previousLastMessageIdRef = useRef<string | null>(null);
    const deliveredSentRef = useRef<Set<string>>(new Set());
    const readSentRef = useRef<Set<string>>(new Set());

    /* =========================
       Fetch Older Messages
    ========================== */
    const fetchOlder = async () => {
        if (!crew || !hasMore || loadingHistory || !cursor) return;

        setLoadingHistory(true);

        try {
            const res = await chatApi.getCrewHistory(crew.id, 50, cursor);
            setHistory((prev) => [...res.messages, ...prev]);
            setCursor(res.nextCursor);
            setHasMore(res.hasMore);
        } catch (err) {
            console.error("Failed to fetch older messages", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    /* =========================
       Initial History Fetch
    ========================== */
    useEffect(() => {
        if (!crew && !friend) {
            setHistory([]);
            return;
        }

        setHistory([]);
        setCursor(null);
        setHasMore(true);

        const fetchHistory = async () => {
            try {
                setLoadingHistory(true);

                if (crew) {
                    const msgs = await chatApi.getCrewHistory(crew.id);
                    setHistory(msgs.messages || []);
                    setCursor(msgs.nextCursor);
                    setHasMore(msgs.hasMore);
                } else if (friend) {
                    const msgs = await chatApi.getDmHistory(friend.id);
                    setHistory(msgs.messages || []);
                    setCursor(msgs.nextCursor);
                    setHasMore(msgs.hasMore);
                }
            } catch (err) {
                console.error("History fetch failed:", err);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [crew?.id, friend?.id]);

    useEffect(() => {
        previousLastMessageIdRef.current = null;
    }, [crew?.id, friend?.id]);

    /* =========================
       Infinite Scroll
    ========================== */
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
            if (el.scrollTop === 0) {
                fetchOlder();
            }
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [cursor, hasMore, loadingHistory]);

    /* =========================
       Live Messages Merge
    ========================== */
    const filteredLive = useMemo(() => {
        if (crew) {
            return messages.filter(
                (m) => m.type === "crew" && m.crewId === crew.id
            );
        }
        if (friend) {
            return messages.filter((m) => m.type === "dm");
        }
        return [];
    }, [messages, crew, friend]);

    const allMessages = useMemo(() => {
        const historyIds = new Set(history.map((h) => h.id));
        return [...history, ...filteredLive.filter((m) => !historyIds.has(m.id))];
    }, [history, filteredLive]);

    /* =========================
       Auto Scroll + Read/Delivered
    ========================== */
    useEffect(() => {
        if (loadingHistory) return;

        const lastMessageId =
            allMessages.length > 0
                ? allMessages[allMessages.length - 1].id
                : null;

        const shouldScroll =
            previousLastMessageIdRef.current === null ||
            previousLastMessageIdRef.current !== lastMessageId;

        if (shouldScroll) {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        if (shouldScroll) {
            allMessages.forEach((m) => {
                if (
                    !m.isMine &&
                    m.id &&
                    sendDelivered &&
                    !deliveredSentRef.current.has(m.id)
                ) {
                    sendDelivered(m.id);
                    deliveredSentRef.current.add(m.id);
                }

                if (
                    !m.isMine &&
                    m.id &&
                    sendRead &&
                    !readSentRef.current.has(m.id)
                ) {
                    sendRead(m.id);
                    readSentRef.current.add(m.id);
                }
            });
        }

        previousLastMessageIdRef.current = lastMessageId;
    }, [allMessages, loadingHistory, crew?.id, friend?.id]);

    /* =========================
       Send Message
    ========================== */
    const handleSend = () => {
        if (!input.trim()) return;

        if (crew) {
            sendMessage({
                type: "crew",
                crewId: crew.id,
                content: input,
            });
        } else if (friend) {
            sendMessage({
                type: "dm",
                receiverId: friend.id,
                content: input,
            });
        }

        setInput("");
    };

    return {
        input,
        setInput,
        allMessages,
        loadingHistory,
        containerRef,
        endRef,
        handleSend,
    };
}