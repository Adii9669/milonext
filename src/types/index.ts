export interface Crew {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;  
}

export interface Message{
    content: string;
    userID: string;
    username: string;
}
