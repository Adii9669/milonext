"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types/friends";

interface Member {
  id?: string;
  name?: string;
  username?: string;
  status?: string;
  role?: string;
  user?: { id?: string; name?: string; username?: string; status?: string };
}

interface ChatDetailsPanelProps {
  crew: Crew | null;
  friend: Friends | null;
  members?: Member[];
}

export function ChatDetailsPanel({ crew, friend, members = [] }: ChatDetailsPanelProps) {
  const [muted, setMuted] = useState(false);
  const displayMembers = members.length ? members : crew ? [{ id: "crew", name: crew.name }] : [];
  const crewInitials = (crew?.name || friend?.name || "UC").split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  return (
    <aside className="chat-details-panel" aria-label="Conversation details">
      {crew ? (
        <>
          <div className="chat-crew-summary">
            <span className="chat-crew-monogram">{crewInitials}</span>
            <h2>{crew.name}</h2>
            <p>{members.length || "—"} members · {crew.role === "owner" ? "created by you" : "crew conversation"}</p>
          </div>
          <div className="chat-details-actions">
            <button type="button" onClick={() => setMuted((value) => !value)}>{muted ? "Unmute" : "Mute"}</button>
            <Link href="/friend-requests"><UserPlus aria-hidden="true" />Invite</Link>
          </div>

          <p className="chat-details-eyebrow">Members</p>
          <div className="chat-members-list">
            {displayMembers.map((member, index) => {
              const name = member.name || member.user?.name || member.username || member.user?.username || "Member";
              const status = member.status || member.user?.status || (index === 0 && crew.role === "owner" ? "Admin" : "");
              return <div className="chat-member-row" key={member.id || member.user?.id || `${name}-${index}`}><span>{name.slice(0, 1).toUpperCase()}</span><p>{name}</p><small>{status}</small></div>;
            })}
          </div>

          <section className="chat-shared-media"><div><p className="chat-details-eyebrow">Shared media</p><span>See all</span></div><div className="chat-media-placeholders" aria-label="Shared media preview"><i /><i /><i /></div></section>
          <button className="chat-leave-button" type="button" disabled>Leave crew</button>
        </>
      ) : (
        <section className="chat-upcoming-card">
          <p className="chat-details-eyebrow">About this chat</p>
          <h2>{friend?.name || "Your friend"}</h2>
          <p>Just the two of you, catching up.</p>
        </section>
      )}
    </aside>
  );
}
