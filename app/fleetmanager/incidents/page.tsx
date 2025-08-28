// "use client";
// import IncidentsTable from "@/components/IncidentsTable";
// import { useIncidents } from "@/lib/queries/incidents";

// export default function IncidentsListPage() {
//   const { data, isLoading, error } = useIncidents();

//   if (isLoading) return <p>Loading…</p>;
//   if (error) return <p>Error loading incidents</p>;

//   return <IncidentsTable incidents={data?.items ?? []} />;
// }

"use client";
import IncidentsTable from "@/components/incidents-table";
import { useIncidents } from "@/lib/queries/incidents";
import {
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function IncidentsListPage() {
  const { data, isLoading, error } = useIncidents();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500"></div>
            <Clock className="absolute inset-0 m-auto w-5 h-5 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-900">Loading incidents...</p>
            <p className="text-sm text-slate-500 mt-1">
              Fetching the latest incident reports
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="font-semibold">Unable to Load Incidents</p>
          </div>
          <p className="text-sm text-red-600 mb-4">
            There was an error fetching the incident data. Please check your
            connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalIncidents = data?.items?.length ?? 0;
  const resolvedIncidents =
    data?.items?.filter((incident) => incident.status === "RESOLVED")?.length ??
    0;
  const criticalIncidents =
    data?.items?.filter((incident) => incident.severity === "CRITICAL")
      ?.length ?? 0;
  const inProgressIncidents =
    data?.items?.filter((incident) => incident.status === "IN_PROGRESS")
      ?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Page Header + Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 text-balance">
            Incident Management
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Monitor, track, and resolve vehicle incidents across your fleet
            operations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
            bg="bg-blue-100"
            label="Total Incidents"
            value={totalIncidents}
          />
          <StatCard
            icon={<CheckCircle className="w-4 h-4 text-green-600" />}
            bg="bg-green-100"
            label="Resolved"
            value={resolvedIncidents}
          />
          <StatCard
            icon={<Clock className="w-4 h-4 text-orange-600" />}
            bg="bg-orange-100"
            label="In Progress"
            value={inProgressIncidents}
          />
          <StatCard
            icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
            bg="bg-red-100"
            label="Critical"
            value={criticalIncidents}
          />
        </div>
      </div>

      {/* Table */}
      <IncidentsTable incidents={data?.items ?? []} />
    </div>
  );
}

function StatCard({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
