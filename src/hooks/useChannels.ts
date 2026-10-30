import { useQuery } from "@tanstack/react-query";
import { channelApi } from "@/src/lib/api";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

export const useChannels = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["channels", user?.id],
    queryFn: channelApi.getChannels,
    enabled: !!user,
  });
};
