import axios from "axios";

export const api = axios.create({
  baseURL: "/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper methods (optional, so you can swap easily)
export const apiClient = {
  get: async <T = unknown>(url: string) => {
    const res = await api.get<T>(url);
    return res.data;
  },
  post: async <T = unknown>(url: string, data: unknown) => {
    const res = await api.post<T>(url, data);
    return res.data;
  },
  put: async <T = unknown>(url: string, data: unknown) => {
    const res = await api.put<T>(url, data);
    return res.data;
  },
  delete: async <T = unknown>(url: string) => {
    const res = await api.delete<T>(url);
    return res.data;
  },
};
