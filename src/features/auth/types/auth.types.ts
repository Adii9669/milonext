import { User } from "@/src/types/user";
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}