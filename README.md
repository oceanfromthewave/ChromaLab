# Chroma Lab

디자이너와 개발자를 위한 팔레트 스튜디오. 이미지 한 장을 드래그하거나, 기준 색을 골라 색이론
규칙을 적용하면 — Chroma Lab이 시각적으로 균일한 팔레트를 만들고, 각 색을 11스탑 OKLCH 톤
스케일로 확장한 뒤, Tailwind 설정 / CSS 변수 / JSON / SCSS 맵으로 바로 내보내줍니다.

```
        ▌▌  ▌    ▌      ▌
   ▌  ▌ ▌▌  ▌  ▌ ▌▌▌▌  ▌▌▌
   ▌  ▌ ▌▌  ▌  ▌ ▌▌▌▌  ▌▌▌
        ▌▌  ▌    ▌      ▌
   chroma   ·   lab
```

## 무엇을 하는가

- **이미지 색 추출** — 툴바에 이미지를 끌어다 놓으면 OKLAB 공간에서 k-means++ 클러스터링으로
  시각적으로 구별되는 6개의 대표 색을 추출합니다.
- **색이론** — 단색, 유사색, 보색, 분할보색, 삼원색, 사각색, 복합 — 7가지 하모니 규칙. 모든
  연산이 OKLCH 위에서 이뤄지므로 색상이 흔들리지 않습니다.
- **OKLCH 톤 스케일** — 각 기준색이 Tailwind 스타일의 `50–950` 11스탑 램프로 확장됩니다.
  명도는 고정된 지각 사다리, 채도는 중간 명도에서 피크치는 envelope 함수로 보정됩니다.
- **WCAG 대비 검사기** — 팔레트 내 모든 색 쌍의 명도비를 매트릭스로 보여주고, AA / AAA
  뱃지와 대형 텍스트 기준을 함께 표시합니다.
- **라이브 UI 미리보기** — 팔레트가 실제 히어로 / 대시보드 카드 / 기능 행 / 태그 칩에
  적용된 모습을 그대로 보여줍니다.
- **원클릭 익스포트** — Tailwind 설정, CSS 변수, SCSS 맵, JSON, SVG 카드. 복사 또는 다운로드.
- **로컬 우선** — 저장한 팔레트는 브라우저에 보관됩니다. 계정 없음, 서버 없음. 공유 URL의
  해시에 팔레트가 담기므로 누구도 데이터를 만지지 않습니다.

## 실행

```bash
npm install
npm run dev      # → http://localhost:5173
```

프로덕션 빌드:

```bash
npm run build
npm run preview
```

## 키보드 단축키

| 키          | 동작                                |
| ----------- | ----------------------------------- |
| `Space`     | 팔레트 섞기 (잠금된 색은 유지)       |
| `L`         | 선택한 스왓치 잠금 / 해제           |
| `T`         | 다크 / 라이트 테마 전환             |
| `I`         | 대비 검사기 열기                    |
| `C`         | 공유 가능한 URL 복사                |
| `⌘/Ctrl+S`  | 팔레트 저장                         |
| `?`         | 단축키 도움말                       |

## 폴더 구조

```
src/
  App.tsx                       # 최상위 레이아웃
  store.ts                      # Zustand 스토어 + localStorage 영속화
  lib/
    color.ts                    # OKLCH 기본 연산, 색이론, 톤 스케일, WCAG
    extract.ts                  # k-means++ 이미지 색 추출
    export.ts                   # Tailwind / CSS / SCSS / JSON / SVG 생성기
    name.ts                     # 한국어 색 이름 자동 생성
  components/
    Header.tsx                  # 로고, 팔레트 이름, 저장 / 공유 / 내보내기 / 테마
    Toolbar.tsx                 # 색이론 픽커, 기준색, 이미지 드롭존
    PaletteStrip.tsx            # 풀폭 스왓치 행
    Swatch.tsx                  # 개별 스왓치 (잠금, 편집, 복사, 삭제)
    ColorEditor.tsx             # L / C / H 슬라이더 + HEX 입력
    PreviewTabs.tsx             # 탭 스위처
    UIPreview.tsx               # 팔레트로 렌더되는 실제 UI 목업
    ToneScalePanel.tsx          # 기준색별 11스탑 스케일
    ContrastInspector.tsx       # NxN WCAG 매트릭스
    SavedPalettes.tsx           # 로컬 저장 팔레트 갤러리
    ExportDialog.tsx            # 다포맷 익스포트 모달
    ShortcutsHelp.tsx           # 키보드 단축키 오버레이
    Toast.tsx                   # 일시 알림
  hooks/
    useShortcuts.ts             # 글로벌 키보드 핸들러
    useToast.ts                 # 토스트 큐
```

## 기술 스택

- Vite + React 19 + TypeScript
- Tailwind CSS v3 (CSS 변수 기반 디자인 토큰)
- Framer Motion — 전환, 슬라이딩 핀 인디케이터, 모달 애니메이션
- Zustand + persist 미들웨어 — 글로벌 상태
- culori — OKLCH / OKLAB 변환과 WCAG 명도비

## 로드맵

- 스왓치 드래그 재정렬
- 대비 미달 색 쌍을 OKLCH 명도만 자동 조정해 통과시키는 "Suggest fix"
- Figma 변수 JSON, Adobe `.ase`, Sketch 팔레트 출력
- PWA 매니페스트 + 오프라인 캐시
- OKLCH 친화 디자인을 시드한 갤러리
