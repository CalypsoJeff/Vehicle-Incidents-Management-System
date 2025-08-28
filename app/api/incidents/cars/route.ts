import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Car } from "@prisma/client"; // Prisma already generates types

export async function GET() {
  const cars: Car[] = await prisma.car.findMany({
    select: { id: true, vin: true, label: true },
  });
  return NextResponse.json(cars);
}
