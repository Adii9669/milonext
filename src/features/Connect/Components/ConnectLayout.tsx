"use client";

import {
    useProtectedRoute,
} from "@/src/hooks/useProtectedRoute";

import CrewSidebar
from "@/src/features/SideBar/SideBar";

import EmptyState
from "@/src/features/SideBar/EmptyState";

import ChatComponent
from "@/src/features/Chat/ui/ChatContainer";

import {
    useConnectPage,
} from "@/src/features/Connect/hooks/useConnectPage";

import {
    ConnectLoading,
} from "./Loading";

export function ConnectLayout() {

    useProtectedRoute("/");

    const {

        user,

        authLoading,

        realtime,

        queries,

        selection,

        isEmptyState,

    } = useConnectPage();

    if (authLoading) {

        return (
            <ConnectLoading
                text="Loading session..."
            />
        );
    }

    if (
        queries.crewsLoading ||
        queries.friendsLoading
    ) {

        return (
            <ConnectLoading
                text="Loading..."
            />
        );
    }

    if (!user) {

        return (
            <ConnectLoading
                text="Unauthorized"
            />
        );
    }

    return (

        <div
            className="
                flex
                h-screen
            "
        >

            <CrewSidebar

                crews={queries.crews}

                loading={
                    queries.crewsLoading
                }

                friends={
                    queries.friendsToShow
                }

                selectedFriend={
                    selection.selectedFriend
                }

                setSelectedFriend={(
                    friend
                ) => {

                    if (!friend) {

                        selection
                        .setSelectedFriend(
                            null
                        );

                        return;
                    }

                    selection
                    .handleSelectFriend(
                        friend
                    );
                }}

                friendsLoading={
                    queries.friendsLoading ||

                    queries.incomingRequests
                        .length > 0 ||

                    queries.outgoingRequests
                        .length > 0
                }

                selectedCrew={
                    selection.selectedCrew
                }

                setSelectedCrew={
                    selection
                    .setSelectedCrew
                }

                onSelectCrew={
                    selection
                    .handleSelectCrew
                }

                onCreateCrew={
                    queries.createCrew
                }

                onDeleteCrew={
                    queries.deleteCrew
                }

                activeView={
                    selection.activeView
                }

                setActiveView={
                    selection.setActiveView
                }

                onClearSelectedCrew={() =>
                    selection
                    .setSelectedCrew(null)
                }
            />

            <div
                className="
                    flex
                    flex-1
                    flex-col
                    bg-chat-background
                    text-text-primary
                "
            >

                <div
                    className="
                        flex
                        flex-1
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            flex-1
                            overflow-hidden
                            bg-chat-background
                            text-text-primary
                        "
                    >

                        {isEmptyState ? (

                            <EmptyState />

                        ) : (

                            <ChatComponent

                                crew={
                                    selection
                                    .selectedCrew
                                }

                                friend={
                                    selection
                                    .selectedFriend
                                }

                                messages={
                                    realtime.messages
                                }

                                sendMessage={
                                    realtime.sendMessage
                                }

                                connected={
                                    realtime.connected
                                }

                                currentUser={user}

                                sendDelivered={
                                    realtime
                                    .sendDelivered
                                }

                                sendRead={
                                    realtime
                                    .sendRead
                                }

                                typing={
                                    realtime.typing
                                }

                                getTypingUsers={
                                    realtime
                                    .getTypingUsers
                                }

                                startTyping={
                                    realtime
                                    .startTyping
                                }

                                stopTyping={
                                    realtime
                                    .stopTyping
                                }
                            />

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}