"use server";

import { revalidatePath } from "next/cache";

import { deleteDeck } from "@/lib/decks";

export async function removeDeck(id: string): Promise<{ error: string | null }> {
  try {
    await deleteDeck(id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "ลบชุดทบทวนไม่ได้ ลองอีกครั้ง" };
  }

  revalidatePath("/");
  revalidatePath(`/deck/${id}`);
  return { error: null };
}
