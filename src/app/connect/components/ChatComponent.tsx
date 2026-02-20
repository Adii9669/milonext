"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/types/messages";
import { getCrewHistory, getDmHistory } from "@/src/lib/api";
import { User } from "@/src/types/user";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import ChatSkeleton from "./loading/ChatSkleton";

export default function ChatComponent({
  crew,
  friend,
  messages,
  sendMessage,
  connected,
  currentUser,
}: {
  crew: Crew | null;
  friend: Friends | null;
  messages: Message[];
  connected: boolean;
  sendMessage: (msg: any) => void;
  currentUser: User | null;
}) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchOlder = async () => {
    if (!crew || !hasMore || loadingHistory || !cursor) return;

    setLoadingHistory(true);

    try {
      const res = await getCrewHistory(crew.id, 50, cursor);

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
     Fetch History
  ========================== */
  useEffect(() => {
    if (!crew && !friend) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        if (crew) {
          const msgs = await getCrewHistory(crew.id);
          // setHistory(msgs || []);
          setHistory(msgs.messages);
          setCursor(msgs.nextCursor);
          setHasMore(msgs.hasMore);
        } else if (friend) {
          const msgs = await getDmHistory(friend.id);
          setHistory(msgs || []);
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
     Filter Live Messages
  ========================== */
  const filteredLive = useMemo(() => {
    if (crew) {
      return messages.filter((m) => m.type === "crew");
    }
    if (friend) {
      return messages.filter((m) => m.type === "dm");
    }
    return [];
  }, [messages, crew, friend]);

  /* =========================
     Merge History + Live
  ========================== */
  const allMessages = useMemo(() => {
    const historyIds = new Set(history.map((h) => h.id));
    return [...history, ...filteredLive.filter((m) => !historyIds.has(m.id))];
  }, [history, filteredLive]);

  /* =========================
     Auto Scroll
  ========================== */
  useEffect(() => {
    if (!loadingHistory) {
      endRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [filteredLive.length]);

  /* =========================
     Send Message (Optimistic)
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

  if (!crew && !friend) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Select a chat
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b p-4 font-bold">{crew?.name || friend?.name}</div>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
        {loadingHistory && history.length === 0 ? (
          <ChatSkeleton />
        ) : (
          <>
            {/* Small loader for pagination or refresh */}
            {loadingHistory && history.length > 0 && (
              <div className="text-center text-sm text-gray-400 mb-2">
                Loading older messages...
              </div>
            )}
            {allMessages.map((m) => (
              <div key={m.id} className="mb-2">
                <span className="font-semibold">
                  {/* {m.isMine ? "You" : m.sender?.name}: */}
                  {m.isMine ? "You" : m.sender?.name}

                  {/* {(m.isMine || m.sender?.id === currentUser?.id) ? "You:" : m.sender?.name || "Other"} */}
                </span>{" "}
                {m.content}
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </>
        )}

        <div ref={endRef} />
      </div>

      <div className="flex p-3 border-t gap-2">
        <Input
          value={input}
          variant="retro"
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <div className="flex p-2">
          <Button className="h-10" onClick={handleSend} disabled={!connected}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
