"use client";

import { Friends } from "@/src/types/friends";

interface Props {
  friends: Friends[];
  selectedFriend: Friends | null;
  onSelectFriend: (f: Friends) => void;
  friendsLoading?: boolean;
}

export default function FriendsSidebar({ friends, selectedFriend, onSelectFriend, friendsLoading }: Props) {
  if (friendsLoading) {
    return (
      <div className="w-80 border-l border-border bg-surface p-4">
        <div>Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="w-60 border-l border-border bg-surface  p-4">
      <div className="mb-8 font-semibold text-text-primary">Friends</div>
      {friends.length === 0 && <div className="text-sm text-text-muted">No friends yet</div>}
      <div className="space-y-7">
        {friends.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              console.log("Friend clicked:", f);
              onSelectFriend(f);
            }}
            style={{
              backgroundColor:
                selectedFriend?.id === f.id ? "var(--primary)" : "transparent",
              color: selectedFriend?.id === f.id ? "var(--primary-foreground)" : "var(--text-primary)",
            }}
            className={`w-full text-left cursor-pointer rounded-md p-2 hover:bg-primary
              hover:text-primary-foreground
              transition`}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{f.name}</div>
              <div className="text-xs text-text-muted">{f.status || "unknown"}</div>
            </div>
            {/* <div className="text-xs text-text-muted">{f.email}</div> */}
          </button>
        ))}
      </div>
    </div>
  );
}
