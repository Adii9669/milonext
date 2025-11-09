"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/src/context/page";
import { Crew } from "@/src/types";

export interface Message {
  content: string;
  userID: string;
  username: string;
}

export default function ChatComponent({ crew }: { crew: Crew | null }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🧠 1️⃣ Setup WebSocket when crew changes
  useEffect(() => {
    if (!crew) {
      // Crew deleted or unselected → cleanup everything
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setMessages([]);
      return;
    }

    // New crew selected → create a new socket connection
    const ws = new WebSocket(`ws://localhost:8000/ws?crewId=${crew.id}`);

    ws.onopen = () => console.log(`Connected to crew: ${crew.name}`);
    ws.onmessage = (event) => {
      try {
        const receivedMessage: Message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      } catch (err) {
        console.error("Invalid message data", err);
      }
    };
    ws.onclose = () => console.log(`Disconnected from crew: ${crew.name}`);

    setSocket(ws);

    // Cleanup previous connection when crew changes
    return () => {
      ws.close();
      setSocket(null);
      setMessages([]);
    };
  }, [crew?.id]); // ✅ depend on crew.id only

  // 2️⃣ Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3️⃣ Send message
  const sendMessage = () => {
    if (socket && input.trim() && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ content: input }));
      setInput("");
    }
  };

  // 4️⃣ If no crew is selected, show empty state
  if (!crew) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 text-lg">
        Select a crew to start chatting.
      </div>
    );
  }

  // ✅ 5️⃣ Main chat UI
  return (
    <div className="flex h-full flex-col rounded-lg bg-white shadow-md">
      <h2 className="border-b p-4 text-2xl font-bold">Chat in: {crew.name}</h2>

      {/* Message Display Area */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat ${
                msg.userID === user?.id ? "chat-end" : "chat-start"
              }`}
            >
              <div
                className={`chat-bubble ${
                  msg.userID === user?.id ? "chat-bubble-primary" : ""
                }`}
              >
                {msg.userID !== user?.id && (
                  <div className="mb-1 font-bold">{msg.username}</div>
                )}
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex items-center border-t p-4">
        <input
          type="text"
          placeholder="Type a message..."
          className="input input-bordered flex-grow"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="btn btn-primary ml-4">
          Send
        </button>
      </div>
    </div>
  );
}
