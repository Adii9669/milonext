"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types";
import {
  crewApi,
  friendApi,
  userApi,
} from "@/src/lib/api";

export function useChatQueries(user: any, selectedCrew: Crew | null) {
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
     CREWS
  ========================== */
  // const { data: crews = [], isLoading: crewsLoading } = useQuery({
  //   queryKey: ["crews", user?.id],
  //   queryFn: crewApi.getCrews,
  //   enabled: !!user,
  // });

  const { data: crews = [], isLoading: crewsLoading } = useQuery({
    queryKey: ["crews"],
    queryFn: async () => {
      const res = await crewApi.getCrews();
      return res.crews ?? []; // 🔥 normalize here
    },
  });

  /* =========================
     USERS (for adding members)
  ========================== */
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await userApi.getUsers();
      return res.users || [];
    },
    enabled: !!user,
  });

  /* =========================
     CREW MEMBERS
  ========================== */
  const { data: crewMembers = [], isLoading: crewMembersLoading } = useQuery({
    queryKey: ["crewMembers", selectedCrew?.id],
    queryFn: async () => {
      if (!selectedCrew) return [];
      const res = await crewApi.getCrewMembers(selectedCrew.id);
      return res.members || [];
    },
    enabled: !!selectedCrew,
  });

  /* =========================
     MUTATIONS
  ========================== */

  const createCrewMutation = useMutation({
    mutationFn: crewApi.createCrew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crews", user?.id] });
    },
  });

  const deleteCrewMutation = useMutation({
    mutationFn: crewApi.deleteCrew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crews", user?.id] });
    },
  });

  const addCrewMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      if (!selectedCrew) throw new Error("Crew not selected");
      return crewApi.addCrewMember(selectedCrew.id, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["crewMembers", selectedCrew?.id],
      });
    },
  });

  const removeCrewMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      if (!selectedCrew) throw new Error("Crew not selected");
      return crewApi.removeCrewMember(selectedCrew.id, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["crewMembers", selectedCrew?.id],
      });
    },
  });

  const updateCrewRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) => {
      if (!selectedCrew) throw new Error("Crew not selected");
      return crewApi.updateCrewMemberRole(selectedCrew.id, memberId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["crewMembers", selectedCrew?.id],
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

    crews,
    crewsLoading,

    users,
    crewMembers,
    crewMembersLoading,

    createCrew: createCrewMutation.mutate,
    deleteCrew: deleteCrewMutation.mutate,
    addCrewMember: addCrewMemberMutation.mutate,
    removeCrewMember: removeCrewMemberMutation.mutate,
    updateCrewRole: updateCrewRoleMutation.mutate,
  };
}