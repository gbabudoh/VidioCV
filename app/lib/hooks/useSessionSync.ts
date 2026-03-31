"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * useSessionSync Hook
 * Monitors localStorage for token changes (logout in other tabs or manual cache clear)
 * and redirects to the login page if the session is lost.
 */
export const useSessionSync = () => {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkSession = () => {
      if (!isMounted) return;
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("SessionSync: Token missing, logging out...");
        router.push("/");
      }
    };

    // 1. Listen for storage events (logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        console.log("SessionSync: Token removed in another tab.");
        router.push("/");
      }
    };

    // 2. Periodic check
    const intervalId = setInterval(checkSession, 5000); // 5s is plenty for background sync

    window.addEventListener("storage", handleStorageChange);

    // Initial check with a small delay to allow hydration and localStorage availability
    const timeoutId = setTimeout(() => {
      checkSession();
    }, 500);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [router]);
};
