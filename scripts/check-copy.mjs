#!/usr/bin/env node
// 이력서 원고의 기계적 교열 오류를 찾습니다. 문장의 질은 판단하지 않습니다.
// 사용: node scripts/check-copy.mjs [--terms terms.json] <파일...>
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const DEFAULT_TERMS = [
  { use: "스킬", avoid: ["skill", "Skill"] },
  { use: "폴백", avoid: ["fallback"] },
  { use: "프로덕션", avoid: ["production"] },
  { use: "폴링", avoid: ["Polling", "polling"] },
  { use: "Google Sheets", avoid: ["구글 시트"] },
  { use: "작업 시", avoid: ["작업시"] },
  { use: "결정 사항", avoid: ["결정사항"] },
];

const VAGUE = ["매우", "다양한", "성공적으로", "획기적", "혁신적", "완벽하게", "원활하게"];

// HTML이면 블록 경계를 줄바꿈으로 바꾸고 태그를 지웁니다. 굵은 글씨는 **로 남깁니다.
export function toLines(text) {
  if (!/<(p|li|ul|strong)\b/i.test(text)) return text.split("\n");
  return text
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|li|h\d)>/gi, "\n")
    .replace(/<\/?strong>/gi, "**")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((line) => line.replace(/^- \s*/, "- "));
}

// 코드 표기는 검사하지 않습니다. 자리만 남겨 앞뒤 공백 검사가 어긋나지 않게 합니다.
function maskCode(line) {
  return line.replace(/`[^`]*`/g, "CODE");
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 영문 표기는 단어 경계로만 찾습니다. "skills" 안의 "skill"처럼 다른 단어 일부는 잡지 않습니다.
function termPattern(term) {
  const body = escapeRegExp(term);
  return /^[A-Za-z]/.test(term) ? new RegExp(`(?<![A-Za-z_])${body}(?![A-Za-z_])`, "g") : new RegExp(body, "g");
}

export function check(text, { terms = DEFAULT_TERMS } = {}) {
  const lines = toLines(text);
  const findings = [];
  const add = (line, level, rule, message) => findings.push({ line, level, rule, message });
  let inFence = false;
  const usesMiddleDot = /\S·\S/.test(text);

  lines.forEach((raw, i) => {
    const n = i + 1;
    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const line = maskCode(raw);

    if (/\S {2,}\S/.test(line)) add(n, "error", "double-space", "공백이 두 칸 이상입니다");
    if (/\S[ \t]+$/.test(raw)) add(n, "warn", "trailing-space", "줄 끝에 공백이 있습니다");
    if (/\*\*[^*\n]+?:\*\*/.test(line)) add(n, "error", "colon-in-bold", "콜론을 굵은 글씨 밖으로 빼세요: **리드**:");

    for (const [open, close] of [["(", ")"], ["（", "）"], ["[", "]"]]) {
      const o = line.split(open).length - 1;
      const c = line.split(close).length - 1;
      if (o !== c) add(n, "error", "unbalanced-bracket", `괄호 ${open}${close}의 짝이 맞지 않습니다`);
    }

    if (usesMiddleDot && /\S 및 \S/.test(line)) add(n, "warn", "and-mix", "'·'와 '및'이 섞여 있습니다");
    if (/(19|20)\d{2}(\.\d{1,2})?\s*~/.test(line)) add(n, "warn", "range-tilde", "기간은 '–'로 씁니다");

    for (const word of VAGUE) {
      if (line.includes(word)) add(n, "warn", "vague", `근거 없는 수식어일 수 있습니다: ${word}`);
    }

    if (/^\s*[-*•]\s/.test(line) && /(습니다|니다|했다|한다|됐다|함)\.?\s*$/.test(line)) {
      add(n, "warn", "ending", "불릿은 명사형으로 끝냅니다");
    }
  });

  for (const { use, avoid } of terms) {
    const preferred = termPattern(use).test(text);
    lines.forEach((raw, i) => {
      for (const word of avoid) {
        if (termPattern(word).test(maskCode(raw))) {
          const why = preferred ? `'${use}' 표기와 섞여 있습니다` : `'${use}' 표기로 통일하세요`;
          add(i + 1, "warn", "term", `${word}: ${why}`);
        }
      }
    });
  }

  return findings.sort((a, b) => a.line - b.line);
}

function main(argv) {
  const files = [];
  let terms = DEFAULT_TERMS;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--terms") terms = JSON.parse(readFileSync(argv[++i], "utf8"));
    else files.push(argv[i]);
  }
  if (files.length === 0) {
    console.error("사용: node scripts/check-copy.mjs [--terms terms.json] <파일...>");
    return 2;
  }
  let errors = 0;
  for (const file of files) {
    for (const f of check(readFileSync(file, "utf8"), { terms })) {
      if (f.level === "error") errors++;
      console.log(`${file}:${f.line} ${f.level} [${f.rule}] ${f.message}`);
    }
  }
  return errors > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
