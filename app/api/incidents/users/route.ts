import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { User } from "@prisma/client";

export async function GET() {
  const users: User[] = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(users);
}
