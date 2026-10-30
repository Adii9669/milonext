"use client";

import { useEffect, useState } from "react";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types";

export function useChatSelection({
  channels,
  friendsToShow,
  joinChannel,
  leaveChannel,
}: {
  channels: Channel[];
  friendsToShow: Friends[];
  joinChannel: (id: string) => void;
  leaveChannel: (id: string) => void;
}) {
  const [activeView, setActiveView] = useState<"dm" | "channel">("channel");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friends | null>(null);

  /* =========================
     Auto select
  ========================== */
  useEffect(() => {
    if (selectedChannel || selectedFriend) return;

    if (activeView === "dm") {
      if (friendsToShow.length > 0) {
        setSelectedFriend(friendsToShow[0]);
      }
      return;
    }

    if (channels.length > 0) {
      setSelectedChannel(channels[0]);
      return;
    }

    if (friendsToShow.length > 0) {
      setActiveView("dm");
      setSelectedFriend(friendsToShow[0]);
    }
  }, [activeView, channels, friendsToShow, selectedChannel, selectedFriend]);

  /* =========================
     Join / Leave channel
  ========================== */
  useEffect(() => {
    if (!selectedChannel) return;

    joinChannel(selectedChannel.id);

    return () => {
      leaveChannel(selectedChannel.id);
    };
  }, [selectedChannel, joinChannel, leaveChannel]);

  /* =========================
     Handlers
  ========================== */

  const handleSelectChannel = (channel: Channel) => {
    if (selectedChannel?.id === channel.id) return;

    if (selectedChannel) {
      leaveChannel(selectedChannel.id);
    }

    setActiveView("channel");
    setSelectedChannel(channel);
    setSelectedFriend(null);
    joinChannel(channel.id);
  };

  const handleSelectFriend = (friend: Friends) => {
    if (selectedChannel) {
      leaveChannel(selectedChannel.id);
    }

    setActiveView("dm");
    setSelectedFriend(friend);
    setSelectedChannel(null);
  };

  return {
    activeView,
    setActiveView,

    selectedChannel,
    setSelectedChannel,

    selectedFriend,
    setSelectedFriend,

    handleSelectChannel,
    handleSelectFriend,
  };
}