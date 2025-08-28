import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { apiClient } from "../api-client";

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
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  avgResolutionTime: number;
  openIncidents: number;
}

// Queries
export const fetchIncidents = async (filters: IncidentFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  const endpoint = params.toString() ? `/incidents?${params}` : "/incidents";
  return apiClient.get(endpoint);
};

export const fetchIncidentDetail = async (id: string) =>
  apiClient.get(`/incidents/${id}`);

export const fetchIncidentStats = async () =>
  apiClient.get<IncidentStats>("/incidents/stats");

export const fetchCars = async () => apiClient.get("/incidents/cars");
export const fetchUsers = async () => apiClient.get("/incidents/users");

// React Query Hooks
export const useIncidents = (filters: IncidentFilters = {}) =>
  useQuery({
    queryKey: queryKeys.incidents.list(filters),
    queryFn: () => fetchIncidents(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useIncidentDetail = (id: string) =>
  useQuery({
    queryKey: queryKeys.incidents.detail(id),
    queryFn: () => fetchIncidentDetail(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });

export const useIncidentStats = () =>
  useQuery({
    queryKey: queryKeys.incidents.stats(),
    queryFn: fetchIncidentStats,
    staleTime: 5 * 60 * 1000,
  });
export const useCars = () =>
  useQuery({
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
    mutationFn: (data: any) => apiClient.post("/incidents", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.incidents.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.incidents.stats() });
    },
  });
};

export const useUpdateIncident = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/incidents/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.incidents.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.incidents.detail(vars.id) });
      qc.invalidateQueries({ queryKey: queryKeys.incidents.stats() });
    },
  });
};

export const useAddIncidentComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment, userId }: { id: string; comment: string, userId: number }) =>
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
