"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { DeskIcon } from "@/components/DeskIcon";
import { PrimaryButton } from "@/components/PrimaryButton";
import { MAX_SOURCE_CHARS, QUESTION_COUNTS, type QuestionCount } from "@/lib/types";

export function NoteInputForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [count, setCount] = useState<QuestionCount>(3);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ratio = text.length / MAX_SOURCE_CHARS;
  const nearLimit = MAX_SOURCE_CHARS - text.length <= 150;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setError("กรุณาวางสรุปเนื้อหาก่อนสร้างชุดทบทวน");
      return;
    }

    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, count }),
      });
      const body = (await response.json()) as {
        id?: string;
        error?: string;
      };

      if (!response.ok || !body.id) {
        setError(body.error ?? "สร้างชุดทบทวนไม่สำเร็จ ลองอีกครั้ง");
        return;
      }

      router.push(`/deck/${body.id}`);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองอีกครั้ง");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="sheet notebook" noValidate>
      <span className="notebook-clip" aria-hidden="true">
        <DeskIcon name="paperclip" />
      </span>
      <div className="field">
        <div className="field-head">
          <label htmlFor="note">สรุปเนื้อหา</label>
          <p
            className={ratio >= 1 ? "counter-meter is-full" : nearLimit ? "counter-meter is-near" : "counter-meter"}
            aria-live="polite"
          >
            <span>
              {text.length.toLocaleString("th-TH")}/{MAX_SOURCE_CHARS.toLocaleString("th-TH")}
            </span>
            <span className="counter-track">
              <i style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
            </span>
          </p>
        </div>
        <textarea
          id="note"
          name="note"
          value={text}
          maxLength={MAX_SOURCE_CHARS}
          rows={9}
          placeholder="วางสรุปจากคาบเรียน เป็นย่อหน้าหรือใจความที่จดไว้"
          onChange={(event) => {
            setText(event.target.value);
            setError(null);
          }}
          disabled={pending}
        />
      </div>

      <fieldset className="count-set" disabled={pending}>
        <legend>จำนวนข้อ</legend>
        <div className="count-options">
          {QUESTION_COUNTS.map((option) => (
            <label key={option} className={count === option ? "count-option is-selected" : "count-option"}>
              <input
                type="radio"
                name="count"
                value={option}
                checked={count === option}
                onChange={() => setCount(option)}
              />
              <Image
                src={option === 3 ? "/icons/icon-short.jpg" : "/icons/icon-long.jpg"}
                alt=""
                width={96}
                height={96}
                className="count-art"
              />
              <span>{option.toLocaleString("th-TH")} ข้อ</span>
              <small>{option === 3 ? "สั้น กระชับ ทวนเร็ว" : "ละเอียดขึ้นอีกนิด"}</small>
              {count === option ? <DeskIcon name="check" className="count-tick" /> : null}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="form-actions">
        <PrimaryButton type="submit" disabled={pending} aria-busy={pending}>
          <DeskIcon name="sparkles" className={pending ? "is-spin" : undefined} />
          {pending ? "กำลังสร้างการ์ด..." : "สร้างชุดทบทวน"}
        </PrimaryButton>
        <div className="form-aside">
          {pending ? (
            <p className="form-status" role="status">
              กำลังอ่านสรุป แล้วจัดเป็นการ์ดกับข้อสอบ
            </p>
          ) : null}
          <p className="form-note">
            <DeskIcon name="cycle" />
            สรุปเดิมจะได้ชุดเดิมกลับมา ไม่สร้างซ้ำ
          </p>
        </div>
      </div>
    </form>
  );
}
