"use client";

import { useState, useRef, useEffect } from "react";
import { Crew } from "@/src/types/messages";
import { WSMessage } from "../useWebsocket";

export default function ChatComponent({
  crew,
  messages,
  sendMessage,
  connected,
}: {
  crew: Crew | null;
  messages: WSMessage[];
  connected: boolean;
  sendMessage: (msg: Omit<WSMessage, "sender_id">) => void;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!crew) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Select a crew
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b p-4 font-bold">{crew.name}</div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i}>
            {m.sender_id}: {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex p-4 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border px-2"
        />
        <button
          onClick={() => {
            sendMessage({
              type: "crew",
              receiver_id: crew.id,
              content: input,
            });
            setInput("");
          }}
        >
          Send
        </button>
      </div>
      <div>Connected: {connected ? "Yes" : "No"}</div>
    </div>
  );
}
