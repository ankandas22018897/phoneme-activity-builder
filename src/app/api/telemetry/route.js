import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, ...payload } = body;

    if (type === "session") {
      const { sessionId, pagePath, durationSeconds, deviceType } = payload;
      if (!pagePath || typeof durationSeconds !== "number") {
        return NextResponse.json({ error: "Invalid session telemetry data." }, { status: 400 });
      }

      const session = await prisma.telemetrySession.create({
        data: {
          sessionId: sessionId || `live_${Date.now()}`,
          pagePath,
          durationSeconds: Math.max(1, Math.round(durationSeconds)),
          deviceType: deviceType || "desktop",
        },
      });

      return NextResponse.json({ success: true, id: session.id }, { status: 201 });
    }

    if (type === "generation") {
      const { activityType, activityId, status, durationMs, errorMessage, wordCount } = payload;
      if (!activityType || !status) {
        return NextResponse.json({ error: "Invalid generation log data." }, { status: 400 });
      }

      const log = await prisma.generationLog.create({
        data: {
          activityType,
          activityId: activityId || null,
          status,
          durationMs: durationMs || 0,
          errorMessage: errorMessage || null,
          wordCount: wordCount || null,
        },
      });

      return NextResponse.json({ success: true, id: log.id }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown telemetry event type." }, { status: 400 });
  } catch (error) {
    console.error("Telemetry ingest failed:", error);
    return NextResponse.json({ error: "Telemetry ingest error." }, { status: 500 });
  }
}
