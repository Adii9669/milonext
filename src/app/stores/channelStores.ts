import { create } from "zustand";
import { Channel } from '../../types/channel';

import {
    channelsApi
} from "@/src/features/Channels/api/channelApi";


/* =======================
   Store shape
======================= */


interface ChannelStore {
    channels: Channel[];
    loading: boolean;

    fetchChannels: () => Promise<void>;
    createChannel: (name: string) => Promise<Channel>;
    deleteChannel: (channelId: string) => Promise<void>;
    clearChannels: () => void;
}


/* =======================
   Store
======================= */

export const useChannelStore = create<ChannelStore>((set, get) => ({

    channels: [],
    loading: false,

    fetchChannels: async () => {
        set({ loading: true });
        try {
            const channels = await channelsApi.getChannels();
            if(Array.isArray(channels)){
                set({ channels });
            }else {
                // console.error("Unexpected response for channels:", channels)
                set({ channels: [] });
            }
            // this is where the channels are set in the state, but it is currently commented out. 
            // if we do like this the channel crash at empty state, but if we do like the code below, the channel will not crash at empty state, 
            // but it will not update when we create a new channel.
            // set({ channels });
        } catch (error) {
            console.error("Failed to fetch channels:", error);
        } finally {
            set({ loading: false });
        }
    },
    
    createChannel: async (name: string) => { 
        await channelsApi.createChannel({ name });
        await useChannelStore.getState().fetchChannels();
        const channels = get().channels;
        return channels[channels.length - 1];
    },

    deleteChannel: async (channelId: string) => {
        await channelsApi.deleteChannel(channelId);
        await useChannelStore.getState().fetchChannels();
    },
    
    clearChannels: () => set({ channels: [] }),
}));