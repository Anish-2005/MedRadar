"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAudit,
  getResources,
  getSettings,
} from "@/lib/client/api";

export function useMedRadarLiveData({ includeAudit = false, auditLimit = 40 } = {}) {
  const [resources, setResources] = useState(null);
  const [settings, setSettings] = useState(null);
  const [audit, setAudit] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setError("");
      const [resourcesResponse, settingsResponse, auditResponse] = await Promise.all([
        getResources(),
        getSettings(),
        includeAudit ? getAudit(auditLimit) : Promise.resolve({ audit: [] }),
      ]);

      setResources(resourcesResponse.resources);
      setSettings(settingsResponse.settings);
      if (includeAudit) {
        setAudit(auditResponse.audit);
      }
      setLoaded(true);
    } catch (nextError) {
      setError(nextError?.message || "Failed to load data.");
      setLoaded(true);
    }
  }, [auditLimit, includeAudit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    resources,
    settings,
    audit,
    loaded,
    error,
    refresh,
  };
}
