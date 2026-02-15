"use client";

import { Friends } from "@/src/types/friends";
import { useFriendStore } from "@/src/app/stores/friendStore";

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
  // const { friends, loading } = useFriendStore();

  return (
    <div className="w-64 border-l border-gray-800 bg-gray-900 p-3 text-white">
      <h2 className="mb-3 text-sm font-semibold text-gray-400">Friends</h2>

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
    </div>
  );
}
