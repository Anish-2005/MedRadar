"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAuditLog,
  getResources,
  getSettings,
  seedMedRadarStore,
  subscribeStoreChanges,
} from "@/lib/medradarStore";

export function useMedRadarLiveData({ includeAudit = false } = {}) {
  const [resources, setResources] = useState(null);
  const [settings, setSettings] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    seedMedRadarStore();
    setResources(getResources());
    setSettings(getSettings());
    if (includeAudit) {
      setAudit(getAuditLog());
    }
    setLoaded(true);
  }, [includeAudit]);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeStoreChanges(refresh);
    return unsubscribe;
  }, [refresh]);

  return {
    resources,
    settings,
    audit,
    loaded,
    refresh,
  };
}
