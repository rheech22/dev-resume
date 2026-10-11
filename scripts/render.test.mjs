import { test } from "node:test";
import assert from "node:assert/strict";
import { toHtml, inline } from "./render.mjs";

test("이름 다음 단락은 연락처로 봅니다", () => {
  const html = toHtml("# 홍길동\n프론트엔드 개발자 · hong@example.com\n\n소개 문단");
  assert.match(html, /<h1>홍길동<\/h1>/);
  assert.match(html, /<p class="contact">프론트엔드 개발자 · <a href="mailto:hong@example.com">hong@example.com<\/a><\/p>/);
  assert.match(html, /<p>소개 문단<\/p>/);
});

test("소제목 끝의 괄호는 기간으로 나눕니다", () => {
  const html = toHtml("### 결제 서비스 (2024.03 – 현재)");
  assert.match(html, /<span>결제 서비스<\/span><span class="period">2024.03 – 현재<\/span>/);
});

test("굵은 글씨만 있는 줄은 소제목입니다", () => {
  assert.match(toHtml("**성능 개선**"), /<h4>성능 개선<\/h4>/);
});

test("중첩 목록을 닫습니다", () => {
  const html = toHtml("- 하나\n  - 둘\n- 셋");
  assert.equal(html, "<ul><li>하나<ul><li>둘</li></ul></li><li>셋</li></ul>");
});

test("링크, 굵게, 코드를 바꾸고 HTML을 막습니다", () => {
  assert.equal(
    inline("**결과**: [저장소](https://example.com) `a<b>` <script>"),
    '<strong>결과</strong>: <a href="https://example.com">저장소</a> <code>a&lt;b&gt;</code> &lt;script&gt;',
  );
});

test("꺾쇠 URL과 맨 URL, 이메일은 쓴 그대로 링크가 됩니다", () => {
  assert.equal(inline("<https://example.com/a>"), '<a href="https://example.com/a">https://example.com/a</a>');
  assert.equal(inline("주소 https://example.com/a."), '주소 <a href="https://example.com/a">https://example.com/a</a>.');
  assert.equal(inline("hong@example.com"), '<a href="mailto:hong@example.com">hong@example.com</a>');
});

test("괄호가 든 URL을 자르지 않습니다", () => {
  assert.equal(inline("[위키](https://x.org/Foo_(bar))"), '<a href="https://x.org/Foo_(bar)">위키</a>');
});

test("역슬래시 이스케이프는 기호 그대로 둡니다", () => {
  assert.equal(inline("\\*별표\\*"), "*별표*");
});

test("날짜 모양이 아닌 괄호는 기간으로 보지 않습니다", () => {
  assert.doesNotMatch(toHtml("### 앱 (iOS 17 대응)"), /period/);
  assert.doesNotMatch(toHtml("### 행사 (14)"), /period/);
  assert.match(toHtml("### 회사 (05/2025 – Present)"), /class="period">05\/2025 – Present</);
});

test("4칸 들여쓰기도 한 단계 중첩입니다", () => {
  assert.equal(toHtml("- a\n    - b\n- c"), "<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>");
});

test("번호 목록을 만듭니다", () => {
  assert.equal(toHtml("1. 하나\n2. 둘"), "<ol><li>하나</li><li>둘</li></ol>");
});

test("이름 바로 아래 여러 줄은 모두 연락처입니다", () => {
  assert.match(toHtml("# 홍길동\n프론트엔드 개발자\nhong@example.com"), /<p class="contact">프론트엔드 개발자<br>/);
});
