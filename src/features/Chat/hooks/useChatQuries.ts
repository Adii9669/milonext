"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Channel } from "@/src/types/channel";
import { Friends } from "@/src/types";
import {
  channelApi,
  friendApi,
} from "@/src/lib/api";

export function useChatQueries(user: any, selectedChannel: Channel | null) {
  const queryClient = useQueryClient();

  

  /* =========================
     FRIENDS
  ========================== */
  const { data: friends = [], isLoading: friendsLoading } = useQuery<Friends[]>(
    {
      queryKey: ["friends", user?.id],
      queryFn: friendApi.getFriends,
      enabled: !!user,
    }
  );

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ["friendRequests", "incoming"],
    queryFn: async () => {
      const res = await friendApi.getFriendRequests("incoming");
      if (!res) return [];
      if (Array.isArray(res.send)) return res.send;
      if (Array.isArray(res)) return res;
      return [];
    },
    enabled: !!user,
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["friendRequests", "outgoing"],
    queryFn: async () => {
      const res = await friendApi.getFriendRequests("outgoing");
      if (!res) return [];
      if (Array.isArray(res.send)) return res.send;
      if (Array.isArray(res)) return res;
      return [];
    },
    enabled: !!user,
  });

  /* =========================
     CHANNELS
  ========================== */
  // const { data: channels = [], isLoading: channelsLoading } = useQuery({
  //   queryKey: ["channels", user?.id],
  //   queryFn: channelApi.getChannels,
  //   enabled: !!user,
  // });

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const res = await channelApi.getChannels();
      return res.channels ?? []; // 🔥 normalize here
    },
  });

  /* =========================
     CHANNEL MEMBERS
  ========================== */
  const { data: channelMembers = [], isLoading: channelMembersLoading } = useQuery({
    queryKey: ["channelMembers", selectedChannel?.id],
    queryFn: async () => {
      if (!selectedChannel) return [];
      const res = await channelApi.getChannelMembers(selectedChannel.id);
      return res.members || [];
    },
    enabled: !!selectedChannel,
  });

  /* =========================
     MUTATIONS
  ========================== */

  const createChannelMutation = useMutation({
    mutationFn: channelApi.createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels", user?.id] });
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: channelApi.deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels", user?.id] });
    },
  });

  const addChannelMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      if (!selectedChannel) throw new Error("Channel not selected");
      return channelApi.addChannelMember(selectedChannel.id, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMembers", selectedChannel?.id],
      });
    },
  });

  const removeChannelMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      if (!selectedChannel) throw new Error("Channel not selected");
      return channelApi.removeChannelMember(selectedChannel.id, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMembers", selectedChannel?.id],
      });
    },
  });

  const updateChannelRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) => {
      if (!selectedChannel) throw new Error("Channel not selected");
      return channelApi.updateChannelMemberRole(selectedChannel.id, memberId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMembers", selectedChannel?.id],
      });
    },
  });

  /* =========================
     DERIVED DATA
  ========================== */

  const combinedFriends = [
    ...friends.map((f) => ({ ...f, status: "accepted" as const })),
    ...incomingRequests.map((r: any) => ({ ...r, status: "pending" as const })),
    ...outgoingRequests.map((r: any) => ({ ...r, status: "pending" as const })),
  ];

  const uniqueFriendsMap = new Map<string, Friends>();
  combinedFriends.forEach((f) => {
    if (!uniqueFriendsMap.has(f.id) || f.status === "accepted") {
      uniqueFriendsMap.set(f.id, f);
    }
  });

  const friendsToShow = Array.from(uniqueFriendsMap.values());

  return {
    friendsToShow,
    friendsLoading,
    incomingRequests,
    outgoingRequests,

    channels,
    channelsLoading,

    channelMembers,
    channelMembersLoading,

    createChannel: createChannelMutation.mutate,
    deleteChannel: deleteChannelMutation.mutate,
    addChannelMember: addChannelMemberMutation.mutate,
    removeChannelMember: removeChannelMemberMutation.mutate,
    updateChannelRole: updateChannelRoleMutation.mutate,
  };
}
