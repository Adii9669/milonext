"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";
import { Message } from "@/src/types/messages";
import { getCrewHistory, getDmHistory } from "@/src/lib/api";

export default function ChatComponent({
  crew,
  friend,
  messages,
  sendMessage,
  connected,
}: {
  crew: Crew | null;
  friend: Friends | null;
  messages: Message[];
  connected: boolean;
  sendMessage: (msg: any) => void;
}) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

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
        if (crew) {
          const msgs = await getCrewHistory(crew.id);
          setHistory(msgs || []);
        } else if (friend) {
          const msgs = await getDmHistory(friend.id);
          setHistory(msgs || []);
        }
      } catch (err) {
        console.error("History fetch failed:", err);
      }
    };

    fetchHistory();
  }, [crew?.id, friend?.id]);

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
    return [
      ...history,
      ...filteredLive.filter((m) => !historyIds.has(m.id)),
    ];
  }, [history, filteredLive]);

  /* =========================
     Auto Scroll
  ========================== */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

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
      <div className="border-b p-4 font-bold">
        {crew?.name || friend?.name}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {allMessages.map((m) => (
          <div key={m.id} className="mb-2">
            <span className="font-semibold">
              {/* {m.isMine ? "You" : m.sender?.name}: */}
              {m.isMine ? "You" : m.sender?.name || "Other"}:
            </span>{" "}
            {m.content}
            <span className="ml-2 text-xs text-gray-400">
              {new Date(m.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex p-4 border-t gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button onClick={handleSend} disabled={!connected}>
          Send
        </button>
      </div>
    </div>
  );
}
