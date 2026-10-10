import { useQuery } from "@tanstack/react-query";
import { crewApi } from "@/src/lib/api";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

export const useCrews = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["crews", user?.id],
    queryFn: crewApi.getCrews,
    enabled: !!user,
  });
};
