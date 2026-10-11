# rxresume

이력서를 [Reactive Resume](https://rxresu.me)에서 관리하고, agent가 Reactive Resume MCP 서버로 접근하는 경우입니다.

## 편집

- 문서는 JSON이며 JSON Patch로 고칩니다. 패치에는 마지막으로 읽은 `updatedAt`을 함께 보냅니다.
- 사용자가 앱에서 고치면 `updatedAt`이 바뀌어 패치가 거부됩니다. 거부되면 다시 읽고, 사용자가 바꾼 내용을 살린 채 패치를 다시 만듭니다. 이전 패치를 그대로 다시 보내지 않습니다.
- 항목 설명은 HTML 문자열 전체를 바꾸는 방식이라, 한 문장을 고쳐도 설명 전체를 보냅니다. 방금 읽은 설명에서 바꿀 문장만 바꿔 보냅니다.
- 배열 인덱스로 경로를 잡을 때는 `test` 연산으로 항목 `id`를 먼저 확인합니다. 순서가 바뀌었으면 패치 전체가 실패해 엉뚱한 항목을 고치지 않습니다.
- 큰 변경 전에는 이름 붙은 버전을 만듭니다.
- 공고 맞춤본은 문서를 복제해서 만듭니다.

## 데이터 모델에서 주의할 점

- 기간은 `dates.start`, `dates.end`, `dates.present`(YYYY-MM)로 넣어야 검사를 통과합니다. 문자열 기간만 있으면 형식 오류로 잡힙니다.
- 커스텀 섹션 항목에 회사명이 비어 있으면 항목이 렌더되지 않습니다. 요약 문단은 summary 섹션을 씁니다.
- 항목의 website 필드와 설명 안의 링크를 둘 다 넣으면 URL이 두 번 찍힙니다. 한 곳만 씁니다.
- 인쇄되지 않는 메모 칸(`metadata.notes`)에 면접 메모를 둘 수 있습니다.

## 스타일

- PDF 엔진은 legacy CSS를 무시합니다. `metadata.stylesheet`의 semantic stylesheet(`mode: "semantic"`)를 씁니다.
- 대상 요소: `section[id=…]`, `section-heading`, `item[id=…]`, `field[name=period|location|company|name|school|degree|area]`, `rich-text > paragraph`, `list-item`, `list-marker`, `strong`, `contact-list`.
- 속성: margin, padding, border, color, font-size, `break-before`, `break-inside`. 필드에 `display: none`은 동작하지 않습니다.
- 폰트는 Google 폰트만 씁니다. 지원하지 않는 이름은 오류 없이 serif로 바뀝니다. 한국어는 Noto Sans KR이 안정적입니다.
- 템플릿마다 페이지 넘김 버그가 다릅니다. 섹션이 페이지를 넘을 때 겹쳐 그려지면 다른 템플릿으로 확인합니다.
- `list-item { break-inside: avoid; }`로 불릿이 페이지 사이에서 잘리지 않게 합니다.

## 렌더

- MCP의 PDF 다운로드 도구가 짧게 유효한 URL을 줍니다. 받아서 페이지 이미지로 바꿔 확인합니다.
- 이미지 변환은 플랫폼에 따라 고릅니다. 예: `pdftoppm -png`, macOS의 PDFKit, agent의 PDF 읽기 기능.
- 패치 직후의 렌더가 이전 상태를 보이면 다시 내려받습니다.
