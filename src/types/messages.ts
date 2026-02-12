

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
}
