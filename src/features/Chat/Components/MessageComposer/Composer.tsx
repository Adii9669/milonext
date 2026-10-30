"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, File as FileIcon, Image as ImageIcon, MapPin, Mic, Plus, SendHorizontal, Vote, X } from "lucide-react";

interface Props {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  connected: boolean;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  onPlan: () => void;
  onPlace: () => void;
}

export function MessageComposer({ input, setInput, onSend, connected, onUpload, uploading, onPlan, onPlace }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);
  const canSend = connected && Boolean(input.trim()) && !uploading;

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
      {uploadError && <p role="alert" className="px-3 pb-2 text-xs text-red-500">{uploadError}</p>}
      {toolsOpen && <div className="chat-composer-popover" aria-label="Quick message tools">
        <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}><FileIcon aria-hidden="true" />{uploading ? "Uploading…" : "Attach file"}</button>
        {[["Plan", "Plan: Saturday 7pm — ", CalendarDays], ["Poll", "Poll: ", Vote], ["Photo", "Photo: ", ImageIcon], ["Place", "Place: ", MapPin]].map(([label, value, Icon]) => {
          const ToolIcon = Icon as typeof CalendarDays;
          return <button key={label as string} type="button" onClick={() => { if (label === "Plan") onPlan(); else if (label === "Place") onPlace(); else setInput(value as string); setToolsOpen(false); }}><ToolIcon aria-hidden="true" />{label as string}</button>;
        })}
      </div>}
      <input ref={fileInputRef} type="file" disabled={uploading} className="hidden" aria-label="Choose a file to attach" onChange={async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        setUploadError("");
        if (file.size > 50 * 1024 * 1024) {
          setUploadError("Files must be 50 MB or smaller.");
          return;
        }
        try { await onUpload(file); setToolsOpen(false); }
        catch (error) { setUploadError(error instanceof Error ? error.message : "Upload failed. Please try again."); }
      }} />
      <div className="chat-composer-inner">
        <button type="button" className="chat-composer-plus" disabled={uploading} onClick={() => setToolsOpen((open) => !open)} aria-label={toolsOpen ? "Close message tools" : "Open message tools"} aria-expanded={toolsOpen}>
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
          disabled={!connected || uploading}
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
