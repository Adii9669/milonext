import { create } from "zustand";
import { Friends } from "@/src/types/friends";



import { getFriends } from "@/src/lib/api"



interface FriendStore {
    friends: Friends[];
    loading: boolean;

    fetchFriends: () => Promise<void>;
    clearFriends: () => void;
}


export const useFriendStore = create<FriendStore>((set, get) => ({
    friends: [],
    loading: false,

    fetchFriends: async () => {
        try {
            set({ loading: true });
            const friends = await getFriends();
            set({ friends });
        } catch (error) {
            console.error("Failed to fetch friends:", error);
        } finally {
            set({ loading: false });
        }
    },

    clearFriends: () => {
        set({ friends: [] });
    }
}));
