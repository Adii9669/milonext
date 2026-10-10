"use client";

import { useEffect, useState } from "react";
import { Crew } from "@/src/types/crew";
import { Friends } from "@/src/types";

export function useChatSelection({
  crews,
  friendsToShow,
  joinCrew,
  leaveCrew,
}: {
  crews: Crew[];
  friendsToShow: Friends[];
  joinCrew: (id: string) => void;
  leaveCrew: (id: string) => void;
}) {
  const [activeView, setActiveView] = useState<"dm" | "crew">("crew");
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friends | null>(null);

  /* =========================
     Auto select
  ========================== */
  useEffect(() => {
    if (selectedCrew || selectedFriend) return;

    if (activeView === "dm") {
      if (friendsToShow.length > 0) {
        setSelectedFriend(friendsToShow[0]);
      }
      return;
    }

    if (crews.length > 0) {
      setSelectedCrew(crews[0]);
      return;
    }

    if (friendsToShow.length > 0) {
      setActiveView("dm");
      setSelectedFriend(friendsToShow[0]);
    }
  }, [activeView, crews, friendsToShow, selectedCrew, selectedFriend]);

  /* =========================
     Join / Leave crew
  ========================== */
  useEffect(() => {
    if (!selectedCrew) return;

    joinCrew(selectedCrew.id);

    return () => {
      leaveCrew(selectedCrew.id);
    };
  }, [selectedCrew, joinCrew, leaveCrew]);

  /* =========================
     Handlers
  ========================== */

  const handleSelectCrew = (crew: Crew) => {
    if (selectedCrew?.id === crew.id) return;

    if (selectedCrew) {
      leaveCrew(selectedCrew.id);
    }

    setActiveView("crew");
    setSelectedCrew(crew);
    setSelectedFriend(null);
    joinCrew(crew.id);
  };

  const handleSelectFriend = (friend: Friends) => {
    if (selectedCrew) {
      leaveCrew(selectedCrew.id);
    }

    setActiveView("dm");
    setSelectedFriend(friend);
    setSelectedCrew(null);
  };

  return {
    activeView,
    setActiveView,

    selectedCrew,
    setSelectedCrew,

    selectedFriend,
    setSelectedFriend,

    handleSelectCrew,
    handleSelectFriend,
  };
}