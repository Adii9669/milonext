"use client";

import { useEffect, useRef } from "react";

import { Plus, SendHorizonal, Smile } from "lucide-react";

interface Props {
  input: string;

  setInput: (value: string) => void;

  onSend: () => void;

  connected: boolean;
}

export function MessageComposer({ input, setInput, onSend, connected }: Props) {
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
    <div className="chat-composer px-4 py-4">
      {/* Attachment Preview Area */}

      <div className="mb-3 hidden"></div>

      {/* Main Composer */}
      <div
        className="
                    chat-composer-inner
                    flex
                    items-end
                    gap-2
                    px-4
                    py-3
                    transition-all
                    duration-200"
      >
        {/* Left Actions */}

        <div
          className="
                        flex
                        items-center
                        gap-2
                    "
        >
          {/* Upload */}
          <button
            type="button"
            className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            text-text-secondary
                            transition-all
                            duration-200
                            hover:bg-surface-hover
                            hover:text-text-primary
                        "
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Textarea */}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? "Type anything..." : "Connecting..."}
          disabled={!connected}
          rows={1}
          className="
                        min-h-24px
                        max-h-40
                        flex-1
                        resize-none
                        overflow-y-auto
                        bg-transparent
                        pb-3
                        leading-2
                        text-text-primary
                        placeholder:text-text-muted
                        outline-none
                    "
        />

        {/* Right Actions */}

        <div className="flex items-center gap-2">
          {/* Emoji */}
          <button
            type="button"
            className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            text-text-secondary
                            transition-all
                            duration-200
                            hover:bg-surface-hover
                            hover:text-text-primary
                        "
          >
            <Smile size={20} />
          </button>

          {/* Send */}

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
                            disabled:opacity-40
                            disabled:hover:scale-100
                        "
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
