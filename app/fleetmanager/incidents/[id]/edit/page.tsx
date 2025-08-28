"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import IncidentForm from "@/components/IncidentForm";

export default function EditIncidentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/incidents/${id}`)
      .then((res) => setIncident(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(updated: any) {
    try {
      await axios.put(`/api/incidents/${id}`, updated);
      router.push(`/fleetmanager/incidents/${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update incident");
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!incident)
    return <div className="p-6 text-red-600">Incident not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Incident #{id}</h1>
      <IncidentForm onSubmit={handleUpdate} initialData={incident} />
    </div>
  );
}
