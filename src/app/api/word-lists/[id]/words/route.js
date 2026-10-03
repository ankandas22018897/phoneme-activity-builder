import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWordInput } from "@/lib/validation";

export async function POST(request, { params }) {
  try {
    const id = Number((await params)?.id);
    if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid word list ID." }, { status: 400 });
    const validation = validateWordInput(await request.json());
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const list = await prisma.wordList.findUnique({ where: { id }, select: { id: true } });
    if (!list) return NextResponse.json({ error: "Word list not found." }, { status: 404 });
    const word = await prisma.word.create({ data: { wordListId: id, english: validation.english, phonemes: JSON.stringify(validation.phonemes) } });
    return NextResponse.json({ ...word, phonemes: validation.phonemes }, { status: 201 });
  } catch (error) {
    console.error("POST list word failed:", error);
    return NextResponse.json({ error: "Could not add the word." }, { status: 500 });
  }
}
