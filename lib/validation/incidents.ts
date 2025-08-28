// lib/validation/incidents.ts
import { z } from "zod";

export const incidentCreateSchema = z.object({
  carId: z.number(),
  reportedById: z.number(),
  assignedToId: z.number().int().optional().nullable(),
  title: z.string().min(3),
  description: z.string().min(3),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"])
    .default("PENDING"),
  type: z.enum([
    "ACCIDENT",
    "BREAKDOWN",
    "THEFT",
    "VANDALISM",
    "MAINTENANCE_ISSUE",
    "TRAFFIC_VIOLATION",
    "FUEL_ISSUE",
    "OTHER",
  ]),

  // Optional location/time extras
  location: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  occurredAt: z.coerce.date(), // string -> Date
  carReadingId: z.number().int().optional().nullable(),
  images: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
});

export const incidentUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(3).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"])
    .optional(),
  type: z
    .enum([
      "ACCIDENT",
      "BREAKDOWN",
      "THEFT",
      "VANDALISM",
      "MAINTENANCE_ISSUE",
      "TRAFFIC_VIOLATION",
      "FUEL_ISSUE",
      "OTHER",
    ])
    .optional(),

  location: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  occurredAt: z.coerce.date().optional(),

  carReadingId: z.number().int().optional().nullable(),
  images: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  resolutionNotes: z.string().optional().nullable(),
  estimatedCost: z.number().optional().nullable(),
  actualCost: z.number().optional().nullable(),
  assignedToId: z.number().int().optional().nullable(),
});

export const incidentUpdateNoteSchema = z.object({
  userId: z.number().int().optional(),
  message: z.string().min(1),
  updateType: z.enum([
    "STATUS_CHANGE",
    "ASSIGNMENT",
    "COMMENT",
    "COST_UPDATE",
    "RESOLUTION",
  ]),
});
