"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types/friends";
import { Message, PaginatedMessages } from "@/src/features/Chat/types/messages";
import { chatApi } from "@/src/lib/api";
import { uploadChatFile } from "@/src/lib/files/api";
import { deleteChatMessage } from "@/src/features/Chat/api/messageApi";

const HISTORY_PAGE_SIZE = 50;
const HISTORY_STALE_TIME = 5 * 60_000;
const HISTORY_CACHE_TIME = 30 * 60_000;

type HistoryData = InfiniteData<PaginatedMessages, string | null>;

interface UseChatLogicProps {
    channel: Channel | null;
    friend: Friends | null;
    currentUser?: { id?: string } | null;
    messages: Message[];
    deletedMessageIds?: string[];
    sendMessage: (msg: any) => void;
    sendDelivered?: (messageId: string) => void;
    sendRead?: (messageId: string) => void;
}

export function useChatLogic({
    channel,
    friend,
    currentUser,
    messages,
    deletedMessageIds = [],
    sendMessage,
    sendDelivered,
    sendRead,
}: UseChatLogicProps) {
    const queryClient = useQueryClient();
    const [input, setInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [locallyHiddenIds, setLocallyHiddenIds] = useState<string[]>([]);
    const [deleteError, setDeleteError] = useState("");

    const containerRef = useRef<HTMLDivElement>(null!);
    const endRef = useRef<HTMLDivElement>(null!);

    const previousLastMessageIdRef = useRef<string | null>(null);
    const activeChatKey = channel ? `channel:${channel.id}` : friend ? `dm:${friend.id}` : "";
    const activeChatKeyRef = useRef(activeChatKey);
    useEffect(() => {
      activeChatKeyRef.current = activeChatKey;
    }, [activeChatKey]);
    const deliveredSentRef = useRef<Set<string>>(new Set());
    const readSentRef = useRef<Set<string>>(new Set());

    const userId = currentUser?.id;
    const chatType = channel ? "channel" : friend ? "dm" : "none";
    const chatId = channel?.id ?? friend?.id ?? "none";

    // One cache entry per user + conversation. Switching back reads the data
    // instantly instead of clearing the screen and waiting for the network.
    const historyKey = useMemo(
        () => ["chat-history", userId ?? "anonymous", chatType, chatId] as const,
        [userId, chatType, chatId]
    );

    const historyQuery = useInfiniteQuery({
        queryKey: historyKey,
        queryFn: ({ pageParam }) => {
            const cursor = pageParam ?? undefined;
            if (channel) {
                return chatApi.getChannelHistory(channel.id, HISTORY_PAGE_SIZE, cursor);
            }
            if (friend) {
                return chatApi.getDmHistory(friend.id, HISTORY_PAGE_SIZE, cursor);
            }
            return Promise.resolve({
                messages: [],
                nextCursor: null,
                hasMore: false,
            } satisfies PaginatedMessages);
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) =>
            lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
        enabled: Boolean(userId && chatId !== "none"),
        staleTime: HISTORY_STALE_TIME,
        gcTime: HISTORY_CACHE_TIME,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
    });

    // Pages are fetched newest-page-first, but each page is oldest→newest.
    // Flatten and sort so the UI always has one chronological list.
    const history = useMemo(() => {
        const pages = historyQuery.data?.pages ?? [];
        return mergeMessages(
            [],
            pages.flatMap((page) => page.messages ?? [])
        );
    }, [historyQuery.data]);

    const loadingHistory = historyQuery.isLoading;

    /* =========================
       Fetch Older Messages
    ========================== */
    const fetchOlder = useCallback(() => {
        if (chatId === "none" || !historyQuery.hasNextPage || historyQuery.isFetchingNextPage) {
            return;
        }

        historyQuery.fetchNextPage().catch((err) => {
            console.error("Failed to fetch older messages", err);
        });
    }, [
        chatId,
        historyQuery.fetchNextPage,
        historyQuery.hasNextPage,
        historyQuery.isFetchingNextPage,
    ]);

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
            if (el.scrollTop <= 0) {
                fetchOlder();
            }
        };

        el.addEventListener("scroll", handleScroll, { passive: true });
        return () => el.removeEventListener("scroll", handleScroll);
    }, [fetchOlder]);

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

    const removedIds = useMemo(
        () => new Set([...deletedMessageIds, ...locallyHiddenIds]),
        [deletedMessageIds, locallyHiddenIds]
    );

    // Confirmed WebSocket messages are written into the same React Query
    // caches the history queries use. Optimistic messages stay out of the
    // cache until the server assigns them a real ID.
    const confirmedLive = useMemo(
        () => messages.filter((m) => !m.isOptimistic && !removedIds.has(m.id)),
        [messages, removedIds]
    );

    useEffect(() => {
        if (!userId) return;

        const groups = new Map<string, { key: readonly unknown[]; messages: Message[] }>();
        for (const message of confirmedLive) {
            const key = historyKeyForMessage(userId, message);
            if (!key) continue;

            const groupId = JSON.stringify(key);
            const group = groups.get(groupId) ?? { key, messages: [] };
            group.messages.push(message);
            groups.set(groupId, group);
        }

        for (const { key, messages: batch } of groups.values()) {
            const current = queryClient.getQueryData<HistoryData>(key);
            if (!current) continue;

            const next = patchHistory(current, batch);
            if (next !== current) {
                queryClient.setQueryData(key, next);
            }
        }
    }, [confirmedLive, historyKey, historyQuery.dataUpdatedAt, queryClient, userId]);

    // A delete should disappear from every cached conversation for this user,
    // not just the one that happens to be on screen.
    useEffect(() => {
        if (!userId || removedIds.size === 0) return;

        queryClient.setQueriesData<HistoryData>(
            { queryKey: ["chat-history", userId] },
            (current) => (current ? removeMessagesFromHistory(current, removedIds) : current)
        );
    }, [queryClient, removedIds, userId]);

    const allMessages = useMemo(() => {
        return mergeMessages(history, filteredLive).filter(
            (message) => !removedIds.has(message.id)
        );
    }, [history, filteredLive, removedIds]);

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

        const isInitial = previousLastMessageIdRef.current === null;
        const shouldScroll =
            isInitial ||
            previousLastMessageIdRef.current !== lastMessageId;

        if (shouldScroll) {
            if (isInitial) {
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                } else {
                    endRef.current?.scrollIntoView({ behavior: "auto" });
                }
            } else {
                endRef.current?.scrollIntoView({ behavior: "smooth" });
            }
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

    const handleUpload = async (file: File, captionOverride?: string) => {
        if (!channel && !friend) throw new Error("Select a chat before attaching a file.");
        const targetKey = activeChatKey;
        const caption = captionOverride !== undefined ? captionOverride : input;
        setUploading(true);
        try {
            const message = await uploadChatFile(file, channel
                ? { type: "channel", channelId: channel.id }
                : { type: "dm", receiverId: friend!.id }, caption);
            if (activeChatKeyRef.current === targetKey) {
                const uploaded: Message = { ...message, isMine: true, status: "sent" };
                queryClient.setQueryData<HistoryData>(historyKey, (old) =>
                    old ? patchHistory(old, [uploaded]) : old
                );
                if (captionOverride === undefined) {
                    setInput("");
                }
            }
            return message;
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

function historyKeyForMessage(userId: string, message: Message): readonly unknown[] | null {
    if (message.type === "channel" && message.channelId) {
        return ["chat-history", userId, "channel", message.channelId];
    }

    if (message.type === "dm") {
        const partnerId = message.isMine ? message.receiverId : message.sender?.id;
        if (partnerId) {
            return ["chat-history", userId, "dm", partnerId];
        }
    }

    return null;
}

function patchHistory(data: HistoryData, incoming: Message[]): HistoryData {
    if (incoming.length === 0 || data.pages.length === 0) return data;

    const pending = new Map(incoming.map((message) => [message.id, message]));
    let changed = false;

    const pages = data.pages.map((page) => {
        let pageChanged = false;
        const messages = page.messages.map((existing) => {
            const patch = pending.get(existing.id);
            if (!patch) return existing;

            pending.delete(existing.id);
            const status = patch.status ?? existing.status;
            if (status === existing.status) return existing;

            pageChanged = true;
            return { ...existing, status };
        });

        if (!pageChanged) return page;
        changed = true;
        return { ...page, messages };
    });

    // Messages that are not in the cache yet belong to the newest page.
    if (pending.size > 0 && pages.length > 0) {
        const newestPage = pages[0];
        pages[0] = {
            ...newestPage,
            messages: mergeMessages(newestPage.messages, [...pending.values()]),
        };
        changed = true;
    }

    return changed ? { ...data, pages } : data;
}

function removeMessagesFromHistory(data: HistoryData, removedIds: Set<string>): HistoryData {
    let changed = false;

    const pages = data.pages.map((page) => {
        const messages = page.messages.filter((message) => !removedIds.has(message.id));
        if (messages.length === page.messages.length) return page;

        changed = true;
        return { ...page, messages };
    });

    return changed ? { ...data, pages } : data;
}
