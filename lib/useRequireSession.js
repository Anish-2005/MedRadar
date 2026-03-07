"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  seedMedRadarStore,
  subscribeStoreChanges,
} from "@/lib/medradarStore";

export function useRequireSession() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      seedMedRadarStore();
      const currentSession = getSession();
      if (!currentSession) {
        setSession(null);
        router.replace("/login");
        setReady(true);
        return;
      }

      setSession(currentSession);
      setReady(true);
    };

    syncSession();
    const unsubscribe = subscribeStoreChanges(syncSession);

    return unsubscribe;
  }, [router]);

  return { session, ready };
}
