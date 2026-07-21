# WADANG · 와당

**Dojang 검증을 참여와 접근 자격으로 연결하는 온체인 마당**
GASOK Track 03 · GIWA-NATIVE IDEAS 출품작

WADANG은 Dojang의 지갑 검증 결과에 기간, 정원, 지갑당 한 번의 참여 규칙을 더합니다. 참여 결과는 GIWA에 기록되며, 다른 앱은 `isEligible`을 호출해 해당 지갑의 현재 접근 자격을 확인할 수 있습니다.

캠페인은 이 구조를 보여주는 첫 사용 사례입니다. 운영자는 마당을 열고 공유 링크를 만들며, 참여자는 Playground 테스트 인증을 확인받은 뒤 입장합니다. [배포된 앱에서 전체 흐름을 직접 확인할 수 있습니다.](https://wadang.jeonsavvy.workers.dev)

## 역할

- **Dojang:** 지갑의 검증 정보를 제공합니다.
- **WADANG:** 검증 정보에 참여 규칙과 이력을 연결합니다.
- **연동 앱:** WADANG의 참여 결과를 접근이나 후속 혜택의 조건으로 사용합니다.

## 주요 기능

- 지갑 연결과 GIWA Sepolia 네트워크 전환
- 캠페인 이름, 안내문, 기간과 정원 설정
- `CampaignCreated` 이벤트에서 생성 ID를 읽어 공유 링크 제공
- 참여 시 Dojang 검증, 기간, 정원과 중복 여부 확인
- 캠페인별 참여 현황과 Explorer 영수증 조회
- 운영자 전용 캠페인 취소
- `isEligible`을 이용한 외부 컨트랙트 접근 제어

## 구성

- Next.js 16, React 19, TypeScript
- wagmi, viem
- Solidity 0.8.28, Hardhat 3, OpenZeppelin
- Cloudflare Workers, OpenNext
- GIWA Sepolia

브라우저가 지갑과 GIWA Sepolia RPC에 직접 연결합니다. Cloudflare Worker는 화면과 정적 문서를 제공하며 캠페인이나 참여 데이터를 별도로 저장하지 않습니다.

## 컨트랙트

`WadangCampaigns`는 다음 함수를 제공합니다.

```solidity
constructor(address verifier, bytes32 attesterId)
createCampaign(string title, string details, uint64 startsAt, uint64 endsAt, uint32 capacity)
claim(uint256 campaignId)
cancelCampaign(uint256 campaignId)
getCampaign(uint256 campaignId)
hasClaimed(uint256 campaignId, address account)
isEligible(uint256 campaignId, address account)
```

컨트랙트는 현재 Dojang 검증, 지갑당 한 번의 참여, 기간, 정원, 취소 상태와 운영자 권한을 강제합니다. 자금이나 토큰을 보관하지 않으며 관리자, 업그레이드, 임의 호출 기능이 없습니다.

### GIWA Sepolia 배포

- Contract: [`0x4a787Aa8BD73bBA2F8a19a36672A808DAE8D5050`](https://sepolia-explorer.giwa.io/address/0x4a787Aa8BD73bBA2F8a19a36672A808DAE8D5050#code)
- Campaign 1 생성: [`0x185fffa6...db699d1`](https://sepolia-explorer.giwa.io/tx/0x185fffa6e324e1d1c06beb7bb1bf69fdf5e31da98eb2f01fceb5b5f69db699d1)
- Campaign 1 참여: [`0x9d3df05a...f038399`](https://sepolia-explorer.giwa.io/tx/0x9d3df05a011fd01c4c02859e6961e0e082392443d58daaf8f321ea337f038399)
- Campaign 2 취소: [`0x49851234...8e0885`](https://sepolia-explorer.giwa.io/tx/0x49851234ce172f014c2a11feb75cfca370cfa8824a800c0ec6ee94b6bd8e0885)
- 배포 소스 커밋: [`27b70b52`](https://github.com/jeonsavvy/wadang/commit/27b70b520654110d216a5c9db8083043e4251d7e)
- `contracts/WadangCampaigns.sol` SHA-256: `86a60fe99f44b2890d8da5c36a36faa08a57dcc5f9c920b180b7838187b5a86b`

캠페인 1 참여 후 `isEligible(1, participant) == true`를 확인했습니다. 미인증 참여, 중복 참여와 비운영자 취소는 RPC simulation에서 각각 `NotVerified`, `AlreadyClaimed`, `NotOrganizer`로 거절됐습니다.

## 로컬 실행

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

기본 설정은 위 GIWA Sepolia 배포 주소를 사용합니다. 다른 배포를 연결할 때만 `NEXT_PUBLIC_WADANG_CONTRACT_ADDRESS`를 지정합니다.

## 검증

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm build
pnpm build:cloudflare
pnpm test:e2e
```

컨트랙트 테스트는 입력 경계, 인증·미인증·중복, 시작·종료 시각, 정원, 취소 권한, 인증 변경, verifier 오류와 외부 접근 연동을 확인합니다.

## Worker 릴리스

PDF 3종과 팀 사진은 제출용 비버전 자산이므로 Git에 커밋하지 않습니다. 배포 전 아래 파일이 모두 있는지 확인합니다.

```powershell
Get-Item public/artifacts/wadang-pitch-deck.pdf
Get-Item public/artifacts/wadang-team-profile.pdf
Get-Item public/artifacts/wadang-technical-docs.pdf
Get-Item public/team/jeon-chan-hyuk.png
```

필수 자산 확인 → **Linux에서** `pnpm build:cloudflare` → `pnpm exec wrangler deploy --dry-run`과 로컬 preview → `pnpm exec wrangler deploy` → 아래 release smoke 순서로 진행합니다. Cloudflare Git Build의 production deploy command는 `npx wrangler versions upload`로 유지해 push가 활성 배포를 자동 교체하지 않게 합니다.

```powershell
$env:RELEASE_BASE_URL="https://wadang.jeonsavvy.workers.dev"
pnpm check:release
```

`check:release`는 앱 8개 경로와 PDF 3종·팀 사진의 HTTP 상태, 콘텐츠 타입, 최소 크기를 검사하고 비버전 자산의 배포본 SHA-256이 로컬 원본과 같은지 확인합니다.

## 테스트넷 설정

```powershell
pnpm check:attesters 0xPLAYGROUND_WALLET
```

GIWA OnchainVerifier의 두 테스트넷 후보를 조회하고 정확히 하나가 유효할 때 배포값으로 선택합니다. WADANG 테스트넷 배포에는 Playground에서 발급되는 `TESTNET FAUCET` attester를 사용합니다.

배포 키는 Hardhat keystore에 저장합니다.

```powershell
pnpm exec hardhat keystore set GIWA_SEPOLIA_PRIVATE_KEY
```

상세 구조와 컨트랙트 동작은 [`docs/specs/wadang-mvp.md`](docs/specs/wadang-mvp.md)에서 확인할 수 있습니다.
