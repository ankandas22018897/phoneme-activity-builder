import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const serverStartTime = Date.now();

export async function GET() {
  try {
    const startTime = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Math.round(performance.now() - startTime);

    const [wordListCount, activityCount, generationCount] = await Promise.all([
      prisma.wordList.count(),
      prisma.activityConfiguration.count(),
      prisma.generationLog.count(),
    ]);

    const memoryUsage = process.memoryUsage();

    const payload = {
      status: "healthy",
      service: "phoneme-activity-builder",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
      database: {
        status: "connected",
        provider: "sqlite",
        latencyMs: dbLatencyMs,
        counts: {
          wordLists: wordListCount,
          activities: activityCount,
          generationLogs: generationCount,
        },
      },
      system: {
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        memoryMb: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      },
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Health check failure:", error);
    const errorPayload = {
      status: "unhealthy",
      service: "phoneme-activity-builder",
      timestamp: new Date().toISOString(),
      database: {
        status: "disconnected",
        error: error.message,
      },
    };
    return new Response(JSON.stringify(errorPayload, null, 2), {
      status: 503,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
