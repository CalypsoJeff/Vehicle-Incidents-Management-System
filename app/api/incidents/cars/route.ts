import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/cars
export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(cars);
  } catch (e: any) {
    console.error("Error fetching cars:", e);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
