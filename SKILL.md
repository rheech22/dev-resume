---
name: dev-resume
description: "Use when the user shares an existing resume to start from, or asks to write, revise, review, or tailor a Korean resume or 경력기술서 for a software engineering role (frontend, backend, full-stack, product engineer, FDE, ML, DevOps). Turns the existing resume into a fact file with verification status, confirms the career direction, grounds every claim in repositories, documents, and any material the user provides (messages, notes, files, email); runs independent reviewer personas; tailors a copy to a job posting; checks the rendered layout. Do not use for non-engineering resumes, cover letters alone, or interview coaching alone."
---

# dev-resume

개발자 이력서를 근거에 기반해 쓰고, 여러 면접관 관점으로 검증하는 workflow입니다.
절차 순서대로 필요한 파일만 읽습니다. 시작 전에 모든 파일을 읽지 않습니다.

이 skill의 버전은 **0.3.0**입니다. 리뷰 기록과 작업 보고에 버전을 남깁니다.

## 사용자 자료의 위치

사용자 자료는 skill 폴더 밖의 `home`에 둡니다. `home`은 skill 폴더의 `local.md`에 적힌 경로이고, 그 파일이 없으면 `~/resume/`입니다.

먼저 `<home>/workspace.md`(이하 workspace)를 읽습니다. 이력서 원본의 위치와 형식, 편집 방법, 렌더 확인 방법,
경력 사실 파일의 위치를 그 파일이 정합니다. 없으면 `templates/workspace.md`를 복사해 만듭니다.

사용자는 파일을 직접 열어 고치지 않습니다. 설정, 경력 사실, 커리어 방향, 공고는 모두 대화로 받고
agent가 workspace와 `facts` 파일에 기록합니다. 사용자가 대화로 바꾸라고 하면 agent가 고칩니다.
skill 폴더 안의 파일에는 사용자 자료를 쓰지 않습니다.

`facts` 파일이 없거나 비어 있으면 `rules/intake.md`의 처음 실행 절차부터 진행합니다.
workspace나 `facts` 맨 위의 형식 표시(`<!-- dev-resume facts v1 -->`)가 템플릿보다 낮거나 없으면 `rules/intake.md`의 "형식 옮기기"를 제안합니다. 지금 요청이 옛 형식으로도 할 수 있는 일이면 요청을 먼저 마치고 끝에 제안합니다.

## 모드

요청을 읽고 아래 모드 중 하나를 고릅니다. 판정 기준은 `rules/scope.md`가 소유합니다.

| 모드 | 하는 일 | 읽을 파일 |
| --- | --- | --- |
| `intake` | 기존 이력서를 사실로 쪼개고, 커리어 방향과 공고를 받아 기록합니다 | `rules/intake.md`, `rules/evidence.md` |
| `write` | 경력 사실을 모아 초안을 쓰거나 기존 문장을 고칩니다 | `rules/evidence.md`, `rules/writing.md`, `rules/prose.md` |
| `review` | 독립 리뷰어(기본 3명, 사용자가 바꿀 수 있음)가 읽고, 결과를 종합해 보고합니다. 고치지 않습니다 | `rules/review.md` |
| `tailor` | 채용 공고에 맞춘 사본을 만듭니다 | `rules/tailoring.md`, `rules/writing.md` |
| `layout` | 사용자가 고른 디자인을 기록하고, 렌더 결과를 그 기록과 공통 점검으로 확인합니다 | `rules/layout.md` |

이력서를 읽거나, 고치거나, 렌더할 때는 workspace의 `format`에 맞는 `adapters/` 문서를 함께 읽습니다.

## 꼭 지킬 규칙

이 규칙은 모든 모드에 적용되며 다른 문서가 덮어쓰지 않습니다.

1. **사실을 만들지 않습니다.** 숫자, 원인, 결과, 본인 몫은 근거를 확인한 것만 씁니다. 근거가 없으면 사용자에게 묻고, 답을 받기 전에는 쓰지 않습니다. 기존 이력서에 있던 문장은 확인 전까지 그대로 둘 수 있지만, 숫자를 바꾸거나 더 강하게 고쳐 쓰지 않습니다.
2. **원인과 결과는 사용자 확인을 받습니다.** 문서나 커밋에서 찾은 원인 설명이라도 그것이 근본 원인인지, 악화 요인인지는 사용자만 압니다. 원인 진술은 초안에 넣기 전에 확인합니다.
3. **사용자가 고친 내용을 덮어쓰지 않습니다.** 편집하기 직전에 원본의 최신 상태를 다시 읽고, 그 위에 바꿀 부분만 바꿉니다. 큰 변경 전에는 되돌릴 수 있는 사본이나 버전을 남깁니다.
4. **편집 권한은 요청마다 확인합니다.** 사용자가 "고치지 마"라고 했거나 검토만 요청했으면 제안만 합니다. 한 번 받은 승인을 다음 변경에 이어서 쓰지 않습니다.
5. **사용자 제약을 기억합니다.** 공개하지 않기로 한 지표, 하지 않은 일, 의도해서 쓰는 용어는 경력 사실 파일의 `제약` 절에 적고, 모든 제안과 리뷰 종합에서 지킵니다.

## 포함된 파일

- `templates/workspace.md`: 사용자별 설정 템플릿
- `rules/scope.md`: 모드 판정, 범위, 기준의 우선순위
- `rules/intake.md`: 처음 실행
- `rules/evidence.md`: 근거 수집과 사실 확인
- `rules/writing.md`: 이력서 문장과 구조
- `rules/prose.md`: 한국어 표기와 교열
- `rules/review.md`: 독립 리뷰와 종합
- `rules/tailoring.md`: 공고 맞춤본
- `rules/layout.md`: 렌더 점검
- `adapters/markdown.md`, `adapters/pdf.md`, `adapters/notion.md`, `adapters/rxresume.md`: 형식별 읽기·편집·렌더 요령
- `templates/facts.md`: 경력 사실 파일 양식
- `templates/review-report.md`: 리뷰 보고 양식
- `scripts/check-copy.mjs`: 기계적 교열 검사
- `scripts/render.mjs`, `templates/resume.css`: 마크다운 → PDF 기본 렌더러와 기본 모양
