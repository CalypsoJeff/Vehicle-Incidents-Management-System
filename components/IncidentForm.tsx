"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/TextArea";
import { FileUpload } from "./ui/FileUpload";
import { z } from "zod";
import { useCars, useUsers } from "@/lib/queries/incidents";
import type { Car, User } from "@prisma/client";
import Loading from "./Loading";

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

/** Step-level schemas */
const step1Schema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(5, "Description is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    error: "Severity is required",
  }),
  status: z.enum(
    ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"],
    {
      error: "Status is required",
    }
  ),
  type: z.enum(
    [
      "ACCIDENT",
      "BREAKDOWN",
      "THEFT",
      "VANDALISM",
      "MAINTENANCE_ISSUE",
      "TRAFFIC_VIOLATION",
      "FUEL_ISSUE",
      "OTHER",
    ],
    {
      error: "Type is required",
    }
  ),
});

const step2Schema = z.object({
  carId: z.coerce
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, "Vehicle is required"),
  reportedById: z.coerce
    .number()
    .refine((n) => Number.isFinite(n) && n > 0, "Reporter is required"),
  occurredAt: z
    .string()
    .refine((v) => !!v && !isNaN(Date.parse(v)), "Occurred at is required"),
});

/** Full schema for submit */
const allSchema = step1Schema.merge(step2Schema);

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

  function collectErrors(error: z.ZodError) {
    const e: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = (issue.path[0] as string) || "form";
      if (!e[key]) e[key] = issue.message;
    }
    return e;
  }

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
          location: `${pos.coords.latitude.toFixed(
            6
          )}, ${pos.coords.longitude.toFixed(6)}`,
        }));
      },
      (err) => {
        console.error(err);
        alert("Unable to fetch location");
      }
    );
  }

  /** Validate current step before moving forward */
  function handleNext() {
    if (step === 1) {
      const result = step1Schema.safeParse(form);
      if (!result.success) {
        setErrors(collectErrors(result.error));
        return;
      }
      setErrors({});
      setStep(2);
      return;
    }

    if (step === 2) {
      const result = step2Schema.safeParse(form);
      if (!result.success) {
        setErrors(collectErrors(result.error));
        return;
      }
      setErrors({});
      setStep(3);
      return;
    }

    // Step 3 has no required fields by default; advance
    if (step === 3) {
      setErrors({});
      setStep(4);
      return;
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Do nothing - only submit when button is clicked
  }

  // Handle manual submit button click
  async function handleSubmitClick() {
    // ensure uploads not pending
    const hasBlob =
      form.images.some((u) => u.startsWith("blob:")) ||
      form.documents.some((u) => u.startsWith("blob:"));
    if (hasBlob) {
      alert(
        "Some uploads are still local blobs. Please wait for uploads to finish."
      );
      return;
    }

    // final validation for all required fields
    const parsed = allSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(collectErrors(parsed.error));
      // Jump to step containing first error
      const fieldsStep1 = [
        "title",
        "description",
        "severity",
        "status",
        "type",
      ];
      const firstKey = parsed.error.issues[0]?.path[0];
      if (firstKey && fieldsStep1.includes(String(firstKey))) setStep(1);
      else setStep(2);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  }

  if (loadingCars || loadingUsers) {
     return <Loading />;
  }

  // Helpers (Review step)
  const selectedCar = cars.find((c) => Number(form.carId) === c.id);
  const reportedBy = users.find((u) => Number(form.reportedById) === u.id);
  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "—";

  // Inline Badge
  const Badge = ({
    children,
    tone = "gray",
  }: {
    children: React.ReactNode;
    tone?: "gray" | "blue" | "orange" | "red" | "green";
  }) => {
    const toneMap: Record<string, string> = {
      gray: "bg-gray-100 text-gray-800",
      blue: "bg-blue-100 text-blue-800",
      orange: "bg-amber-100 text-amber-800",
      red: "bg-rose-100 text-rose-800",
      green: "bg-emerald-100 text-emerald-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${toneMap[tone]}`}
      >
        {children}
      </span>
    );
  };

  const severityTone: Record<
    IncidentFormData["severity"],
    "gray" | "blue" | "orange" | "red" | "green"
  > = {
    LOW: "green",
    MEDIUM: "blue",
    HIGH: "orange",
    CRITICAL: "red",
  };
  const statusTone: Record<
    IncidentFormData["status"],
    "gray" | "blue" | "orange" | "red" | "green"
  > = {
    PENDING: "gray",
    IN_PROGRESS: "blue",
    RESOLVED: "green",
    CLOSED: "gray",
    CANCELLED: "red",
  };

  const stepTitles = [
    "Basic Information",
    "Vehicle & Reporter",
    "Files & Evidence",
    "Review & Confirm",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          {stepTitles.map((_, i) => (
            <div
              key={i}
              className={`flex items-center ${
                i < stepTitles.length - 1 ? "flex-1" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i + 1 <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              {i < stepTitles.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i + 1 < step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-center">
          {stepTitles[step - 1]}
        </h2>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 rounded-xl border p-4 bg-white">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="severity" className="text-sm text-gray-600">
                  Severity
                </label>
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
                <label htmlFor="status" className="text-sm text-gray-600">
                  Status
                </label>
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
              <label htmlFor="type" className="text-sm text-gray-600">
                Type
              </label>
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
          <div className="space-y-4 rounded-xl border p-4 bg-white">
            <label htmlFor="vehicle" className="text-sm text-gray-600">
              Vehicle
            </label>
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
            {errors.carId && (
              <p className="text-sm text-red-600">{errors.carId}</p>
            )}

            <label htmlFor="reportedBy" className="text-sm text-gray-600">
              Reported By
            </label>
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
            {errors.reportedById && (
              <p className="text-sm text-red-600">{errors.reportedById}</p>
            )}

            <label htmlFor="occurredAt" className="text-sm text-gray-600">
              Occurred At
            </label>
            <Input
              id="occurredAt"
              type="datetime-local"
              value={
                form.occurredAt
                  ? new Date(form.occurredAt).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  occurredAt: new Date(e.target.value).toISOString(),
                }))
              }
            />
            {errors.occurredAt && (
              <p className="text-sm text-red-600">{errors.occurredAt}</p>
            )}

            <label className="text-sm text-gray-600">Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                className="flex-1"
              />
              <Button type="button" onClick={detectLocation}>
                📍
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Uploads */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 bg-white">
              <h3 className="text-base font-semibold mb-3">Images</h3>
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
              {form.images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {form.images.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-video overflow-hidden rounded-lg border bg-gray-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Incident image ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border p-4 bg-white">
              <h3 className="text-base font-semibold mb-3">Documents</h3>
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
              {form.documents.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {form.documents.map((u, i) => (
                    <li key={i} className="text-sm">
                      <a
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {u}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 bg-white space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-500">Title</div>
                  <div className="text-base font-medium">
                    {form.title || "—"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={severityTone[form.severity]}>
                    {form.severity}
                  </Badge>
                  <Badge tone={statusTone[form.status]}>{form.status}</Badge>
                  <Badge tone="blue">{form.type}</Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Description</div>
                <p className="text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                  {form.description || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Vehicle</div>
                  <div className="text-sm font-medium">
                    {selectedCar
                      ? `${selectedCar.label} (${selectedCar.vin})`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Reported By</div>
                  <div className="text-sm font-medium">
                    {reportedBy
                      ? `${reportedBy.name} (${reportedBy.email})`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Occurred At</div>
                  <div className="text-sm font-medium">
                    {fmtDate(form.occurredAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-sm font-medium">
                    {form.location
                      ? form.location
                      : form.latitude && form.longitude
                      ? `Lat: ${form.latitude}, Lng: ${form.longitude}`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 bg-white">
              <div className="mb-3 font-medium">Images</div>
              {form.images.length ? (
                <div className="grid grid-cols-3 gap-3">
                  {form.images.map((u, i) => (
                    <div
                      key={i}
                      className="aspect-video overflow-hidden rounded-lg border bg-gray-50"
                      title={u}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u}
                        alt={`Incident image ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No images added.</p>
              )}
            </div>

            <div className="rounded-xl border p-4 bg-white">
              <div className="mb-3 font-medium">Documents</div>
              {form.documents.length ? (
                <ul className="space-y-2">
                  {form.documents.map((u, i) => (
                    <li key={i} className="text-sm">
                      <a
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {u}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No documents attached.</p>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Please confirm the details above. You can go back to edit any
              section before submitting.
            </p>
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
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmitClick}
              disabled={loading}
            >
              {loading ? "Saving…" : "Submit Incident"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
