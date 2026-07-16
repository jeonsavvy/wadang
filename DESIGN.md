# WADANG design direction

## Product character

WADANG is a contemporary Korean product surface, not a folk-theme decoration. The name connects GIWA's roof-tile philosophy, Dojang's verification seal, and the visible end tile at the eaves. The visual system translates overlap, curve, paper, porcelain, celadon, mugwort, and seokganju into structure and interaction.

## Visual contract

- Korean-first copy with compact English technical labels.
- Hanji/porcelain paper, ink black, seokganju red, celadon/mugwort green, restrained brass.
- Original circular WADANG rosette; never copy GIWA logos or heritage-object patterns.
- No flag, taegeuk, hanbok, brush-lettering, palace-photo, or ornamental overload.
- Serif Korean display type for hierarchy; plain sans-serif for product actions and data.
- Verification success stamps the WADANG seal once; `prefers-reduced-motion` disables the motion.

## Interaction contract

- Product terms: `마당 열기`, `도장 확인`, `입장하기`, `입장 기록`, `열린 마당`, `마당 닫기`.
- Every wallet action exposes prerequisite, request, pending, receipt, and recovery.
- Chain, contract, verifier source, and Explorer destination stay visible.
- Status is expressed with text and icons, not color alone.
- Minimum touch target 44px and visible keyboard focus.
- Production never displays local sample metrics.

## Copy contract

- 첫 화면에서 `누가`, `무엇을`, `어떻게`, `어떤 결과를 얻는지`를 평문으로 설명한다.
- `마당 열기`, `입장하기`는 브랜드화된 동작명으로만 사용하고, 본문에서는 `캠페인 생성`, `참여`, `참여 기록`으로 뜻을 풀어 쓴다.
- 와당·기와·도장 비유는 이름과 시각 요소에만 제한한다. 기능 설명을 비유로 대신하지 않는다.
- `primitive`, `surface`, `gate`, `release evidence` 같은 내부·업계 표현은 공개 카피에서 피하거나 바로 한국어로 설명한다.
- 증거가 없다는 방어적 문구보다 현재 상태와 다음 확인 항목을 구체적으로 쓴다.

## Responsive and print targets

- Desktop web: 1440 × 1000.
- Mobile web: 390 × 844.
- Pitch: 13.333 × 7.5 inch, nine pages.
- Profile: A4, one page, original portrait proportions with CSS crop only.
- Technical PDF: A4 multi-page.

Inspect rendered pixels for overlap, clipping, overflow, font fallback, contrast, unsafe margins, and unintended photo crop before publication.
