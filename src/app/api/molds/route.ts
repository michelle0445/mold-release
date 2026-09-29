import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const molds = await prisma.moldRequest.findMany({
    select: { moldNumber: true }, distinct: ["moldNumber"], orderBy: { moldNumber: "asc" }, take: 100,
  });
  return NextResponse.json(molds.map((m: any) => m.moldNumber));
}
