"use client";

import { useState } from "react";
import { Friends } from "@/src/types/friends";

interface FriendsSidebarProps {
  friends: Friends[];
  selectedFriend: Friends | null;
  onSelectFriend: (friend: Friends) => void;
  friendsLoading: boolean;
}

export default function FriendsSidebar({
  friends,
  selectedFriend,
  onSelectFriend,
  friendsLoading
}: FriendsSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`flex h-full flex-col border-l border-gray-800 bg-gray-900 text-white transition-all ${
        collapsed ? "w-12 p-2" : "w-64 p-3"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        {!collapsed ? (
          <>
            <h2 className="text-sm font-semibold text-gray-400">Friends</h2>
            <button
              className="rounded-md border border-gray-600 p-1 text-xs text-gray-300 hover:bg-gray-700"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse friends sidebar"
            >
              ←
            </button>
          </>
        ) : (
          <button
            className="rounded-md border border-gray-600 p-1 text-xs text-gray-300 hover:bg-gray-700"
            onClick={() => setCollapsed(false)}
            aria-label="Expand friends sidebar"
          >
            →
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          {friendsLoading && (
            <div className="text-sm text-gray-500">Loading friends...</div>
          )}

          {!friendsLoading && friends.length === 0 && (
            <div className="text-sm text-gray-500">No friends yet</div>
          )}

          <div className="space-y-2">
            {friends.map((friend) => {
              const isSelected = selectedFriend?.id === friend.id;

              return (
                <div
                  key={friend.id}
                  onClick={() => onSelectFriend(friend)}
                  className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors ${
                    isSelected ? "bg-blue-600" : "hover:bg-blue-800"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{friend.name}</span>
                    <span className="text-xs text-gray-400">{friend.status}</span>
                  </div>

                  {/* status dot */}
                  <span
                    className={`h-2 w-2 rounded-full ${
                      friend.status === "accepted"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
