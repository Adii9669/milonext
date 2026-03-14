"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

import { useAuth } from "@/src/context/AuthContext";
import { Crew } from "@/src/types/crew";
import { getCrews, getFriends, getFriendRequests, getCrewMembers, addCrewMember, removeCrewMember, updateCrewMemberRole, getUsers } from "@/src/lib/api";

import ChatComponent from "./components/ChatComponent";
import { useWebsocket } from "../../hooks/useWebsocket";
import FriendsSidebar from "./components/FriendsSidebar";
import { Friends } from "@/src/types";
import CrewSidebar from "./components/CrewSidebar";
import CrewMembersSidebar from "./components/CrewMembersSidebar";
import EmptyState from "./components/EmptyState";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import {
  createCrew as apiCreateCrew,
  deleteCrew as apiDeleteCrew,
} from "@/src/lib/api";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";

export default function ChatPage() {
  const { logout, user, loading: authLoading } = useAuth();
  const { connected, messages, sendMessage } = useWebsocket(user);
  const URL = "/";
  useProtectedRoute(URL);

  //For the react query mutations,
  //we can use the useMutation hook to handle the create and delete operations for crews.
  //This will allow us to easily manage the loading and error states for these operations,
  //as well as automatically invalidate the relevant queries to keep our UI in sync with the server.
  const queryClient = useQueryClient();

  const createCrewMutation = useMutation({
    mutationFn: apiCreateCrew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crews", user?.id] });
    },
  });
  const deleteCrewMutation = useMutation({
    mutationFn: apiDeleteCrew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crews", user?.id] });
    },
  });

  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friends | null>(null);
  const [showMembersPanel, setShowMembersPanel] = useState(true);
  const [newMemberId, setNewMemberId] = useState<string>("");

  type CrewMember = { userID: string; role: string };
  type UserItem = { id: string; name: string; email: string };

  //For friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery<Friends[]>({
    queryKey: ["friends", user?.id],
    queryFn: getFriends,
    enabled: !!user,
  });

  const { data: incomingRequests = [] as Friends[], isLoading: incomingLoading } = useQuery({
    queryKey: ["friendRequests", "incoming"],
    queryFn: async () => {
      const res = await getFriendRequests("incoming");
      if (!res) return [] as Friends[];
      if (Array.isArray(res.send)) return res.send as Friends[];
      if (Array.isArray(res)) return res as Friends[];
      return [] as Friends[];
    },
    enabled: !!user,
  });

  const { data: outgoingRequests = [] as Friends[], isLoading: outgoingLoading } = useQuery({
    queryKey: ["friendRequests", "outgoing"],
    queryFn: async () => {
      const res = await getFriendRequests("outgoing");
      if (!res) return [] as Friends[];
      if (Array.isArray(res.send)) return res.send as Friends[];
      if (Array.isArray(res)) return res as Friends[];
      return [] as Friends[];
    },
    enabled: !!user,
  });

  const { data: users = [] as UserItem[] } = useQuery<UserItem[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await getUsers();
      return (res.users || []) as UserItem[];
    },
    enabled: !!user,
  });

  const { data: crewMembers = [], isLoading: crewMembersLoading } = useQuery<CrewMember[]>({
    queryKey: ["crewMembers", selectedCrew?.id],
    queryFn: async () => {
      if (!selectedCrew) return [] as CrewMember[];
      const res = await getCrewMembers(selectedCrew.id);
      return (res.members || []) as CrewMember[];
    },
    enabled: !!selectedCrew,
  });

  const addCrewMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      if (!selectedCrew) throw new Error("Crew not selected");
      return addCrewMember(selectedCrew.id, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewMembers", selectedCrew?.id] });
      setNewMemberId("");
    },
  });

  const removeCrewMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      if (!selectedCrew) throw new Error("Crew not selected");
      return removeCrewMember(selectedCrew.id, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewMembers", selectedCrew?.id] });
    },
  });

  const updateCrewRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) => {
      if (!selectedCrew) throw new Error("Crew not selected");
      return updateCrewMemberRole(selectedCrew.id, memberId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewMembers", selectedCrew?.id] });
    },
  });

  const combinedFriends = [
    ...friends.map((f) => ({ ...f, status: "accepted" as const })),
    ...incomingRequests.map((r) => ({ ...r, status: "pending" as const })),
    ...outgoingRequests.map((r) => ({ ...r, status: "pending" as const })),
  ];

  const uniqueFriendsMap = new Map<string, Friends>();
  combinedFriends.forEach((f) => {
    if (!uniqueFriendsMap.has(f.id) || f.status === "accepted") {
      uniqueFriendsMap.set(f.id, f);
    }
  });
  const friendsToShow = Array.from(uniqueFriendsMap.values());

  //For crews
  const { data: crews = [], isLoading: crewsLoading } = useQuery({
    queryKey: ["crews", user?.id],
    queryFn: getCrews,
    enabled: !!user,
  });

  // To check empty state and redirect on the empty screen page
  const isEmptyState =
    !crewsLoading && crews.length === 0 && friendsToShow.length === 0;

  const handleSelectCrew = (crew: Crew) => {
    setSelectedCrew(crew);
    setSelectedFriend(null);
  };

  const handleSelectFriend = (friend: Friends) => {
    setSelectedFriend(friend);
    setSelectedCrew(null);
  };
  // console.log("Fetching crews...", crews);

  // Handle loading and empty states
  if (authLoading) {
    return <div>Loading session...</div>;
  }
  if (crewsLoading || friendsLoading) {
    return <div>Loading...</div>;
  }
  // console.log("setting User", user);

  if (!user) {
    // console.log("User is null", user);
    return <div>Unauthorized</div>;
  }

  return (
    <div className="flex h-screen">
      <CrewSidebar
        crews={crews}
        loading={crewsLoading}
        selectedCrew={selectedCrew}
        onSelectCrew={handleSelectCrew}
        onCreateCrew={(name) => createCrewMutation.mutate(name)}
        onDeleteCrew={(id) => deleteCrewMutation.mutate(id)}
      />
      <FriendsSidebar
        friends={friendsToShow}
        selectedFriend={selectedFriend}
        onSelectFriend={handleSelectFriend}
        friendsLoading={friendsLoading || incomingLoading || outgoingLoading}
      />

      <div className="flex flex-1 flex-col">
        <div className="fixed bottom-30 right-4 flex flex-col gap-2 z-20">
          <Button variant="secondary" onClick={() => setShowMembersPanel((prev) => !prev)}>
            {showMembersPanel ? "Hide Members" : "Show Members"}
          </Button>
          <Link href="/connect/add-friend">
            <Button variant="secondary">Add Friend</Button>
          </Link>
          <Link href="/connect/friend-requests">
            <Button variant="secondary">Friend Requests</Button>
          </Link>
          <Button onClick={logout}>Logout</Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {isEmptyState ? (
              <EmptyState />
            ) : (
              <ChatComponent
                crew={selectedCrew}
                friend={selectedFriend}
                messages={messages}
                sendMessage={sendMessage}
                connected={connected}
                currentUser={user}
              />
            )}
          </div>

          <CrewMembersSidebar
            crewName={selectedCrew?.name ?? ""}
            selectedCrewId={selectedCrew?.id ?? null}
            members={crewMembers}
            users={users}
            loading={crewMembersLoading}
            show={showMembersPanel}
            onHide={() => setShowMembersPanel(false)}
            onAddMember={(memberId) => addCrewMemberMutation.mutate(memberId)}
            onUpdateRole={(memberId, role) => updateCrewRoleMutation.mutate({ memberId, role })}
            onRemoveMember={(memberId) => removeCrewMemberMutation.mutate(memberId)}
            addDisabled={addCrewMemberMutation.status === "pending"}
            currentUserId={user?.id}
            pendingNewMemberId={newMemberId}
            onNewMemberChange={(id) => setNewMemberId(id)}
          />
        </div>
      </div>
    </div>
  );
}
