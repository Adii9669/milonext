"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/features/Chat/types/messages";
import { chatApi } from "@/src/lib/api";
import { uploadChatFile } from "@/src/lib/files/api";
import { deleteChatMessage } from "@/src/features/Chat/api/messageApi";


interface UseChatLogicProps {
    channel: Channel | null;
    friend: Friends | null;
    messages: Message[];
    deletedMessageIds?: string[];
    sendMessage: (msg: any) => void;
    sendDelivered?: (messageId: string) => void;
    sendRead?: (messageId: string) => void;
}

export function useChatLogic({
    channel,
    friend,
    messages,
    deletedMessageIds = [],
    sendMessage,
    sendDelivered,
    sendRead,
}: UseChatLogicProps) {
    const [input, setInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [history, setHistory] = useState<Message[]>([]);
    const [locallyHiddenIds, setLocallyHiddenIds] = useState<string[]>([]);
    const [deleteError, setDeleteError] = useState("");
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null!);
    const endRef = useRef<HTMLDivElement>(null!);

    const previousLastMessageIdRef = useRef<string | null>(null);
    const activeChatKey = channel ? `channel:${channel.id}` : friend ? `dm:${friend.id}` : "";
    const activeChatKeyRef = useRef(activeChatKey);
    activeChatKeyRef.current = activeChatKey;
    const deliveredSentRef = useRef<Set<string>>(new Set());
    const readSentRef = useRef<Set<string>>(new Set());

    /* =========================
       Fetch Older Messages
    ========================== */
    const fetchOlder = async () => {
        if (!channel || !hasMore || loadingHistory || !cursor) return;

        setLoadingHistory(true);

        try {
            const res = await chatApi.getChannelHistory(channel.id, 50, cursor);
            setHistory((prev) => mergeMessages(prev, res.messages));
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
        if (!channel && !friend) {
            setHistory([]);
            return;
        }

        setHistory([]);
        setCursor(null);
        setHasMore(true);

        const fetchHistory = async () => {
            try {
                setLoadingHistory(true);

                if (channel) {
                    const msgs = await chatApi.getChannelHistory(channel.id);
                    setHistory((previous) => mergeMessages(previous, msgs.messages || []));
                    setCursor(msgs.nextCursor);
                    setHasMore(msgs.hasMore);
                } else if (friend) {
                    const msgs = await chatApi.getDmHistory(friend.id);
                    setHistory((previous) => mergeMessages(previous, msgs.messages || []));
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
    }, [channel?.id, friend?.id]);

    useEffect(() => {
        previousLastMessageIdRef.current = null;
    }, [channel?.id, friend?.id]);

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
        if (channel) {
            return messages.filter(
                (m) => m.type === "channel" && m.channelId === channel.id
            );
        }
        if (friend) {
            return messages.filter((m) => m.type === "dm" && (
                m.isMine ? m.receiverId === friend.id : m.sender?.id === friend.id
            ));
        }
        return [];
    }, [messages, channel, friend]);

    const allMessages = useMemo(() => {
        const historyIds = new Set(history.map((h) => h.id));
        const removedIds = new Set([...deletedMessageIds, ...locallyHiddenIds]);
        return [...history, ...filteredLive.filter((m) => !historyIds.has(m.id))]
            .filter((message) => !removedIds.has(message.id));
    }, [history, filteredLive, deletedMessageIds, locallyHiddenIds]);

    const removeMessage = async (messageId: string, scope: "me" | "everyone") => {
        setDeleteError("");
        try {
            await deleteChatMessage(messageId, scope);
            setLocallyHiddenIds((previous) => previous.includes(messageId) ? previous : [...previous, messageId]);
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Could not delete the message.");
            throw error;
        }
    };

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
    }, [allMessages, loadingHistory, channel?.id, friend?.id]);

    const handleUpload = async (file: File) => {
        if (!channel && !friend) throw new Error("Select a chat before attaching a file.");
        const targetKey = activeChatKey;
        const caption = input;
        setUploading(true);
        try {
            const message = await uploadChatFile(file, channel
                ? { type: "channel", channelId: channel.id }
                : { type: "dm", receiverId: friend!.id }, caption);
            if (activeChatKeyRef.current === targetKey) {
                setHistory((previous) => mergeMessages(previous, [{ ...message, isMine: true, status: "sent" }]));
                setInput("");
            }
        } finally {
            setUploading(false);
        }
    };

    /* =========================
       Send Message
    ========================== */
    const handleSend = () => {
        if (!input.trim()) return;

        if (channel) {
            sendMessage({
                type: "channel",
                channelId: channel.id,
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
        deleteError,
        removeMessage,
        loadingHistory,
        containerRef,
        endRef,
        handleSend,
        handleUpload,
        uploading,
    };
}
function mergeMessages(current: Message[], incoming: Message[]): Message[] {
    const byId = new Map(current.map((message) => [message.id, message]));
    for (const message of incoming) byId.set(message.id, { ...byId.get(message.id), ...message });
    return [...byId.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
