export interface WSMessage {
    type: "crew" | "dm" | "system";
    receiver_id: string;
    content: string;
    timestamp?: string;
}

export interface Message{
    content: string;
    userID: string;
    username: string;
}
