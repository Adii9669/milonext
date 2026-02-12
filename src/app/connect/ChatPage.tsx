"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/src/context/page";
import { useCrewStore } from "@/src/app/stores/crewStores";
import { Crew } from "@/src/types/crew";

import ChatComponent from "./components/ChatComponent";
import SideBar from "./components/CrewSidebar";
import { useWebsocket } from "./useWebsocket";
import FriendsSidebar from "./components/FriendsSidebar";

export default function ChatPage() {
  const { logout } = useAuth();

  const { crews } = useCrewStore();
  const { connected, messages, sendMessage } = useWebsocket();

  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const[selectedFriend, setSelectedFriend] = useState<Crew | null>(null);

  /* --------------------
     Auto-select first crew
  -------------------- */
  useEffect(() => {
    if (!selectedCrew && crews.length > 0) {
      setSelectedCrew(crews[0]);
    }
  }, [crews, selectedCrew]);

  /* --------------------
     Filter messages
  -------------------- */
  const crewMessages = selectedCrew
    ? messages.filter(
        (m) =>
          m.type === "crew" &&
          m.receiver_id === selectedCrew.id
      )
    : [];

  return (
    <div className="flex h-screen">
      <SideBar
        selectedCrew={selectedCrew}
        onSelectCrew={setSelectedCrew}
      />
       <FriendsSidebar />
      <ChatComponent
        // key={selectedCrew?.id}
        crew={selectedCrew}
        // friend={selectedFriend}
        messages={crewMessages}
        sendMessage={sendMessage}
        connected={connected}
      />

      <Button onClick={logout}>Out</Button>
    </div>
  );
}
