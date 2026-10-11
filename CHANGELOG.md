# Changelog

이 skill의 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다. 1.0.0 전까지는 minor 버전에서도 동작이 바뀔 수 있습니다.

- **major**: 사용자 자료의 형식이 바뀌어 옮기기가 필요하거나, 모드가 없어지는 변경
- **minor**: 새 모드, 새 adapter, 새 규칙, 새 리뷰어
- **patch**: 문구 정리, 예시 수정, 버그 수정

템플릿의 절 구성이 바뀌면 템플릿 맨 위의 형식 표시(`<!-- dev-resume facts v1 -->`)를 올리고, 여기에 적습니다.

## 0.1.0

처음 공개합니다.

- 모드: `intake`, `write`, `review`, `tailor`, `layout`
- adapter: markdown, pdf, notion(실사용 검증 전), rxresume
- 템플릿 형식: workspace v1, facts v1
- 교열 검사: `scripts/check-copy.mjs`
