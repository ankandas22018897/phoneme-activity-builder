import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWordListInput } from "@/lib/validation";

function idFrom(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid word list ID." }, { status: 400 });
    const list = await prisma.wordList.findUnique({ where: { id }, include: { words: { orderBy: { id: "asc" } }, activities: true } });
    if (!list) return NextResponse.json({ error: "Word list not found." }, { status: 404 });
    return NextResponse.json({ ...list, words: list.words.map((w) => ({ ...w, phonemes: JSON.parse(w.phonemes) })) });
  } catch (error) {
    console.error("GET word list failed:", error);
    return NextResponse.json({ error: "Could not retrieve the word list." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid word list ID." }, { status: 400 });
    const body = await request.json();
    const validation = validateWordListInput(body);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const exists = await prisma.wordList.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Word list not found." }, { status: 404 });
    const updated = await prisma.$transaction(async (tx) => {
      await tx.word.deleteMany({ where: { wordListId: id } });
      return tx.wordList.update({
        where: { id },
        data: {
          name: validation.name,
          description: validation.description,
          words: { create: validation.words.map((word) => ({ english: word.english, phonemes: JSON.stringify(word.phonemes) })) },
        },
        include: { words: true },
      });
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT word list failed:", error);
    return NextResponse.json({ error: "Could not update the word list." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid word list ID." }, { status: 400 });
    const result = await prisma.wordList.deleteMany({ where: { id } });
    if (!result.count) return NextResponse.json({ error: "Word list not found." }, { status: 404 });
    return NextResponse.json({ message: "Word list deleted." });
  } catch (error) {
    console.error("DELETE word list failed:", error);
    return NextResponse.json({ error: "Could not delete the word list." }, { status: 500 });
  }
}
