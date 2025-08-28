import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [byStatus, bySeverity, byType] = await Promise.all([
    prisma.incident.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.incident.groupBy({ by: ["severity"], _count: { _all: true } }),
    prisma.incident.groupBy({ by: ["type"], _count: { _all: true } }),
  ]);

  const resolved = await prisma.incident.findMany({
    where: { resolvedAt: { not: null } },
    select: { reportedAt: true, resolvedAt: true },
  });

  const hours = resolved.map(
    (r) => (Number(r.resolvedAt) - Number(r.reportedAt)) / 36e5
  );
  const resolutionHoursAvg = hours.length
    ? Number((hours.reduce((a, b) => a + b, 0) / hours.length).toFixed(2))
    : 0;

  return NextResponse.json({
    byStatus,
    bySeverity,
    byType,
    resolutionHoursAvg,
  });
}
