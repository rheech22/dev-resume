import { test } from "node:test";
import assert from "node:assert/strict";
import { check, toLines } from "./check-copy.mjs";

const rules = (text, opts) => check(text, opts).map((f) => f.rule);

test("공백 두 칸을 찾고 들여쓰기는 넘어갑니다", () => {
  assert.deepEqual(rules("운영.  2026년 출시"), ["double-space"]);
  assert.deepEqual(rules("  - 들여쓴 불릿 구축"), []);
});

test("굵은 글씨 안의 콜론을 찾습니다", () => {
  assert.ok(rules("- **배포 알림 자동화:** 메신저 연동").includes("colon-in-bold"));
  assert.ok(!rules("- **배포 알림 자동화**: 메신저 연동").includes("colon-in-bold"));
});

test("괄호 짝이 맞지 않으면 오류입니다", () => {
  assert.ok(rules("- 푸시 채널 분리(iOS, Android 구축").includes("unbalanced-bracket"));
  assert.ok(!rules("- 푸시 채널 분리(iOS, Android) 구축").includes("unbalanced-bracket"));
});

test("가운뎃점을 쓰는 문서에서 '및'을 찾습니다", () => {
  assert.ok(rules("- 설계·구현\n- 설계 및 구현").includes("and-mix"));
  assert.ok(!rules("- 설계 및 구현").includes("and-mix"));
});

test("기간의 물결표를 찾습니다", () => {
  assert.ok(rules("- 2세대(2025~): 재구축").includes("range-tilde"));
  assert.ok(!rules("- 야간(22~06시) 실행").includes("range-tilde"));
});

test("표기 혼용을 찾고 다른 단어의 일부는 잡지 않습니다", () => {
  assert.ok(rules("- 관련 스킬 공유\n- skill 생성").includes("term"));
  assert.ok(!rules("- soft skills 강조").includes("term"));
});

test("코드 표기 안은 검사하지 않습니다", () => {
  assert.deepEqual(rules("- `fallback  value` 설정 구축"), []);
});

test("서술형으로 끝나는 불릿을 찾습니다", () => {
  assert.ok(rules("- 배포를 자동화했습니다.").includes("ending"));
  assert.ok(!rules("- 배포 자동화").includes("ending"));
});

test("HTML 원고는 블록을 줄로 나누고 굵은 글씨를 보존합니다", () => {
  const lines = toLines("<ul><li><p><strong>리드:</strong> 본문</p></li></ul>");
  assert.ok(lines.includes("- **리드:** 본문"));
  assert.ok(rules("<ul><li><p><strong>리드:</strong> 본문</p></li></ul>").includes("colon-in-bold"));
});

test("사용자 표기 사전으로 기본값을 바꿉니다", () => {
  const terms = [{ use: "fallback", avoid: ["폴백"] }];
  assert.ok(rules("- 폴백 정책", { terms }).includes("term"));
  assert.ok(!rules("- fallback 정책", { terms }).includes("term"));
});
