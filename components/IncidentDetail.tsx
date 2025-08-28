"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Car,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Download,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAddIncidentComment } from "@/lib/queries/incidents";

export default function IncidentDetail({ incident }: { incident: any }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const addComment = useAddIncidentComment();

  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPreview(null);
    }
    if (preview) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [preview]);
  useEffect(() => {
    if (incident?.updates) {
      // filter comments only
      setComments(
        incident.updates.filter((u: any) => u.updateType === "COMMENT")
      );
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
      { id: incident.id, comment, userId: 1 }, // ⚠️ replace with real userId
      {
        onSuccess: (newComment: any) => {
          setComments((prev) => [
            {
              id: newComment.id,
              message: newComment.message,
              createdAt: newComment.createdAt,
              user: { id: 1, name: "John Doe", email: "john@example.com" }, // fallback
              updateType: "COMMENT",
            },
            ...prev,
          ]);
          setComment("");
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ✅ Back button at the top */}
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
                <div
                  className={`w-2 h-2 rounded-full ${severityConfig.dot}`}
                ></div>
                <span className="font-semibold text-sm">
                  {incident.severity} Priority
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 border border-blue-100">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Occurred</h3>
          </div>
          <p className="text-slate-600 text-sm">
            {new Date(incident.occurredAt).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 border border-green-100">
              <Car className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Vehicle</h3>
          </div>
          <p className="text-slate-600 text-sm">
            {incident.car?.label || "Not specified"}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 border border-purple-100">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Reported By</h3>
          </div>
          <p className="text-slate-600 text-sm">
            {incident.reportedBy?.name || "Unknown"}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 border border-orange-100">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Type</h3>
          </div>
          <p className="text-slate-600 text-sm">{incident.type || "General"}</p>
        </div>
      </div>
      {incident.carReading && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Vehicle Reading
          </h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Odometer:</span>
              <span className="font-semibold text-slate-900">
                {incident.carReading.odometer.toLocaleString()} km
              </span>
            </div>
          </div>
        </div>
      )}
      {(incident.images?.length > 0 || incident.documents?.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Attachments
          </h3>

          {incident.images?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Images
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {incident.images.map((img: string, idx: number) => (
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

          {incident.documents?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Documents
              </h4>
              <div className="space-y-2">
                {incident.documents.map((doc: string, idx: number) => (
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
      {incident.resolutionNotes && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Resolution Notes
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {incident.resolutionNotes}
            </p>
          </div>
        </div>
      )}
      {/* Timeline */}
      {incident.updates?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            Activity Timeline and Comments
          </h3>
          <div className="space-y-6">
            {incident.updates.map((update: any, idx: number) => (
              <div key={update.id} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-200">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  {idx < incident.updates.length - 1 && (
                    <div className="w-px h-12 bg-slate-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-900">
                      {update.user?.name || "System"}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {new Date(update.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {update.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      Comments Section
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* New Comment */}
        <div className="mt-6 flex gap-3">
          <input
            type="text"
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="button"
            disabled={addComment.isPending || !comment.trim()}
            onClick={handleAddComment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {addComment.isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Image Preview</h3>
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Close preview"
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="relative w-full h-[600px] bg-slate-50">
              <Image
                src={preview || "/placeholder.svg"}
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
