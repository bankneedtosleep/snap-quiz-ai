import type { DeckContent, QuestionCount } from "@/lib/types";

function clip(value: string, max: number) {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max).trim() : trimmed;
}

export function readDeckContent(value: unknown, count?: QuestionCount): DeckContent {
  if (!value || typeof value !== "object") {
    throw new Error("รูปแบบข้อสอบไม่ถูกต้อง");
  }

  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? clip(record.title, 80) : "";
  const cards = Array.isArray(record.cards) ? record.cards : null;
  const quizzes = Array.isArray(record.quizzes) ? record.quizzes : null;

  if (!title || !cards || !quizzes) {
    throw new Error("AI ตอบกลับไม่ครบหัวข้อ การ์ด หรือข้อสอบ");
  }

  if (count && (cards.length !== count || quizzes.length !== count)) {
    throw new Error("AI ตอบไม่ครบจำนวนข้อที่เลือก ลองสร้างใหม่อีกครั้ง");
  }

  const parsedCards = cards.map((card) => {
    if (!card || typeof card !== "object") {
      throw new Error("การ์ดบางใบว่างเปล่า");
    }
    const item = card as Record<string, unknown>;
    const question = typeof item.question === "string" ? clip(item.question, 300) : "";
    const answer = typeof item.answer === "string" ? clip(item.answer, 400) : "";
    if (!question || !answer) throw new Error("การ์ดบางใบไม่มีคำถามหรือคำตอบ");
    return { question, answer };
  });

  const parsedQuizzes = quizzes.map((quiz) => {
    if (!quiz || typeof quiz !== "object") {
      throw new Error("ข้อสอบบางข้อว่างเปล่า");
    }
    const item = quiz as Record<string, unknown>;
    const question = typeof item.question === "string" ? clip(item.question, 300) : "";
    const options = Array.isArray(item.options)
      ? item.options
          .filter((option): option is string => typeof option === "string")
          .map((option) => clip(option, 200))
      : [];
    const answerIndex = item.answerIndex;

    if (!question || options.length !== 4 || options.some((option) => option.length === 0)) {
      throw new Error("ตัวเลือกของข้อสอบไม่ครบ 4 ข้อ");
    }

    if (
      typeof answerIndex !== "number" ||
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex > 3
    ) {
      throw new Error("เฉลยของข้อสอบไม่อยู่ในตัวเลือก");
    }

    return { question, options, answerIndex };
  });

  return { title, cards: parsedCards, quizzes: parsedQuizzes };
}
