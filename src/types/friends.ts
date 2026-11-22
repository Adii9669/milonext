export interface Friends {
    id: string;
    name: string;
    username?: string;
    email?: string;
    avatar?: string;
    image?: string;
    online?: boolean;
    status: "pending" | "accepted" | "blocked";
}
