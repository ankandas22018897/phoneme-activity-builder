import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWordInput } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const listId = Number(body.wordListId);
    if (!Number.isInteger(listId) || listId < 1) return NextResponse.json({ error: "A valid wordListId is required." }, { status: 400 });
    const validation = validateWordInput(body);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const word = await prisma.word.create({ data: { wordListId: listId, english: validation.english, phonemes: JSON.stringify(validation.phonemes) } });
    return NextResponse.json({ ...word, phonemes: validation.phonemes }, { status: 201 });
  } catch (error) {
    console.error("POST /api/words failed:", error);
    return NextResponse.json({ error: "Could not create the word." }, { status: 500 });
  }
}
