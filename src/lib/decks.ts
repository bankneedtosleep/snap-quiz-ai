import "server-only";

import { cache } from "react";
import { connection } from "next/server";

import { readDeckContent } from "@/lib/deck-content";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DeckContent, DeckRecord, DeckSummary } from "@/lib/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cardCount(value: unknown) {
  if (!value || typeof value !== "object") return 0;
  const cards = (value as { cards?: unknown }).cards;
  return Array.isArray(cards) ? cards.length : 0;
}

export async function listDecks(): Promise<{ decks: DeckSummary[]; error: string | null }> {
  await connection();

  if (!isSupabaseConfigured()) {
    return {
      decks: [],
      error: "ยังไม่ได้เชื่อม Supabase ใส่ SUPABASE_URL และ SUPABASE_ANON_KEY ใน .env.local แล้วรันไฟล์ supabase/schema.sql",
    };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("decks")
    .select("id, title, created_at, content_json")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return {
      decks: [],
      error: "ดึงประวัติชุดทบทวนไม่ได้ ตรวจว่าสร้างตาราง decks แล้วและเปิดสิทธิ์ select",
    };
  }

  const decks = (data ?? []).flatMap((row) => {
    if (!row.id || !row.title || !row.created_at) return [];
    return [{ id: row.id, title: row.title, createdAt: row.created_at, questionCount: cardCount(row.content_json) }];
  });

  return { decks, error: null };
}

export const getDeck = cache(async (id: string): Promise<DeckRecord | null> => {
  await connection();

  if (!UUID_PATTERN.test(id) || !isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("decks")
    .select("id, title, content_json, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data?.id || !data.created_at) return null;

  const content = readDeckContent(data.content_json);

  return {
    id: data.id,
    title: data.title || "ชุดทบทวน",
    createdAt: data.created_at,
    questionCount: content.cards.length,
    content,
  };
});

export async function findDeckIdByHash(sourceHash: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("decks")
    .select("id")
    .eq("source_hash", sourceHash)
    .maybeSingle();

  if (error) {
    throw new Error("ตรวจชุดทบทวนเดิมในฐานข้อมูลไม่ได้");
  }

  return data?.id ?? null;
}

export async function insertDeck(input: {
  title: string;
  sourceHash: string;
  content: DeckContent;
}): Promise<{ id: string; reused: boolean }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("decks")
    .insert({
      title: input.title,
      source_hash: input.sourceHash,
      content_json: input.content,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    const id = await findDeckIdByHash(input.sourceHash);
    if (!id) throw new Error("พบชุดทบทวนเดิมแต่เปิดไม่สำเร็จ");
    return { id, reused: true };
  }

  if (error || !data?.id) {
    throw new Error("บันทึกชุดทบทวนลงฐานข้อมูลไม่ได้");
  }

  return { id: data.id, reused: false };
}

export async function deleteDeck(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new Error("ไม่พบชุดทบทวนนี้");
  }

  if (!isSupabaseConfigured()) {
    throw new Error("ยังไม่ได้เชื่อม Supabase");
  }

  const supabase = getSupabase();
  const { error, count } = await supabase.from("decks").delete({ count: "exact" }).eq("id", id);

  if (error || !count) {
    throw new Error("ลบชุดทบทวนไม่ได้ ลองอีกครั้ง");
  }
}
