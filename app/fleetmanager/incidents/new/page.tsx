"use client";
import { useRouter } from "next/navigation";
import IncidentForm from "@/components/IncidentForm";
import { useCreateIncident } from "@/lib/queries/incidents";

export default function NewIncidentPage() {
  const router = useRouter();
  const createIncident = useCreateIncident();

  async function handleCreate(data: unknown) {
    createIncident.mutate(data, {
      onSuccess: () => {
        router.push("/fleetmanager/incidents");
      },
      onError: (err) => {
        console.error(err);
        alert("Failed to create incident");
      },
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Incident</h1>
      <IncidentForm onSubmit={handleCreate} />
    </div>
  );
}
