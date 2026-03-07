"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getSession } from "@/lib/client/api";

export function useRequireSession(options = {}) {
  const { allowedRoles = null, redirectOnForbidden = "/dashboard" } = options;
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const response = await getSession();
      const nextSession = response.session;

      if (allowedRoles && !allowedRoles.includes(nextSession.role)) {
        setSession(nextSession);
        setReady(true);
        router.replace(redirectOnForbidden);
        return;
      }

      setSession(nextSession);
      setReady(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSession(null);
        setReady(true);
        router.replace("/login");
        return;
      }

      setSession(null);
      setReady(true);
    }
  }, [allowedRoles, redirectOnForbidden, router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return {
    session,
    ready,
    refreshSession,
  };
}
