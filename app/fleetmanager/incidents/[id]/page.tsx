"use client";
import { useParams } from "next/navigation";
import { useIncidentDetail } from "@/lib/queries/incidents";
import IncidentDetail from "@/components/IncidentDetail";

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: incident, isLoading, isError } = useIncidentDetail(id);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !incident)
    return <div className="p-6 text-red-600">Failed to load incident.</div>;

  return (
    <div className="space-y-6">
      <IncidentDetail incident={incident} />
    </div>
  );
}
