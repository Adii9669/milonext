import { create } from "zustand";
import { Crew } from '../../types/crew';

import {
    getCrews,
    createCrew as apiCreateCrew,
    deleteCrew as apiDeleteCrew,
} from "@/src/lib/api";


/* =======================
   Store shape
======================= */


interface CrewStore {
    crews: Crew[];
    loading: boolean;

    fetchCrews: () => Promise<void>;
    createCrew: (name: string) => Promise<Crew>;
    deleteCrew: (crewId: string) => Promise<void>;
    clearCrews: () => void;
}


/* =======================
   Store
======================= */

export const useCrewStore = create<CrewStore>((set, get) => ({

    crews: [],
    loading: false,

    fetchCrews: async () => {
        set({ loading: true });
        try {
            const crews = await getCrews();
            if(Array.isArray(crews)){
                set({ crews });
            }else {
                // console.error("Unexpected response for crews:", crews)
                set({ crews: [] });
            }
            // this is where the crews are set in the state, but it is currently commented out. 
            // if we do like this the crew crash at empty state, but if we do like the code below, the crew will not crash at empty state, 
            // but it will not update when we create a new crew.
            // set({ crews });
        } catch (error) {
            console.error("Failed to fetch crews:", error);
        } finally {
            set({ loading: false });
        }
    },
    
    createCrew: async (name: string) => { 
        await apiCreateCrew(name);
        await useCrewStore.getState().fetchCrews();
        const crews = get().crews;
        return crews[crews.length - 1];
    },

    deleteCrew: async (crewId: string) => {
        await apiDeleteCrew(crewId);
        await useCrewStore.getState().fetchCrews();
    },
    
    clearCrews: () => set({ crews: [] }),
}));