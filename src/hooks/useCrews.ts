
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCrews } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";


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