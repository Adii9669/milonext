import SideBar from  "@/src/features/SideBar/SideBar";
import ChatContainer from "./ChatContainer";



export function ChatPageView(props: any) {
  const {
    crews,
    friends,
    selectedCrew,
    selectedFriend,
    handleSelectCrew,
    messages,
    sendMessage,
    connected,
    user,
    setSelectedCrew,
    setSelectedFriend,
    activeView,
    setActiveView,
    friendsLoading,
    crewsLoading,
    onDeleteCrew,
  } = props;

  return (
    <div className="flex h-screen">
      <SideBar
        crews={crews}
        friends={friends}
        selectedCrew={selectedCrew}
        selectedFriend={selectedFriend}
        onSelectCrew={handleSelectCrew}
        setSelectedFriend={setSelectedFriend}
        setSelectedCrew={setSelectedCrew}
        activeView={activeView}
        setActiveView={setActiveView}
        friendsLoading={friendsLoading}
        loading={crewsLoading}
        onDeleteCrew={onDeleteCrew}
        onClearSelectedCrew={() => setSelectedCrew?.(null)}
        onCreateCrew={() => {}}
      />

      <div className="flex-1 bg-chat-background text-text-primary">
        <ChatContainer
          crew={selectedCrew}
          friend={selectedFriend}
          messages={messages}
          sendMessage={sendMessage}
          connected={connected}
          currentUser={user}
        />
      </div>
    </div>
  );
}