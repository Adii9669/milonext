

export interface Message {
    id: string;
    type: "crew" | "dm";
    content: string;
    createdAt: string;
    isMine?: boolean;
    sender?: {
        id: string;
        name: string;
    };
    crewId?: string;
    status?: "sent" | "delivered" | "read";

}


export interface PaginatedMessages {
    messages: Message[];
    nextCursor: string | null;
    hasMore: boolean;
}
