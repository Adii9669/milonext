"use client";

import { useRef, useEffect } from "react";
import { SendHorizonal } from "lucide-react";

interface Props {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  connected: boolean;
}

export function MessageInput({ input, setInput, onSend, connected }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [input]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className=" px-5   py-2  ">
      <div
        className=" mx-auto flex items-end justify-content gap-3 
        rounded-md"
      >
        <textarea
          ref={textareaRef}
          value={input}
          className="flex-1 h-10 py-2 px-4
          min-h-24px
          max-h-40  
          resize-none --background 
          overflow-y-auto
          bg-transparent leading-5 text-foreground
          placeholder:text-text-muted
          outline-none 
           rounded-md bg-background/80 backdrop-blur text-foreground focus:ring-0 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? "Type anything..." : "Connecting..."}
          disabled={!connected}
          rows={1}
        />

        <button
          onClick={onSend}
          disabled={!input.trim() || !connected}
          className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary
                        text-primary-foreground
                        transition-all
                        duration-200
                        hover:scale-105
                        hover:bg-primary-hover
                        disabled:opacity-40
                        disabled:hover:scale-100
                    "
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}
