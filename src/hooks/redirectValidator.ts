// src/hooks/useRedirectValidator.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export function useRedirectValidator() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only perform the redirect check after the authentication status has been determined.
    if (!loading) {
      // If a user is found (meaning they are authenticated), redirect them.
      if (user) {
        console.log("User is authenticated, redirecting...");
        router.replace('/'); // Use `replace` to prevent going back to this page
      }
    }
  }, [user, loading, router]);
}
