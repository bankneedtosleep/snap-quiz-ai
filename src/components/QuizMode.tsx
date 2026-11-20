"use client";

import { useState } from "react";

import { DeskIcon } from "@/components/DeskIcon";
import { OutlineButton } from "@/components/OutlineButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { QuizItem } from "@/lib/types";

export function QuizMode({
  quizzes,
  onOpenCards,
}: {
  quizzes: QuizItem[];
  onOpenCards?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => quizzes.map(() => null));
  const [finished, setFinished] = useState(false);

  const quiz = quizzes[index];
  const picked = picks[index] ?? null;
  const correctCount = picks.filter((pick, itemIndex) => pick !== null && pick === quizzes[itemIndex]?.answerIndex).length;
  const wrongCount = picks.filter((pick, itemIndex) => pick !== null && pick !== quizzes[itemIndex]?.answerIndex).length;
  const leftCount = picks.filter((pick) => pick === null).length;

  function reset() {
    setIndex(0);
    setPicks(quizzes.map(() => null));
    setFinished(false);
  }

  function choose(optionIndex: number) {
    if (picks[index] !== null) return;
    setPicks((current) => current.map((item, itemIndex) => (itemIndex === index ? optionIndex : item)));
  }

  function continueQuiz() {
    if (index === quizzes.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
  }

  function jump(nextIndex: number) {
    setFinished(false);
    setIndex(nextIndex);
  }

  if (quizzes.length === 0 || !quiz) {
    return <p className="empty-copy">ชุดนี้ยังไม่มีข้อสอบ</p>;
  }

  const encouragement =
    correctCount === quizzes.length
      ? "ถูกทุกข้อในรอบนี้"
      : correctCount * 2 >= quizzes.length
        ? "ใกล้แล้ว ทวนการ์ดข้อที่พลาดอีกนิด"
        : "ทวนการ์ดข้อที่ยังพลาด แล้วลองใหม่อีกครั้ง";

  return (
    <div className="study-layout">
      <div className="study-main">
        <div className="quiz-status">
          <ol className="quiz-track" aria-hidden="true">
            {picks.map((pick, itemIndex) => {
              const state = pick === null ? "open" : pick === quizzes[itemIndex]?.answerIndex ? "right" : "wrong";
              return <li key={quizzes[itemIndex]?.question ?? itemIndex} className={`is-${state}`} />;
            })}
          </ol>
          <p className="quiz-score" aria-live="polite">
            ข้อ {(index + 1).toLocaleString("th-TH")} จาก {quizzes.length.toLocaleString("th-TH")} · ถูก{" "}
            {correctCount.toLocaleString("th-TH")}
          </p>
        </div>

        {finished ? (
          <div className="score-panel">
            <div
              className="score-ring"
              style={{ ["--progress" as string]: String(quizzes.length === 0 ? 0 : correctCount / quizzes.length) }}
            >
              <strong>
                {correctCount.toLocaleString("th-TH")}
                <span>/{quizzes.length.toLocaleString("th-TH")}</span>
              </strong>
            </div>
            <p className="eyebrow">{correctCount === quizzes.length ? "ถูกทุกข้อ" : "สรุปคะแนน"}</p>
            <p className="score-caption">{encouragement}</p>
            <div className="score-actions">
              <PrimaryButton type="button" onClick={reset}>
                <DeskIcon name="cycle" />
                ทำใหม่
              </PrimaryButton>
              {onOpenCards ? (
                <OutlineButton type="button" onClick={onOpenCards}>
                  <DeskIcon name="cards" />
                  ไปแฟลชการ์ด
                </OutlineButton>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="exam-sheet">
              <span className="exam-watermark" aria-hidden="true">
                {(index + 1).toLocaleString("th-TH")}
              </span>
              <h2 className="quiz-question">{quiz.question}</h2>
            </div>
            <div className="option-list" role="group" aria-label="ตัวเลือก">
              {quiz.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === quiz.answerIndex;
                const isPicked = optionIndex === picked;
                const state = picked === null ? "" : isCorrect ? " is-correct" : isPicked ? " is-wrong" : " is-dim";
                const label = picked === null ? "" : isCorrect ? "ถูก" : isPicked ? "ผิด" : "";

                return (
                  <button
                    key={`${index}-${optionIndex}`}
                    type="button"
                    className={`option${state}`}
                    onClick={() => choose(optionIndex)}
                    disabled={picked !== null}
                    aria-pressed={isPicked}
                  >
                    <span className="option-index">{String.fromCharCode(65 + optionIndex)}</span>
                    <span className="option-copy">{option}</span>
                    {label ? (
                      <span className="option-label">
                        <DeskIcon name={isCorrect ? "check" : "cross"} />
                        {label}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className={picked === null ? "result-line" : "result-line is-note"} aria-live="polite">
              {picked === null ? (
                <>
                  <DeskIcon name="lock" />
                  เลือกคำตอบได้ครั้งเดียว
                </>
              ) : picked === quiz.answerIndex ? (
                "ถูก"
              ) : (
                `ผิด คำตอบที่ถูกคือ ${quiz.options[quiz.answerIndex]}`
              )}
            </p>
            {picked !== null ? (
              <PrimaryButton type="button" className="next-rise" onClick={continueQuiz}>
                {index === quizzes.length - 1 ? "ดูคะแนน" : "ข้อถัดไป"}
                {index === quizzes.length - 1 ? null : <DeskIcon name="arrow" />}
              </PrimaryButton>
            ) : null}
          </>
        )}
      </div>

      <aside className="progress-panel">
        <h2>ข้อสอบ</h2>
        <div className="quiz-jumps" role="group" aria-label="ไปยังข้อ">
          {quizzes.map((item, itemIndex) => {
            const pick = picks[itemIndex];
            const state = pick === null ? "open" : pick === item.answerIndex ? "right" : "wrong";
            return (
              <button
                key={item.question}
                type="button"
                className={`quiz-jump is-${state}${itemIndex === index && !finished ? " is-current" : ""}`}
                aria-label={`ข้อ ${(itemIndex + 1).toLocaleString("th-TH")}`}
                onClick={() => jump(itemIndex)}
              >
                {(itemIndex + 1).toLocaleString("th-TH")}
              </button>
            );
          })}
        </div>
        <p className="quiz-tally">
          ถูก {correctCount.toLocaleString("th-TH")} · ผิด {wrongCount.toLocaleString("th-TH")} · เหลือ{" "}
          {leftCount.toLocaleString("th-TH")}
        </p>
        <ul className="quiz-legend">
          <li>
            <i className="is-right" aria-hidden="true" />
            ถูก
          </li>
          <li>
            <i className="is-wrong" aria-hidden="true" />
            ผิด
          </li>
          <li>
            <i className="is-open" aria-hidden="true" />
            ยังไม่ตอบ
          </li>
        </ul>
      </aside>
    </div>
  );
}
