"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Car as CarIcon,
  User as UserIcon,
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAddIncidentComment } from "@/lib/queries/incidents";
import type {
  Incident,
  IncidentUpdate,
  User,
  Car,
  CarReading,
} from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

function toStringArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string")
    : [];
}
type IncidentWithRelations = Incident & {
  car?: Car | null;
  reportedBy?: User | null;
  carReading?: CarReading | null;
  updates?: (IncidentUpdate & { user?: User | null })[];
  images?: unknown; // prisma Json -> unknown here
  documents?: unknown; // prisma Json -> unknown here
};

export default function IncidentDetail({
  incident,
}: {
  incident: IncidentWithRelations;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    (IncidentUpdate & { user?: User | null })[]
  >([]);

  const addComment = useAddIncidentComment();
  const router = useRouter();
  const qc = useQueryClient();
  const images = toStringArray(incident.images);
  const documents = toStringArray(incident.documents);

  // Escape key closes preview
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPreview(null);
    }
    if (preview) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [preview]);

  // Keep comments in state for rendering
  useEffect(() => {
    if (incident?.updates) {
      setComments(incident.updates.filter((u) => u.updateType === "COMMENT"));
    }
  }, [incident]);

  if (!incident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-700">
            No incident data available
          </h3>
          <p className="text-gray-500">
            The requested incident could not be found.
          </p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "RESOLVED":
        return {
          icon: CheckCircle,
          color: "text-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          label: "Resolved",
        };
      case "IN_PROGRESS":
        return {
          icon: Clock,
          color: "text-blue-700",
          bg: "bg-blue-50",
          border: "border-blue-200",
          label: "In Progress",
        };
      case "CLOSED":
        return {
          icon: XCircle,
          color: "text-gray-700",
          bg: "bg-gray-50",
          border: "border-gray-200",
          label: "Closed",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-yellow-700",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          label: "Pending",
        };
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return {
          color: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-200",
          dot: "bg-red-500",
        };
      case "HIGH":
        return {
          color: "text-orange-700",
          bg: "bg-orange-50",
          border: "border-orange-200",
          dot: "bg-orange-500",
        };
      case "MEDIUM":
        return {
          color: "text-yellow-700",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          dot: "bg-yellow-500",
        };
      default:
        return {
          color: "text-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          dot: "bg-green-500",
        };
    }
  };

  const statusConfig = getStatusConfig(incident.status);
  const severityConfig = getSeverityConfig(incident.severity);
  const StatusIcon = statusConfig.icon;

  // Post a new comment
  const handleAddComment = () => {
    addComment.mutate(
      { id: incident.id.toString(), comment, userId: 1 }, // ✅ id must be string
      {
        onSuccess: (newComment: IncidentUpdate & { user?: User | null }) => {
          setComment("");
          // ✅ update local state for instant feedback
          setComments((prev) => [
            ...(prev ?? []),
            { ...newComment, updateType: "COMMENT" },
          ]);
          // ✅ re-fetch incident detail
          qc.invalidateQueries({
            queryKey: queryKeys.incidents.detail(incident.id.toString()),
          });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          aria-label="Go back to incidents list"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200">
                  <AlertTriangle className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    {incident.title}
                  </h1>
                  <p className="text-slate-600 font-medium">
                    Incident #{incident.id}
                  </p>
                </div>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
                {incident.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  {statusConfig.label}
                </span>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${severityConfig.bg} ${severityConfig.border} ${severityConfig.color}`}
              >
                <div className={`w-2 h-2 rounded-full ${severityConfig.dot}`} />
                <span className="font-semibold text-sm">
                  {incident.severity} Priority
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Car, Reporter, Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> Occurred
          </h3>
          <p className="text-slate-600 text-sm mt-2">
            {new Date(incident.occurredAt).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <CarIcon className="w-5 h-5 text-green-600" /> Vehicle
          </h3>
          <p className="text-slate-600 text-sm mt-2">
            {incident.car?.label || "Not specified"}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-purple-600" /> Reported By
          </h3>
          <p className="text-slate-600 text-sm mt-2">
            {incident.reportedBy?.name || "Unknown"}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" /> Type
          </h3>
          <p className="text-slate-600 text-sm mt-2">{incident.type}</p>
        </div>
      </div>

      {/* Vehicle Reading */}
      {incident.carReading && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-2">Vehicle Reading</h3>
          <p className="text-slate-700">
            Odometer:{" "}
            <strong>{incident.carReading.odometer.toLocaleString()} km</strong>
          </p>
        </div>
      )}

      {/* Attachments */}
      {(images.length > 0 || documents.length > 0) && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Attachments
          </h3>

          {images.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Images
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square cursor-pointer rounded-lg overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors"
                    onClick={() => setPreview(img)}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Incident image ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Documents
              </h4>
              <div className="space-y-2">
                {documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                      Document {idx + 1}
                    </span>
                    <Download className="w-4 h-4 text-slate-400 ml-auto group-hover:text-slate-600" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <div className="space-y-3 mb-4">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="p-2 border rounded">
                <p className="text-sm text-gray-700">{c.message}</p>
                <span className="text-xs text-gray-500">
                  {c.user?.name ?? "User"} ·{" "}
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={handleAddComment}
            disabled={addComment.isPending || !comment.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            {addComment.isPending ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-900">Image Preview</h3>
              <button
                onClick={() => setPreview(null)}
                className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="relative w-full h-[600px] bg-slate-50">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
