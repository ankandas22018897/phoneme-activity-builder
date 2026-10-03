import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateActivityInput } from "@/lib/validation";

function idFrom(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function serialize(activity) {
  return { ...activity, metadata: activity.metadata ? JSON.parse(activity.metadata) : null };
}

function prismaData(value) {
  const { ok: _ok, ...data } = value;
  return data;
}

export async function GET(_request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid activity ID." }, { status: 400 });
    const activity = await prisma.activityConfiguration.findUnique({ where: { id }, include: { wordList: { include: { words: true } } } });
    if (!activity) return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    return NextResponse.json({ ...serialize(activity), wordList: { ...activity.wordList, words: activity.wordList.words.map((w) => ({ ...w, phonemes: JSON.parse(w.phonemes) })) } });
  } catch (error) {
    console.error("GET activity failed:", error);
    return NextResponse.json({ error: "Could not retrieve the activity." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid activity ID." }, { status: 400 });
    const validation = validateActivityInput(await request.json());
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const activity = await prisma.activityConfiguration.update({ where: { id }, data: prismaData(validation) });
    return NextResponse.json(serialize(activity));
  } catch (error) {
    console.error("PUT activity failed:", error);
    if (error.code === "P2025") return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not update the activity." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid activity ID." }, { status: 400 });
    const result = await prisma.activityConfiguration.deleteMany({ where: { id } });
    if (!result.count) return NextResponse.json({ error: "Activity not found." }, { status: 404 });
    return NextResponse.json({ message: "Activity deleted." });
  } catch (error) {
    console.error("DELETE activity failed:", error);
    return NextResponse.json({ error: "Could not delete the activity." }, { status: 500 });
  }
}
