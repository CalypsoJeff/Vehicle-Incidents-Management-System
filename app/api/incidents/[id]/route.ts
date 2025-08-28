import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { incidentUpdateSchema } from "@/lib/validation/incidents";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const incidentId = Number(id);

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      updates: { include: { user: true }, orderBy: { createdAt: "desc" } },
      car: true,
      reportedBy: true,
      assignedTo: true,
    },
  });

  if (!incident) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(incident);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const incidentId = Number(id);

  const body = await req.json();
  const input = incidentUpdateSchema.parse(body);

  const before = await prisma.incident.findUnique({
    where: { id: incidentId },
  });
  if (!before) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.incident.update({
    where: { id: incidentId },
    data: input,
  });

  const changes: string[] = [];
  if (input.status && input.status !== before.status) {
    changes.push(`Status: ${before.status} -> ${input.status}`);
  }
  if (
    input.assignedToId !== undefined &&
    input.assignedToId !== before.assignedToId
  ) {
    changes.push(
      `Assignee: ${before.assignedToId ?? "none"} -> ${
        input.assignedToId ?? "none"
      }`
    );
  }
  if (
    input.estimatedCost !== undefined &&
    input.estimatedCost !== before.estimatedCost
  ) {
    changes.push("Estimated cost changed");
  }
  if (
    input.actualCost !== undefined &&
    input.actualCost !== before.actualCost
  ) {
    changes.push("Actual cost changed");
  }

  await prisma.incidentUpdate.create({
    data: {
      incidentId,
      userId: body.userId ?? before.reportedById,
      message: changes.join(" | ") || "Incident updated",
      updateType:
        input.status && input.status !== before.status
          ? "STATUS_CHANGE"
          : "COMMENT",
    },
  });

  return NextResponse.json(updated);
}
