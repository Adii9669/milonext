import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/page";


const GuestRouter = ({ children }: { children: React.ReactNode }) => {
    const {user , loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) router.replace("/connect");
        }
    }, [user, loading, router]);

    if (loading || user) {
        return <div>Loading...</div>; // Or a spinner, or null
    }

    return <>{children}</>;
};

export default GuestRouter;
