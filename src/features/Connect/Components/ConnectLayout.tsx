"use client";

import { useState } from "react";
import { Bot } from "lucide-react";

import {
    useProtectedRoute,
} from "@/src/hooks/useProtectedRoute";

import CrewSidebar
from "@/src/features/SideBar/SideBar";

import EmptyState
from "@/src/features/SideBar/EmptyState";

import ChatComponent
from "@/src/features/Chat/ui/ChatContainer";
import { ChatDetailsPanel } from "@/src/features/Chat/ui/ChatDetailsPanel";

import {
    useConnectPage,
} from "@/src/features/Connect/hooks/useConnectPage";

import {
    ConnectLoading,
} from "./Loading";

export function ConnectLayout() {

    useProtectedRoute("/");
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
            className={`connect-shell font-chillax ${mobileChatOpen ? "mobile-chat-open" : ""} flex h-[100dvh] min-w-0 overflow-hidden`}
        >

            <CrewSidebar

                crews={queries.crews}
                messages={realtime.messages}

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
                    queries.friendsLoading
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
                onOpenChat={() => setMobileChatOpen(true)}
                incomingRequestCount={queries.incomingRequests.length}
                incomingRequestNames={queries.incomingRequests.map((request: any) => request.name || request.username).filter(Boolean)}
                user={user}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            />

            <div
                className="
                    connect-main
                    flex
                    flex-1
                    flex-row
                    bg-chat-background
                    text-text-primary
                "
            >

                <div
                    className="
                        connect-conversation-shell
                        flex
                        flex-1
                        overflow-hidden
                    "
                >

                    <div
                    className="
                        connect-chat-pane
                        relative
                        flex-1
                            overflow-hidden
                            bg-chat-background
                            text-text-primary
                        "
                    >

                        {isEmptyState ? (

                            <div className="relative h-full w-full">
                                {!sidebarOpen && (
                                    <button
                                        type="button"
                                        onClick={() => setSidebarOpen(true)}
                                        className="chat-header-sidebar-toggle absolute top-4 left-4 z-20"
                                        title="Show sidebar"
                                        aria-label="Show sidebar"
                                    >
                                        <Bot aria-hidden="true" className="size-4" />
                                    </button>
                                )}
                                <EmptyState />
                            </div>

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
                                onBack={() => setMobileChatOpen(false)}
                                crewMembers={queries.crewMembers}
                                sidebarOpen={sidebarOpen}
                                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                            />

                        )}

                    </div>

                </div>

                {(selection.selectedCrew || selection.selectedFriend) && (
                    <ChatDetailsPanel
                        crew={selection.selectedCrew}
                        friend={selection.selectedFriend}
                        members={queries.crewMembers}
                    />
                )}

            </div>

        </div>
    );
}
