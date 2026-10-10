"use client";

import { useEffect, useRef } from "react";
import { CalendarDays, Image as ImageIcon, MapPin, Mic, Plus, SendHorizontal, Vote, X } from "lucide-react";
import { useState } from "react";

interface Props {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  connected: boolean;
}

export function MessageComposer({ input, setInput, onSend, connected }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const canSend = connected && Boolean(input.trim());

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  function send() {
    if (canSend) onSend();
  }

  return (
    <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
      {toolsOpen && <div className="chat-composer-popover" aria-label="Quick message tools">
        {[["Plan", "Plan: Saturday 7pm — ", CalendarDays], ["Poll", "Poll: ", Vote], ["Photo", "Photo: ", ImageIcon], ["Place", "Place: ", MapPin]].map(([label, value, Icon]) => {
          const ToolIcon = Icon as typeof CalendarDays;
          return <button key={label as string} type="button" onClick={() => { setInput(value as string); setToolsOpen(false); }}><ToolIcon aria-hidden="true" />{label as string}</button>;
        })}
      </div>}
      <div className="chat-composer-inner">
        <button type="button" className="chat-composer-plus" onClick={() => setToolsOpen((open) => !open)} aria-label={toolsOpen ? "Close message tools" : "Open message tools"} aria-expanded={toolsOpen}>
          {toolsOpen ? <X aria-hidden="true" /> : <Plus aria-hidden="true" />}
        </button>
        <div className="chat-composer-field">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder={connected ? "Message your people…" : "Connecting…"}
          disabled={!connected}
          rows={1}
          aria-label="Message"
          className="chat-composer-textarea"
        />
        <span className="chat-composer-mic" aria-hidden="true"><Mic /></span>
        <button type="submit" className="chat-composer-send" disabled={!canSend} aria-label="Send message">
          <SendHorizontal size={18} aria-hidden="true" />
        </button>
        </div>
      </div>
    </form>
  );
}
