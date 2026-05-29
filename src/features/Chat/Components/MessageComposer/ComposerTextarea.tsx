"use client";

import { useEffect, useRef } from "react";

interface Props {
  input: string;

  setInput: (value: string) => void;

  onSend: () => void;

  connected: boolean;
}

export function ComposerTextarea({
  input,

  setInput,

  onSend,

  connected,
}: Props) {
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
    <textarea
      ref={textareaRef}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={connected ? "Type anything..." : "Connecting..."}
      disabled={!connected}
      rows={1}
      className="
                min-block-size-24px
                max-block-size-40px
                flex-1
                resize-none 
                overflow-y-auto
                bg-transparent
                py-2
                px-4
                text-text-primary
                placeholder:text-text-muted
                outline-none
            "
    />
  );
}
