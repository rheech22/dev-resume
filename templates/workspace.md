<!-- dev-resume workspace v1 -->
# workspace

이 workflow가 사용자마다 다르게 읽는 값입니다. agent가 처음 실행할 때 이 템플릿을 `<home>/workspace.md`로 복사하고,
대화로 확인한 값을 그 사본에 적습니다. 사용자가 직접 고치지 않아도 됩니다.
skill 폴더 안의 이 템플릿은 고치지 않습니다. 그래야 skill을 업데이트할 때 사용자 설정과 충돌하지 않습니다.

| Slot | 값 |
| --- | --- |
| `home` | `~/resume/` |
| `facts` | `<home>/facts.md` |
| `source` | `<home>/resume.md` |
| `format` | `markdown` |
| `edit` | 원본을 직접 고칩니다 |
| `render` | 렌더 확인을 하지 않습니다 |
| `sources` | 정하지 않음 |

## home

기본값: `~/resume/`

경력 사실, 이력서 원본, 공고, 리뷰 기록, 그리고 이 파일을 두는 디렉터리입니다. 개인 정보가 들어가므로 공개 저장소 안에 두지 않습니다.
기본값이 아닌 경로를 쓰면 skill 폴더의 `local.md`에 경로 한 줄을 적습니다. `local.md`는 git이 추적하지 않습니다.

## facts

기본값: `<home>/facts.md`

경력 사실 파일입니다. 처음 실행(`rules/intake.md`)에서 agent가 `templates/facts.md`를 복사해 만들고 기존 이력서로 채웁니다. 이력서 문장은 이 파일의 사실에서만 나옵니다.

## source

기본값: `<home>/resume.md`

이력서 원본의 위치입니다. 파일 경로, 문서 URL, 이력서 서비스의 문서 ID 중 하나를 적습니다.

## format

기본값: `markdown`

지원하는 값: `markdown`, `pdf`, `notion`, `rxresume`.

이력서 원본의 형식입니다. `adapters/`에 같은 이름의 문서가 있으면 편집과 렌더에 그 문서를 따릅니다.
맞는 adapter가 없으면 사용자에게 편집 방법을 묻고, agent가 그 답을 이 slot 아래에 적습니다.

## edit

기본값: 원본을 직접 고칩니다

편집 방식입니다. `format`이 원본을 만든 도구를 가리킨다면, `edit`은 agent가 어떻게 고치는지를 정합니다.

| 값 | 뜻 |
| --- | --- |
| 원본을 직접 고칩니다 | `format`에 맞는 adapter로 원본을 고칩니다 |
| 변경 목록만 줍니다 | 원본은 사용자가 고치고, agent는 `원문 → 수정안` 목록만 줍니다. 원본을 만든 도구에 agent가 접근할 수 없거나 사용자가 직접 고치길 원할 때 씁니다 |
| 마크다운으로 옮겼습니다 | 원본을 마크다운으로 옮겨 관리합니다. `format`을 `markdown`으로 바꾸고 원래 도구는 괄호로 남깁니다 |

예를 들어 Reactive Resume로 만든 이력서를 PDF로 받았고 사용자가 직접 옮기길 원하면 `format: rxresume`, `edit: 변경 목록만 줍니다`입니다. 아직 정하지 않았으면 `edit`에 `미정`이라고 적고 다음 편집 전에 묻습니다.

## render

기본값: 렌더 확인을 하지 않습니다

최종 모양을 확인하는 방법입니다. PDF 내보내기 명령, 이미지 변환 도구, agent가 PDF를 직접 읽는 방법 중 쓸 수 있는 것을 적습니다.
기본값이면 `layout` 모드는 사용자가 건넨 PDF나 이미지로만 진행합니다.

## sources

기본값: 정하지 않음

근거를 찾을 자료와 읽는 방법을 적습니다. 저장소는 경로와 본인의 git author 이름을 함께 적습니다. 이름이 여러 개면 모두 적습니다.
저장소 외의 자료는 종류와 읽는 방법을 적습니다. 자료를 받는 절차는 `rules/evidence.md`의 "자료 받기"가 정합니다.

```text
- 저장소 ~/work/product-web  (author: hong, 홍길동)
- 저장소 ~/work/product-app  (author: hong)
- 개인 Notion의 회고 페이지  (Notion MCP, 개인 워크스페이스 확인함)
- 성과 평가 PDF  (사용자가 첨부)
```
