import { findDeckIdByHash, insertDeck } from "@/lib/decks";
import { generateDeck } from "@/lib/gemini";
import { sourceHash } from "@/lib/hash";
import { isSupabaseConfigured } from "@/lib/supabase";
import { MAX_SOURCE_CHARS, type QuestionCount } from "@/lib/types";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function readCount(value: unknown): QuestionCount | null {
  return value === 3 || value === 5 ? value : null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("ส่งข้อมูลไม่ถูกต้อง", 400);
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const text = typeof record.text === "string" ? record.text.trim() : "";
  const count = readCount(record.count);

  if (!text) {
    return jsonError("กรุณาวางสรุปเนื้อหาก่อนสร้างชุดทบทวน", 400);
  }

  if (text.length > MAX_SOURCE_CHARS) {
    return jsonError(`สรุปยาวเกิน ${MAX_SOURCE_CHARS.toLocaleString("th-TH")} ตัวอักษร`, 400);
  }

  if (!count) {
    return jsonError("เลือกจำนวนข้อได้แค่ 3 หรือ 5 ข้อ", 400);
  }

  if (!process.env.GEMINI_API_KEY || !isSupabaseConfigured()) {
    return jsonError("ยังตั้งค่า GEMINI_API_KEY หรือ Supabase ไม่ครบใน .env.local", 503);
  }

  try {
    const hash = sourceHash(text, count);
    const existingId = await findDeckIdByHash(hash);

    if (existingId) {
      return Response.json({ id: existingId, cached: true, usage: null });
    }

    const generated = await generateDeck(text, count);
    const saved = await insertDeck({
      title: generated.content.title,
      sourceHash: hash,
      content: generated.content,
    });

    return Response.json({
      id: saved.id,
      cached: saved.reused,
      usage: saved.reused ? null : generated.usage,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "สร้างชุดทบทวนไม่สำเร็จ";
    const status = message.includes("ยังไม่ได้ตั้งค่า") ? 503 : 502;
    return jsonError(message, status);
  }
}
