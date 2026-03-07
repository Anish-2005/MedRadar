"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, seedMedRadarStore } from "@/lib/medradarStore";

export function useRequireSession() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedMedRadarStore();

    const currentSession = getSession();
    if (!currentSession) {
      router.replace("/login");
      setReady(true);
      return;
    }

    setSession(currentSession);
    setReady(true);
  }, [router]);

  return { session, ready };
}
