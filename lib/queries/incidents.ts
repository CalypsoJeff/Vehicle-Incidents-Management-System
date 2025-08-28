import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { apiClient } from "../api-client";
import type { Incident, IncidentUpdate, User, Car } from "@prisma/client";

export type IncidentWithRelations = Incident & {
  car?: Car | null;
  reportedBy?: User | null;
  updates?: (IncidentUpdate & { user?: User | null })[];
};

export interface IncidentFilters {
  status?: string;
  severity?: string;
  carId?: number;
  assignedToId?: number;
  startDate?: string;
  endDate?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface IncidentStats {
  byStatus: { status: string; _count: { _all: number } }[];
  bySeverity: { severity: string; _count: { _all: number } }[];
  byType: { type: string; _count: { _all: number } }[];
  resolutionHoursAvg: number;
  averageResponseTime: number;
}

export interface IncidentsListResponse {
  items: IncidentWithRelations[];
}

// Queries
export const fetchIncidents = async (
  filters: IncidentFilters = {}
): Promise<IncidentsListResponse> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const endpoint = params.toString() ? `/incidents?${params}` : "/incidents";
  return apiClient.get<IncidentsListResponse>(endpoint); // ✅ fix here
};

export const fetchIncidentDetail = async (id: string) => {
  return apiClient.get<IncidentWithRelations>(`/incidents/${id}`);
};

export const fetchIncidentStats = async (): Promise<IncidentStats> => {
  return apiClient.get<IncidentStats>("/incidents/stats");
};

export const fetchCars = async (): Promise<Car[]> => {
  return apiClient.get("/incidents/cars");
};

export const fetchUsers = async (): Promise<User[]> =>
  apiClient.get("/incidents/users");

// React Query Hooks
export const useIncidents = (filters: IncidentFilters = {}) =>
  useQuery<IncidentsListResponse>({
    queryKey: queryKeys.incidents.list(filters),
    queryFn: () => fetchIncidents(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useIncidentDetail = (id: string) =>
  useQuery<IncidentWithRelations>({
    queryKey: queryKeys.incidents.detail(id),
    queryFn: () => fetchIncidentDetail(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });

export const useIncidentStats = () => {
  return useQuery<IncidentStats>({
    queryKey: queryKeys.incidents.stats(),
    queryFn: fetchIncidentStats,
    staleTime: 5 * 60 * 1000,
  });
};
export const useCars = () =>
  useQuery<Car[]>({
    queryKey: queryKeys.cars.list(),
    queryFn: fetchCars,
    staleTime: 10 * 60 * 1000,
  });

export const useUsers = () =>
  useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
    staleTime: 10 * 60 * 1000,
  });

// Mutations
export const useCreateIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiClient.post("/incidents", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.incidents.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.incidents.stats() });
    },
  });
};

export const useUpdateIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiClient.put(`/incidents/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.incidents.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.incidents.detail(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.incidents.stats() });
    },
  });
};

type CommentResponse = IncidentUpdate & { user?: User | null };

export const useAddIncidentComment = () => {
  const qc = useQueryClient();
  return useMutation<
    CommentResponse,
    Error,
    { id: string; comment: string; userId: number }
  >({
    mutationFn: ({ id, comment, userId }) =>
      apiClient.post(`/incidents/${id}/updates`, {
        message: comment,
        updateType: "COMMENT",
        userId,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.incidents.detail(vars.id) });
    },
  });
};
