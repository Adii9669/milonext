"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";

import { useAuth } from "@/src/context/AuthContext";
import { Crew } from "@/src/types/crew";
import { getCrews, getFriends } from "@/src/lib/api";

import ChatComponent from "./components/ChatComponent";
import { useWebsocket } from "./lib/useWebsocket";
import FriendsSidebar from "./components/FriendsSidebar";
import { Friends } from "@/src/types";
import CrewSidebar from "./components/CrewSidebar";
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

  //For Friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: getFriends,
    enabled: !!user,
  });

  //For crews
  const { data: crews = [], isLoading: crewsLoading } = useQuery({
    queryKey: ["crews", user?.id],
    queryFn: getCrews,
    enabled: !!user,
  });

  // To check empty state and redirect on the empty screen page
  const isEmptyState =
    !crewsLoading && crews.length === 0 && friends.length === 0;

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
        friends={friends}
        selectedFriend={selectedFriend}
        onSelectFriend={handleSelectFriend}
        friendsLoading={friendsLoading}
      />
      <Button className="fixed top-20 right-4" onClick={logout}>
        Logout
      </Button>

      {isEmptyState ? (
        <EmptyState />
      ) : (
        <ChatComponent
          // key={selectedCrew?.id}
          crew={selectedCrew}
          friend={selectedFriend}
          messages={messages}
          sendMessage={sendMessage}
          connected={connected}
          currentUser={user}
        />
      )}
    </div>
  );
}
