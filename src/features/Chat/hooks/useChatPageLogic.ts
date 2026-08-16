import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useWebsocket } from "./useWebsocket";

export function useChatPageLogic(user) {
  const ws = useWebsocket(user);

  const [selectedCrew, setSelectedCrew] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeView, setActiveView] = useState("crew");

  // 👉 all queries here
  const { data: crews = [] } = useQuery(...)
  const { data: friends = [] } = useQuery(...)

  // 👉 mutations here
  const createCrewMutation = useMutation(...)
  const deleteCrewMutation = useMutation(...)

  // 👉 selection logic here
  const handleSelectCrew = (crew) => { ... }
  const handleSelectFriend = (friend) => { ... }

  return {
    crews,
    friends,
    selectedCrew,
    selectedFriend,
    activeView,
    setActiveView,
    handleSelectCrew,
    handleSelectFriend,
    createCrew: createCrewMutation.mutate,
    deleteCrew: deleteCrewMutation.mutate,

    ...ws, // messages, sendMessage, typing etc
  };
}