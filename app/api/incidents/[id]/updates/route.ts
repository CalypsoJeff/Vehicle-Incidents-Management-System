import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { incidentUpdateNoteSchema } from "@/lib/validation/incidents";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; 
  const incidentId = Number(id);

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
  });
  if (!incident) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json();
  const input = incidentUpdateNoteSchema.parse(json);

  const created = await prisma.incidentUpdate.create({
    data: {
      incidentId,
      userId: input.userId ?? 0,
      message: input.message,
      updateType: input.updateType,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
