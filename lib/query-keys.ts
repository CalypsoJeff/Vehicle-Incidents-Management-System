export const queryKeys = {
  incidents: {
    lists: () => ["incidents", "list"],
    list: (filters: any) => ["incidents", "list", filters],
    detail: (id: string | number) => ["incidents", "detail", id],
    stats: () => ["incidents", "stats"],
  },
  users: {
    list: () => ["users"] as const,
    detail: (id: string | number) => ["user", id] as const,
  },
  cars: {
    list: () => ["cars"] as const,
    detail: (id: string | number) => ["car", id] as const,
  },
};
