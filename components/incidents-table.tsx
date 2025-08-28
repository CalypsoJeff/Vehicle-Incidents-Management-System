"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Eye,
  Edit3,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
} from "lucide-react";
import { IncidentWithRelations } from "@/lib/queries/incidents";

// interface Incident {
//   id: number;
//   title: string;
//   description: string;
//   status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "CANCELLED";
//   severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
//   occurredAt?: string;
//   reportedAt?: string;
//   carId?: number;
//   reportedBy?: string;
// }

export default function IncidentsTable({
  incidents,
}: {
  incidents: IncidentWithRelations[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filter incidents based on search and filters
  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || incident.status === statusFilter;
    const matchesSeverity =
      severityFilter === "all" || incident.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredIncidents.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedIncidents = filteredIncidents.slice(
    startIndex,
    startIndex + pageSize
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "CLOSED":
        return <XCircle className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;

      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  if (!incidents?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No incidents found
        </h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first incident report.
        </p>
        <Button className="bg-primary hover:bg-primary/90">
          <Link
            href="/fleetmanager/incidents/new"
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // reset page
              }}
              className="pl-10 bg-card border-border focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            <label className="text-sm font-medium pt-2" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // reset page
              }}
              className="px-3 py-2 border border-border rounded-lg bg-card text-card-foreground"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <label
              className="text-sm font-medium pt-2"
              htmlFor="severity-filter"
            >
              Severity
            </label>
            <select
              id="severity-filter"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setPage(1); // reset page
              }}
              className="px-3 py-2 border border-border rounded-lg bg-card text-card-foreground"
            >
              <option value="all">All Severity</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <Button className="bg-primary hover:bg-primary/90">
          <Link
            href="/fleetmanager/incidents/new"
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Link>
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1}–
        {Math.min(startIndex + pageSize, filteredIncidents.length)} of{" "}
        {filteredIncidents.length} incidents
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="bg-primary/5 border-b border-border px-6 py-4">
            <div className="grid grid-cols-12 gap-4 font-semibold text-sm text-foreground">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Incident</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Severity</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border">
            {paginatedIncidents.map((incident) => (
              <div
                key={incident.id}
                className="px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <span className="font-mono text-sm text-muted-foreground">
                      #{incident.id}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <h3 className="font-semibold">{incident.title}</h3>
                    {incident.reportedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(incident.reportedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="col-span-4">
                    <p className="text-sm line-clamp-2">
                      {incident.description}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <Badge
                      className={`${getStatusColor(
                        incident.status
                      )} flex items-center gap-1 w-fit`}
                    >
                      {getStatusIcon(incident.status)}
                      {incident.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="col-span-1">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </div>

                  <div className="col-span-1 flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Link href={`/fleetmanager/incidents/${incident.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Link
                        href={`/fleetmanager/incidents/${incident.id}/edit`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Mobile Card View (paginated too) */}
      <div className="lg:hidden space-y-4">
        {paginatedIncidents.map((incident) => (
          <Card key={incident.id} className="border">
            <CardContent className="p-4">
              <div className="flex justify-between">
                <h3 className="font-semibold">{incident.title}</h3>
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
              </div>
              <p className="text-sm mt-2">{incident.description}</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm">
                  <Link href={`/fleetmanager/incidents/${incident.id}`}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Link href={`/fleetmanager/incidents/${incident.id}/edit`}>
                    <Edit3 className="w-4 h-4 mr-1" /> Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* ✅ Pagination Controls for mobile */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
