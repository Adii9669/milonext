import { apiFetch } from "@/src/lib/api/apiClient";
import type { User } from "@/src/types/user";

type GetMeResponse = User | { user: User };

export async function getMe(): Promise<GetMeResponse> {
    return apiFetch("/api/me");
}