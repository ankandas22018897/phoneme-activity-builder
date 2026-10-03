import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWordListInput } from "@/lib/validation";

export async function GET() {
  try {
    const lists = await prisma.wordList.findMany({
      include: { _count: { select: { words: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(lists);
  } catch (error) {
    console.error("GET /api/word-lists failed:", error);
    return NextResponse.json({ error: "Could not retrieve word lists." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = validateWordListInput(body);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const created = await prisma.wordList.create({
      data: {
        name: validation.name,
        description: validation.description,
        words: { create: validation.words.map((word) => ({ english: word.english, phonemes: JSON.stringify(word.phonemes) })) },
      },
      include: { words: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/word-lists failed:", error);
    return NextResponse.json({ error: "Could not save the word list." }, { status: 500 });
  }
}
