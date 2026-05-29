import { useAuthStore }
    from "../stores/authStores";

export function useAuth() {

    const user =
        useAuthStore((state) => state.user);

    const isAuthenticated =
        useAuthStore(
            (state) => state.isAuthenticated
        );

    const logout =
        useAuthStore((state) => state.logout);

        const loading =
        useAuthStore((state) => state.isLoading);

    return {
        user,
        isAuthenticated,
        loading,
        logout,
    };
}