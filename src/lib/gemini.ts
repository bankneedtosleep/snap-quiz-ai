import "server-only";

import { GoogleGenAI, Type } from "@google/genai";

import { readDeckContent } from "@/lib/deck-content";
import type { DeckContent, QuestionCount, TokenUsage } from "@/lib/types";

const MODEL = "gemini-2.5-flash-lite";

function deckSchema(count: QuestionCount) {
  return {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "ชื่อหัวข้อสั้น ไม่เกิน 80 ตัวอักษร",
      },
      cards: {
        type: Type.ARRAY,
        minItems: count,
        maxItems: count,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
          },
          required: ["question", "answer"],
          propertyOrdering: ["question", "answer"],
        },
      },
      quizzes: {
        type: Type.ARRAY,
        minItems: count,
        maxItems: count,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              minItems: 4,
              maxItems: 4,
              items: { type: Type.STRING },
            },
            answerIndex: {
              type: Type.INTEGER,
              description: "ดัชนีตัวเลือกที่ถูก เริ่มที่ 0 ถึง 3",
            },
          },
          required: ["question", "options", "answerIndex"],
          propertyOrdering: ["question", "options", "answerIndex"],
        },
      },
    },
    required: ["title", "cards", "quizzes"],
    propertyOrdering: ["title", "cards", "quizzes"],
  };
}

export async function generateDeck(text: string, count: QuestionCount): Promise<{
  content: DeckContent;
  usage: TokenUsage;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("ยังไม่ได้ตั้งค่า GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: text,
    config: {
      systemInstruction: [
        "สร้างชุดทบทวนจากโน้ตที่ผู้ใช้ให้เท่านั้น",
        "ห้ามใช้ความรู้ภายนอก และห้ามแต่งข้อเท็จจริงที่ไม่มีในโน้ต",
        "ถ้าโน้ตมีข้อมูลน้อย ให้ถามจากประโยคที่มีอยู่จริง",
        "ใช้ภาษาเดียวกับโน้ต ทั้งคำถาม คำตอบ และตัวเลือก",
        "คำถามและคำตอบต้องสั้น อ่านจบในการ์ดใบเดียว",
        `สร้างแฟลชการ์ด ${count} ใบ และข้อสอบปรนัย ${count} ข้อ`,
        "แต่ละข้อมีตัวเลือก 4 ข้อที่ไม่ซ้ำกัน ตัวเลือกผิดต้องใกล้เคียงแต่ขัดกับโน้ต",
        "answerIndex เป็นจำนวนเต็ม 0 ถึง 3",
        "ห้ามใส่คำทักทายหรือคำอธิบายนอกโครงสร้างที่กำหนด",
      ].join("\n"),
      temperature: 0.2,
      maxOutputTokens: count === 3 ? 1400 : 2200,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: deckSchema(count),
    },
  });

  if (!response.text) {
    throw new Error("AI ไม่ได้ส่งข้อสอบกลับมา ลองใหม่อีกครั้ง");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(response.text);
  } catch {
    throw new Error("AI ตอบกลับไม่ใช่ JSON ที่อ่านได้");
  }

  const usageMeta = response.usageMetadata;

  return {
    content: readDeckContent(parsed, count),
    usage: {
      promptTokens: usageMeta?.promptTokenCount ?? 0,
      outputTokens: usageMeta?.candidatesTokenCount ?? 0,
      totalTokens: usageMeta?.totalTokenCount ?? 0,
    },
  };
}
