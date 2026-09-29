import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, pending, approvedToday, approvedWeek, rejectedWeek, totalMonth, urgentPending, criticalPending] = await Promise.all([
    prisma.moldRequest.count(),
    prisma.moldRequest.count({ where: { status: "PENDING" } }),
    prisma.moldRequest.count({ where: { status: "APPROVED", approvedAt: { gte: todayStart } } }),
    prisma.moldRequest.count({ where: { status: "APPROVED", approvedAt: { gte: weekStart } } }),
    prisma.moldRequest.count({ where: { status: "REJECTED", rejectedAt: { gte: weekStart } } }),
    prisma.moldRequest.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.moldRequest.count({ where: { status: "PENDING", priority: "URGENTE" } }),
    prisma.moldRequest.count({ where: { status: "PENDING", priority: "CRITICO" } }),
  ]);

  return NextResponse.json({
    total, pending, approvedToday, approvedWeek, rejectedWeek, totalMonth, urgentPending, criticalPending,
  });
}
