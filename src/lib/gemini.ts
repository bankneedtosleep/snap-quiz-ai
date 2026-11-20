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
            question: {
              type: Type.STRING,
              description: "ใจความจากสรุป 1-2 ประโยค ให้ผู้เรียนอ่านบนหน้าการ์ด ไม่ใช่คำถาม",
            },
            answer: {
              type: Type.STRING,
              description: "บอกว่าต้องเล่าอะไรได้จากใจความนั้น เป็นประโยคสั้น ไม่ใช่คำศัพท์ที่ซ่อนไว้",
            },
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
            question: {
              type: Type.STRING,
              description: "คำพูดของเพื่อนที่เล่าสรุปผิดหรือเล่าไม่ครบ",
            },
            options: {
              type: Type.ARRAY,
              minItems: 4,
              maxItems: 4,
              items: {
                type: Type.STRING,
                description: "คำอธิบายว่าคำพูดนั้นตรงหรือพลาดจากสรุปตรงไหน",
              },
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
        "สร้างชุดให้อ่านสรุปแล้วจับใจความ ไม่ใช่ชุดท่องคำตอบ",
        "ใช้เฉพาะข้อความในสรุป ห้ามเติมความรู้ภายนอก และห้ามแต่งข้อเท็จจริงที่ไม่มีในสรุป",
        "ถ้าสรุปสั้น ให้ยึดประโยคที่มีอยู่จริง ห้ามดึงคำจากวิชาอื่นมาทำตัวลวง",
        "ใช้ภาษาเดียวกับสรุป",
        `สร้างการ์ด ${count} ใบ และข้อสอบ ${count} ข้อ คนละประเด็นกัน`,
        "หน้าการ์ด (question) คือใจความจากสรุป 1-2 ประโยค ให้ผู้เรียนอ่านได้ทันที",
        "หลังการ์ด (answer) บอกว่าต้องเล่าอะไรได้จากใจความนั้น เช่น เล่าให้ได้ว่าเกิดที่ไหน ของอะไรเข้า และของอะไรออก",
        "ห้ามให้หน้าการ์ดเป็นคำถาม และห้ามให้หลังการ์ดเป็นคำศัพท์คำเดียว",
        "ข้อสอบเป็นการเล่าของเพื่อนที่ผิดหรือไม่ครบ แล้วให้เลือกคำอธิบายว่าพลาดจากสรุปตรงไหน",
        "ตัวเลือกทั้ง 4 ข้อเป็นคำวิจารณ์คำพูดนั้น ไม่ใช่ตัวเลือกคำศัพท์",
        "ข้อที่ถูกต้องชี้จุดที่พลาดโดยอ้างสรุป ข้อที่ผิดคือคำวิจารณ์ที่อ่านสรุปกลับด้าน",
        "ห้ามถามความหมายของคำ ห้ามเติมช่องว่าง ห้ามให้เลือกประโยคที่ถูกจากตัวเลือกที่เหลือเป็นคำผิด",
        "answerIndex เป็นจำนวนเต็ม 0 ถึง 3",
        "ห้ามใส่คำทักทายหรือคำอธิบายนอกโครงสร้างที่กำหนด",
      ].join("\n"),
      temperature: 0.2,
      maxOutputTokens: count === 3 ? 2000 : 3200,
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
