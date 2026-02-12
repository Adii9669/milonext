"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/src/context/page";
import { useCrewStore } from "@/src/app/stores/crewStores";
import { Crew } from "@/src/types/crew";

import ChatComponent from "./components/ChatComponent";
import { useWebsocket } from "./useWebsocket";
import FriendsSidebar from "./components/FriendsSidebar";
import { Friends } from "@/src/types";
import CrewSidebar from "./components/CrewSidebar";

export default function ChatPage() {
  const { logout, user } = useAuth();

  const { crews } = useCrewStore();
  const { connected, messages, sendMessage } = useWebsocket();

  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friends | null>(null);

  /* --------------------
     Auto-select first crew
  -------------------- */
  /* Auto-select first crew */
  useEffect(() => {
    console.log("Selected friend:", selectedFriend);
    console.log("Selected crew:", selectedCrew);
    if (!selectedCrew && !selectedFriend && crews.length > 0) {
      setSelectedCrew(crews[0]);
    }
  }, [crews]);

  const handleSelectCrew = (crew: Crew) => {
    setSelectedCrew(crew);
    setSelectedFriend(null);
  };

  const handleSelectFriend = (friend: Friends) => {
    setSelectedFriend(friend);
    setSelectedCrew(null);
  };

  return (
    <div className="flex h-screen">
      <CrewSidebar
        selectedCrew={selectedCrew}
        onSelectCrew={(crew) => {
          setSelectedCrew(crew);
          setSelectedFriend(null);
        }}
      />
      <FriendsSidebar
        selectedFriend={selectedFriend}
        onSelectFriend={handleSelectFriend}
      />
      <ChatComponent
        // key={selectedCrew?.id}
        crew={selectedCrew}
        friend={selectedFriend}
        messages={messages}
        sendMessage={sendMessage}
        connected={connected}
        currentUser={user}
      />

      <Button onClick={logout}>Out</Button>
    </div>
  );
}
