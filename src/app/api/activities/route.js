import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateActivityInput } from "@/lib/validation";

function serialize(activity) {
  return { ...activity, metadata: activity.metadata ? JSON.parse(activity.metadata) : null };
}

function prismaData(value) {
  const { ok: _ok, ...data } = value;
  return data;
}

export async function GET() {
  try {
    const activities = await prisma.activityConfiguration.findMany({
      include: { wordList: { select: { id: true, name: true, _count: { select: { words: true } } } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(activities.map(serialize));
  } catch (error) {
    console.error("GET /api/activities failed:", error);
    return NextResponse.json({ error: "Could not retrieve activities." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const validation = validateActivityInput(await request.json());
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const list = await prisma.wordList.findUnique({ where: { id: validation.wordListId }, select: { id: true } });
    if (!list) return NextResponse.json({ error: "Word list not found." }, { status: 404 });
    const activity = await prisma.activityConfiguration.create({ data: prismaData(validation) });
    return NextResponse.json(serialize(activity), { status: 201 });
  } catch (error) {
    console.error("POST /api/activities failed:", error);
    return NextResponse.json({ error: "Could not save the activity configuration." }, { status: 500 });
  }
}
