export const MAX_SOURCE_CHARS = 1500;
export const QUESTION_COUNTS = [3, 5] as const;

export type QuestionCount = (typeof QUESTION_COUNTS)[number];

export type Flashcard = {
  question: string;
  answer: string;
};

export type QuizItem = {
  question: string;
  options: string[];
  answerIndex: number;
};

export type DeckContent = {
  title: string;
  cards: Flashcard[];
  quizzes: QuizItem[];
};

export type TokenUsage = {
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type DeckSummary = {
  id: string;
  title: string;
  createdAt: string;
  questionCount: number;
};

export type DeckRecord = DeckSummary & {
  content: DeckContent;
};
