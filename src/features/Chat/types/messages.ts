

export interface Message {
    id: string;
    type: "channel" | "dm";
    content: string;
    createdAt: string;
    isMine?: boolean;
    isOptimistic?: boolean;
    sender?: {
        id: string;
        name: string;
    };
    channelId?: string;
    receiverId?: string;
    status?: "sent" | "delivered" | "read";
    fileUrl?: string;
    filePreviewUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;

}


export interface PaginatedMessages {
    messages: Message[];
    nextCursor: string | null;
    hasMore: boolean;
}
