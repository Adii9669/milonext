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
            set({ crews });
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