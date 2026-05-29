import { apiFetch } from "../api/apiClient";

//-----------------------------------------Crews CURD----------------------------//
/**
 * Create Crew
 */
export const createCrew = async (name: string) => {
    return apiFetch("/api/crew/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });
}

/**
 * Get Crews
 */
export const getCrews = async () => {
    return apiFetch("/api/crews", {
        method: "GET",
    });
}


/** 
 * Delet Crews
 */
export const deleteCrew = async (crewId: string) => {
    return apiFetch(`/api/crew/${crewId}`, {
        method: "DELETE",
    });
}



//-----------------------------------------Crews Members----------------------------//

export const getCrewMembers = async (crewId: string) => {
    const data = await apiFetch(`/api/crews/${crewId}/members`);
    return data.members ?? [];
}

export const addCrewMember = async (crewId: string, userId: string) => {
    return apiFetch(`/api/crews/${crewId}/members/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
  
}

export const removeCrewMember = async (crewId: string, userId: string) => {
    return apiFetch(`/api/crews/${crewId}/members/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
}

export const updateCrewMemberRole = async (crewId: string, userId: string, role: string) => {
    return apiFetch(`/api/crews/${crewId}/members/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
    });

}


