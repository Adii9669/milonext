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
import { Channel } from "@/src/types/channel";

export function useConnectPage() {

    const {
        user,
        loading: authLoading,
    } = useAuth();

    const realtime =
        useChatRealtime(user);

    const selection =
        useChatSelection({
            channels: [],
            friendsToShow: [],
            joinChannel:
                realtime.joinChannel,

            leaveChannel:
                realtime.leaveChannel,
        });

    const queries =
        useChatQueries(
            user,
            selection.selectedChannel
        );

    useEffect(() => {

        if (
            selection.selectedChannel ||
            selection.selectedFriend
        ) {
            return;
        }

        const savedChannelId =
            localStorage.getItem(
                "selectedChannelId"
            );

        const savedView =
            localStorage.getItem(
                "activeView"
            ) as
            | "dm"
            | "channel"
            | null;

        if (savedView) {
            selection.setActiveView(
                savedView
            );
        }

        if (
            savedChannelId &&
            queries.channels.length > 0
        ) {

            const found =
                queries.channels.find(
                    (channel: Channel) =>
                        channel.id ===
                        savedChannelId
                );

            if (found) {

                selection.setSelectedChannel(
                    found
                );

                return;
            }
        }

        if (
            queries.channels.length > 0
        ) {

            selection.setSelectedChannel(
                queries.channels[0]
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
        queries.channels,
        queries.friendsToShow,
        selection,
    ]);

    useEffect(() => {

        if (
            selection.selectedChannel
        ) {

            localStorage.setItem(
                "selectedChannelId",
                selection.selectedChannel.id
            );

            localStorage.setItem(
                "activeView",
                "channel"
            );
        }

    }, [selection.selectedChannel]);

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

        !queries.channelsLoading &&

        queries.channels.length === 0 &&

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