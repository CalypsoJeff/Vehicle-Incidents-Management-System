"use client";
import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/TextArea";
import { FileUpload } from "./ui/FileUpload";
import { z } from "zod";
import { useCars, useUsers } from "@/lib/queries/incidents";
import type { Car, User } from "@prisma/client";
type IncidentFormData = {
  carId: number | string;
  reportedById: number | string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "CANCELLED";
  type:
    | "ACCIDENT"
    | "BREAKDOWN"
    | "THEFT"
    | "VANDALISM"
    | "MAINTENANCE_ISSUE"
    | "TRAFFIC_VIOLATION"
    | "FUEL_ISSUE"
    | "OTHER";
  occurredAt: string;
  images: string[];
  documents: string[];
  location: string;
  latitude: number | null;
  longitude: number | null;
};

const incidentSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(5, "Description is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"]),
  type: z.enum([
    "ACCIDENT",
    "BREAKDOWN",
    "THEFT",
    "VANDALISM",
    "MAINTENANCE_ISSUE",
    "TRAFFIC_VIOLATION",
    "FUEL_ISSUE",
    "OTHER",
  ]),
});

export default function IncidentForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: IncidentFormData) => Promise<void>;
  initialData?: Partial<IncidentFormData>;
}) {
  const [step, setStep] = useState(1);

  const { data: cars = [], isLoading: loadingCars } = useCars();
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const [form, setForm] = useState<IncidentFormData>({
    carId: initialData?.carId ?? "",
    reportedById: initialData?.reportedById ?? "",
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    severity: initialData?.severity ?? "LOW",
    status: initialData?.status ?? "PENDING",
    type: initialData?.type ?? "OTHER",
    occurredAt: initialData?.occurredAt ?? new Date().toISOString(),
    images: initialData?.images ?? [],
    documents: initialData?.documents ?? [],
    location: initialData?.location ?? "",
    latitude: initialData?.latitude ?? null,
    longitude: initialData?.longitude ?? null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detect location
  async function detectLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location: `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`,
        }));
      },
      (err) => {
        console.error(err);
        alert("Unable to fetch location");
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasBlob =
      form.images.some((u) => u.startsWith("blob:")) ||
      form.documents.some((u) => u.startsWith("blob:"));

    if (hasBlob) {
      alert(
        "Some uploads are still local blobs. Please wait for uploads to finish."
      );
      return;
    }
    const parsed = incidentSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    console.log("Submitting", form);
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  }

  if (loadingCars || loadingUsers) {
    return <p>Loading form data…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}

          <Textarea
            placeholder="Description"
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}

          {/* Severity + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="severity">Severity</label>
              <select
                id="severity"
                className="border rounded-lg p-2 w-full"
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    severity: e.target.value as IncidentFormData["severity"],
                  }))
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                className="border rounded-lg p-2 w-full"
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as IncidentFormData["status"],
                  }))
                }
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="type">Type</label>
            <select
              id="type"
              className="border rounded-lg p-2 w-full"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as IncidentFormData["type"],
                }))
              }
            >
              <option value="ACCIDENT">Accident</option>
              <option value="BREAKDOWN">Breakdown</option>
              <option value="THEFT">Theft</option>
              <option value="VANDALISM">Vandalism</option>
              <option value="MAINTENANCE_ISSUE">Maintenance Issue</option>
              <option value="TRAFFIC_VIOLATION">Traffic Violation</option>
              <option value="FUEL_ISSUE">Fuel Issue</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Vehicle + Reporter */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Car Selection */}
          <label htmlFor="vehicle">Vehicle</label>
          <select
            id="vehicle"
            className="border rounded-lg p-2 w-full"
            value={form.carId}
            onChange={(e) =>
              setForm((f) => ({ ...f, carId: Number(e.target.value) }))
            }
          >
            <option value="">Select Vehicle</option>
            {cars.map((car: Car) => (
              <option key={car.id} value={car.id}>
                {car.label} ({car.vin})
              </option>
            ))}
          </select>

          {/* Reported By Selection */}
          <label htmlFor="reportedBy">Reported By</label>
          <select
            id="reportedBy"
            className="border rounded-lg p-2 w-full"
            value={form.reportedById}
            onChange={(e) =>
              setForm((f) => ({ ...f, reportedById: Number(e.target.value) }))
            }
          >
            <option value="">Select Reporter</option>
            {users.map((u: User) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          {/* Location */}
          <Input
            placeholder="Location (optional)"
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
          <Button type="button" onClick={detectLocation}>
            📍 Use My Location
          </Button>
        </div>
      )}

      {/* Step 3: Uploads */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Images */}
          <FileUpload
            multiple
            accept="image/*"
            folder="incidents/images"
            onUploaded={(url) =>
              setForm((f) => ({
                ...f,
                images: [
                  ...f.images.filter((u) => !u.startsWith("blob:")),
                  url,
                ],
              }))
            }
          />

          <FileUpload
            multiple
            accept="application/pdf,.doc,.docx,.csv"
            folder="incidents/docs"
            onUploaded={(url) =>
              setForm((f) => ({
                ...f,
                documents: [
                  ...f.documents.filter((u) => !u.startsWith("blob:")),
                  url,
                ],
              }))
            }
          />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div>
          <h3>Review</h3>
          <pre>{JSON.stringify(form, null, 2)}</pre>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        {step > 1 && (
          <Button type="button" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        {step < 4 ? (
          <Button type="button" onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Submit Incident"}
          </Button>
        )}
      </div>
    </form>
  );
}
