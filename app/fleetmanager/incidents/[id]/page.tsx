"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import IncidentDetail from "@/components/IncidentDetail"; // your styled detail card

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`/api/incidents/${id}`)
      .then((res) => setIncident(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load incident");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error || !incident)
    return <div className="p-6 text-red-600">{error ?? "Not found"}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incident #{incident.id}</h1>
        <Link
          className="text-blue-600 hover:underline"
          href={`/fleetmanager/incidents/${incident.id}/edit`}
        >
          Edit
        </Link>
      </div>

      {/* Detail Card */}
      <IncidentDetail incident={incident} />

      {/* Future sections */}
      {/* Timeline + Comment Box + Status Workflow Buttons can be slotted here */}
    </div>
  );
}
