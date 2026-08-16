
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCrews } from "@/src/lib/api";
import { useAuth } from "@/src/features/auth/hooks/useAuth";


export const useCrews = () => {
    const {user } = useAuth();

    return useQuery({
        queryKey: ["crews", user?.id],
        queryFn: getCrews,
        enabled: !!user,
    });
}


// export const useCreateCrew = () => {
//     const {user } = useAuth();
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: createCrew,
//         onSuccess: () => {
//             queryClient
//         }
//     })
// }