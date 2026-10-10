"use client";

import { useEffect }
from "react";

import { useAuth }
from "@/src/features/auth/hooks/useAuth";

import { useChatRealtime }
from "@/src/features/Chat/hooks/useChatRealtime";

import { useChatQueries }
from "@/src/features/Chat/hooks/useChatQuries";

import { useChatSelection }
from "@/src/features/Chat/hooks/useChatSelection";
import { Crew } from "@/src/types/crew";

export function useConnectPage() {

    const {
        user,
        loading: authLoading,
    } = useAuth();

    const realtime =
        useChatRealtime(user);

    const selection =
        useChatSelection({
            crews: [],
            friendsToShow: [],
            joinCrew:
                realtime.joinCrew,

            leaveCrew:
                realtime.leaveCrew,
        });

    const queries =
        useChatQueries(
            user,
            selection.selectedCrew
        );

    useEffect(() => {

        if (
            selection.selectedCrew ||
            selection.selectedFriend
        ) {
            return;
        }

        const savedCrewId =
            localStorage.getItem(
                "selectedCrewId"
            );

        const savedView =
            localStorage.getItem(
                "activeView"
            ) as
            | "dm"
            | "crew"
            | null;

        if (savedView) {
            selection.setActiveView(
                savedView
            );
        }

        if (
            savedCrewId &&
            queries.crews.length > 0
        ) {

            const found =
                queries.crews.find(
                    (crew: Crew) =>
                        crew.id ===
                        savedCrewId
                );

            if (found) {

                selection.setSelectedCrew(
                    found
                );

                return;
            }
        }

        if (
            queries.crews.length > 0
        ) {

            selection.setSelectedCrew(
                queries.crews[0]
            );

        } else if (
            queries.friendsToShow
                .length > 0
        ) {

            selection.setActiveView(
                "dm"
            );

            selection.setSelectedFriend(
                queries.friendsToShow[0]
            );
        }

    }, [
        queries.crews,
        queries.friendsToShow,
        selection,
    ]);

    useEffect(() => {

        if (
            selection.selectedCrew
        ) {

            localStorage.setItem(
                "selectedCrewId",
                selection.selectedCrew.id
            );

            localStorage.setItem(
                "activeView",
                "crew"
            );
        }

    }, [selection.selectedCrew]);

    useEffect(() => {

        if (
            selection.selectedFriend
        ) {

            localStorage.setItem(
                "activeView",
                "dm"
            );
        }

    }, [selection.selectedFriend]);

    const isEmptyState =

        !queries.crewsLoading &&

        queries.crews.length === 0 &&

        queries.friendsToShow
            .length === 0;

    return {

        user,

        authLoading,

        realtime,

        queries,

        selection,

        isEmptyState,
    };
}