/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { incidentCreateSchema } from "@/lib/validation/incidents";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const take = Math.min(Number(searchParams.get("limit") ?? "20"), 100);
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const skip = (page - 1) * take;

  const status = searchParams.get("status") ?? undefined;
  const severity = searchParams.get("severity") ?? undefined;
  const carId = searchParams.get("carId") ? Number(searchParams.get("carId")) : undefined;
  const assignedToId = searchParams.get("assignedToId") ? Number(searchParams.get("assignedToId")) : undefined;
  const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
  const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
  const q = searchParams.get("query")?.trim();

  const where: any = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (carId) where.carId = carId;
  if (assignedToId) where.assignedToId = assignedToId;
  if (startDate || endDate) {
    where.occurredAt = {};
    if (startDate) where.occurredAt.gte = startDate;
    if (endDate) where.occurredAt.lte = endDate;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      include: { car: true, reportedBy: true, assignedTo: true },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
      take,
      skip,
    }),
    prisma.incident.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit: take });
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = incidentCreateSchema.parse(json);

    const created = await prisma.incident.create({ data: { ...input } });

    await prisma.incidentUpdate.create({
      data: {
        incidentId: created.id,
        userId: input.reportedById ?? 0,
        message: "Incident created",
        updateType: "COMMENT",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    const message = e?.issues?.[0]?.message ?? e?.message ?? "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
