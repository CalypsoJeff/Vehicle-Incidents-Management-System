"use client";
import IncidentStats from "@/components/IncidentStats";
import { useIncidentStats } from "@/lib/queries/incidents";

export default function IncidentsStatsPage() {
  const { data: stats, isLoading, isError } = useIncidentStats();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !stats)
    return <div className="p-6 text-red-600">Failed to load stats.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Incidents Analytics</h1>
      <IncidentStats stats={stats} />
    </div>
  );
}
