import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWordInput } from "@/lib/validation";

function idFrom(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid word ID." }, { status: 400 });
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) return NextResponse.json({ error: "Word not found." }, { status: 404 });
    return NextResponse.json({ ...word, phonemes: JSON.parse(word.phonemes) });
  } catch (error) {
    console.error("GET word failed:", error);
    return NextResponse.json({ error: "Could not retrieve the word." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid word ID." }, { status: 400 });
    const validation = validateWordInput(await request.json());
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
    const word = await prisma.word.update({ where: { id }, data: { english: validation.english, phonemes: JSON.stringify(validation.phonemes) } });
    return NextResponse.json({ ...word, phonemes: validation.phonemes });
  } catch (error) {
    console.error("PUT word failed:", error);
    if (error.code === "P2025") return NextResponse.json({ error: "Word not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not update the word." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = idFrom(await params);
    if (!id) return NextResponse.json({ error: "Invalid word ID." }, { status: 400 });
    const result = await prisma.word.deleteMany({ where: { id } });
    if (!result.count) return NextResponse.json({ error: "Word not found." }, { status: 404 });
    return NextResponse.json({ message: "Word deleted." });
  } catch (error) {
    console.error("DELETE word failed:", error);
    return NextResponse.json({ error: "Could not delete the word." }, { status: 500 });
  }
}
