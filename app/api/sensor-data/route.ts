// TAMBAHKAN BARIS INI: Memaksa API tidak di-build secara statis
export const dynamic = "force-dynamic";

import { db } from "@/db/db";
import { sensorData } from "@/db/schema";
import { count, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "20";

  const total = await db.select({ count: count() }).from(sensorData);
  const totalPage = Math.ceil(total[0].count / Number(limit));
  const hasNextPage = Number(page) < totalPage;

  const data = await db
    .select()
    .from(sensorData)
    .orderBy(desc(sensorData.timestamp))
    .limit(Number(limit))
    .offset((Number(page) - 1) * Number(limit));

  return NextResponse.json({
    result: data,
    total: data.length,
    currentPage: Number(page),
    totalPage,
    hasNextPage,
  });
}