import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(users);
  } catch (e: any) {
    console.error("Error fetching users:", e);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
