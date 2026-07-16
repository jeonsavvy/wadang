# WADANG · 와당

**Dojang 검증을 참여와 접근 자격으로 연결하는 온체인 마당**  
GASOK Track 03 · GIWA-NATIVE IDEAS 출품작

WADANG은 Dojang의 지갑 검증 결과에 기간, 정원, 지갑당 한 번의 참여 규칙을 더합니다. 참여 결과는 GIWA에 기록되며, 다른 앱은 `isEligible`을 호출해 해당 지갑의 현재 접근 자격을 확인할 수 있습니다.

캠페인은 이 구조를 보여주는 첫 사용 사례입니다. 운영자는 마당을 열고 공유 링크를 만들며, 참여자는 Playground 테스트 인증을 확인받은 뒤 입장합니다.

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

## 로컬 실행

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

검증된 배포 주소가 없으면 온체인 쓰기 버튼은 비활성화됩니다.

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
