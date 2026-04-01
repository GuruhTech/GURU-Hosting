import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { clearToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
    }
  });

  const logout = () => {
    clearToken();
    queryClient.setQueryData(getGetMeQueryKey(), null);
    window.location.href = "/login";
  };

  return {
    user,
    isLoading,
    error,
    logout,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
  };
}
