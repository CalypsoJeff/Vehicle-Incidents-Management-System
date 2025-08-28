"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import IncidentStats from "@/components/IncidentStats";

export default function IncidentsStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/incidents/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!stats)
    return <div className="p-6 text-red-600">Failed to load stats.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Incidents Analytics</h1>
      <IncidentStats stats={stats} />
    </div>
  );
}
