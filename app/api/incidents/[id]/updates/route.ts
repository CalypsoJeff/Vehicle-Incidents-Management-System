import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { incidentUpdateNoteSchema } from "@/lib/validation/incidents";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await req.json();
  const input = incidentUpdateNoteSchema.parse(json);

  const created = await prisma.incidentUpdate.create({
    data: {
      incidentId: id,
      userId: input.userId,
      message: input.message,
      updateType: input.updateType,
    },
  });

  // notification logic could go here
  return NextResponse.json(created, { status: 201 });
}
