"use client";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client"; // wrapper around axios/fetch
import IncidentForm from "@/components/IncidentForm";

export default function NewIncidentPage() {
  const router = useRouter();

  async function handleCreate(data: any) {
    try {
      
      await apiClient.post("/incidents", data);
      router.push("/fleetmanager/incidents");
    } catch (err) {
      console.error(err);
      alert("Failed to create incident");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Incident</h1>
      <IncidentForm onSubmit={handleCreate} />
    </div>
  );
}
