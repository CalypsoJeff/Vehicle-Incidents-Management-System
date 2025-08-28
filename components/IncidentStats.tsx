import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { IncidentStats as StatsType } from "@/lib/queries/incidents";
import { Badge } from "@/components/ui/Badge";

const COLORS = {
  status: ["#3B82F6", "#F59E0B", "#10B981", "#6B7280"],
  severity: ["#10B981", "#F59E0B", "#EF4444", "#DC2626"],
  type: ["#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444", "#10B981"],
};

export default function IncidentStats({ stats }: { stats: StatsType }) {
  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500 border rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
        <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-lg">No stats available.</p>
      </div>
    );
  }

  // transform data
  const statusData =
    stats.byStatus?.map((s) => ({ name: s.status, value: s._count._all })) ||
    [];
  const severityData =
    stats.bySeverity?.map((s) => ({
      name: s.severity,
      value: s._count._all,
    })) || [];
  const typeData =
    stats.byType?.map((s) => ({ name: s.type, value: s._count._all })) || [];

  const totalIncidents =
    stats.byStatus?.reduce((sum, s) => sum + s._count._all, 0) || 0;

  // Dummy resolution and response values
  const avgResolution =
    stats.resolutionHoursAvg > 0 ? stats.resolutionHoursAvg.toFixed(1) : "3.5"; // dummy
  const avgResponse = stats.averageResponseTime || 1.8; // dummy

  // Generate dummy monthly trend data
  const trendData = [
    { month: "Jan", incidents: 12, resolved: 10 },
    { month: "Feb", incidents: 15, resolved: 12 },
    { month: "Mar", incidents: 18, resolved: 17 },
    { month: "Apr", incidents: 20, resolved: 19 },
    { month: "May", incidents: 14, resolved: 13 },
    { month: "Jun", incidents: 22, resolved: 21 },
  ];

  // const getStatusIcon = (
  //   status: "RESOLVED" | "CLOSED" | "IN_PROGRESS" | "PENDING"
  // ) => {
  //   switch (status) {
  //     case "RESOLVED":
  //       return <CheckCircle className="h-4 w-4 text-green-500" />;
  //     case "CLOSED":
  //       return <XCircle className="h-4 w-4 text-gray-500" />;
  //     case "IN_PROGRESS":
  //       return <Clock className="h-4 w-4 text-blue-500" />;
  //     default:
  //       return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  //   }
  // };

  // const getSeverityIcon = (
  //   severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  // ) => {
  //   switch (severity) {
  //     case "CRITICAL":
  //       return <AlertTriangle className="h-4 w-4 text-red-600" />;
  //     case "HIGH":
  //       return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  //     default:
  //       return <AlertCircle className="h-4 w-4 text-gray-500" />;
  //   }
  // };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Incidents
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalIncidents}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Resolved (All)
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.byStatus?.find((s) => s.status === "RESOLVED")?._count
                  ._all || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Resolution
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {avgResolution}h
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{avgResponse}h</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Status Distribution - Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Incidents by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.status[index % COLORS.status.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution - Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Incidents by Severity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS.severity[index % COLORS.severity.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Type Breakdown
        </h3>
        <div className="space-y-3">
          {typeData.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-700">
                {s.name.replace(/_/g, " ")}
              </span>
              <Badge>{s.value}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Incident Trends (Last 6 Months)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="incidents"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncidents)"
                name="Total Incidents"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorResolved)"
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
