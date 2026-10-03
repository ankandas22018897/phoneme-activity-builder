import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalWordLists,
      totalActivities,
      wordleActivitiesCount,
      wordSearchActivitiesCount,
      totalGenerations,
      successfulGenerations,
      failedGenerations,
      recentFailures,
      telemetrySessions,
      recentGenerations,
      emptyWordLists,
      storedActivities,
      wordleGenerations,
      wordSearchGenerations,
    ] = await Promise.all([
      prisma.wordList.count(),
      prisma.activityConfiguration.count(),
      prisma.activityConfiguration.count({ where: { activityType: "WORDLE" } }),
      prisma.activityConfiguration.count({ where: { activityType: "WORD_SEARCH" } }),
      prisma.generationLog.count(),
      prisma.generationLog.count({ where: { status: "SUCCESS" } }),
      prisma.generationLog.count({ where: { status: "FAILED" } }),
      prisma.generationLog.findMany({
        where: { status: "FAILED" },
        orderBy: { timestamp: "desc" },
        take: 8,
      }),
      prisma.telemetrySession.findMany({
        select: {
          pagePath: true,
          durationSeconds: true,
          deviceType: true,
          timestamp: true,
        },
      }),
      prisma.generationLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 15,
        include: {
          activity: {
            select: { name: true },
          },
        },
      }),
      prisma.wordList.findMany({
        where: { words: { none: {} } },
        select: { id: true, name: true },
      }),
      prisma.activityConfiguration.findMany({
        take: 6,
        orderBy: { id: "desc" },
        include: {
          wordList: {
            select: {
              name: true,
              words: {
                select: { id: true, english: true, phonemes: true },
              },
            },
          },
        },
      }),
      prisma.generationLog.count({ where: { activityType: "WORDLE" } }),
      prisma.generationLog.count({ where: { activityType: "WORD_SEARCH" } }),
    ]);

    // Most-used activity type: based on real usage (generation events),
    // falling back to saved configuration counts when usage is tied.
    const wordleScore = wordleGenerations * 1000 + wordleActivitiesCount;
    const wordSearchScore = wordSearchGenerations * 1000 + wordSearchActivitiesCount;
    let mostUsedActivityType = "Equal";
    if (wordleScore > wordSearchScore) {
      mostUsedActivityType = "Wordle";
    } else if (wordSearchScore > wordleScore) {
      mostUsedActivityType = "Word Search";
    }

    // Calculate average time on page overall and by page
    const totalDuration = telemetrySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const overallAvgTimeOnPage = telemetrySessions.length > 0
      ? Math.round(totalDuration / telemetrySessions.length)
      : 0;

    const pageTimeMap = {};
    const pageVisitMap = {};
    for (const session of telemetrySessions) {
      if (!pageTimeMap[session.pagePath]) {
        pageTimeMap[session.pagePath] = { sum: 0, count: 0 };
      }
      pageTimeMap[session.pagePath].sum += session.durationSeconds;
      pageTimeMap[session.pagePath].count += 1;

      pageVisitMap[session.pagePath] = (pageVisitMap[session.pagePath] || 0) + 1;
    }

    const pageStats = Object.keys(pageTimeMap).map((path) => ({
      path,
      visits: pageTimeMap[path].count,
      avgDurationSeconds: Math.round(pageTimeMap[path].sum / pageTimeMap[path].count),
    }));

    // Device breakdown
    const deviceMap = {};
    for (const s of telemetrySessions) {
      deviceMap[s.deviceType] = (deviceMap[s.deviceType] || 0) + 1;
    }

    // Success rate
    const successRate = totalGenerations > 0
      ? ((successfulGenerations / totalGenerations) * 100).toFixed(1)
      : "100.0";

    // Build operational warnings & alerts
    const activeAlerts = [];
    if (failedGenerations > 0) {
      activeAlerts.push({
        id: "alert-gen-fail",
        type: "warning",
        title: "Generation Failure Signals Detected",
        message: `${failedGenerations} generation attempt(s) failed out of ${totalGenerations} total. Review generation error logs.`,
      });
    }

    if (emptyWordLists.length > 0) {
      activeAlerts.push({
        id: "alert-empty-lists",
        type: "warning",
        title: "Empty Word Lists in Database",
        message: `${emptyWordLists.length} list(s) have no associated words: ${emptyWordLists.map((l) => l.name).join(", ")}.`,
      });
    }

    return NextResponse.json({
      summary: {
        totalWordLists,
        totalActivities,
        wordleActivitiesCount,
        wordSearchActivitiesCount,
        mostUsedActivityType,
        wordleGenerations,
        wordSearchGenerations,
        totalSessions: telemetrySessions.length,
        totalGenerations,
        successfulGenerations,
        failedGenerations,
        successRate,
        overallAvgTimeOnPage,
      },
      pageStats,
      deviceDistribution: Object.entries(deviceMap).map(([device, count]) => ({
        device,
        count,
      })),
      recentFailures,
      recentGenerations,
      storedActivities,
      activeAlerts,
      systemHealth: {
        status: "UP",
        endpoint: "/health",
        httpCode: 200,
        database: "connected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { error: "Could not compile dashboard observability metrics." },
      { status: 500 }
    );
  }
}
