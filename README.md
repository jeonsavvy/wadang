# WADANG · 와당

**Dojang 검증을 참여와 접근 자격으로 연결하는 온체인 마당** — GASOK Track 03 MVP.

Dojang은 지갑의 검증 정보를 제공하고 WADANG은 이를 기간·정원·중복 규칙과 참여 이력으로 연결합니다. 운영자는 첫 사용 사례인 캠페인을 만들고, Playground 테스트 인증 지갑은 한 번 참여합니다. 다른 앱은 `isEligible`로 참여 이력과 조회 시점의 인증을 함께 확인해 접근 조건이나 후속 혜택 기준으로 사용할 수 있습니다.

MVP는 하나의 TESTNET FAUCET attester와 캠페인 흐름만 구현합니다. 여러 Dojang 인증을 조합하는 자격 정책, SDK·위젯, Wallet 안의 발견과 실제 멤버십 발급은 선발 후 검증할 확장 범위이며 현재 기능으로 주장하지 않습니다.

## Release state

`NEXT_PUBLIC_WADANG_CONTRACT_ADDRESS`는 검증된 GIWA Sepolia 배포 후 설정합니다. 주소가 없으면 쓰기 기능을 비활성화하고, 테스트넷 주소나 트랜잭션을 임의 값으로 대체하지 않습니다.

## Stack and boundary

- Next.js 16, React 19, TypeScript, wagmi, viem
- Cloudflare Workers via OpenNext; one Worker serves the app, docs, and public PDF copies
- Hardhat 3 with encrypted keystore configuration
- GIWA Sepolia as the sole product-state network
- No D1, KV, R2, Durable Objects, Queues, API routes, or deploy token in CI

## Routes

- `/` — 제품 설명과 운영자·참여자 흐름
- `/open` — organizer creates a madang and receives the event-derived share ID
- `/madang/[id]` — participant verification, entry, receipt, and organizer close flow
- `/manage` — chain-only organizer view
- `/docs` — architecture, ABI, invariants, tests, security boundary, mainnet plan
- `/deck` — printable nine-slide GASOK pitch deck
- `/team` — approved one-page factual profile
- `/gasok` — public submission links for the profile, deck, docs, source, and verified contract

## Local setup

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Missing deployment configuration keeps every write button disabled and visible as such.

## Verification

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm build
pnpm build:cloudflare
pnpm test:e2e
```

Local Cloudflare runtime smoke test:

```powershell
pnpm preview:cloudflare
```

OpenNext 1.20.1 warns that native Windows is not fully supported and can fail while recreating pnpm symlinks with `EPERM`. Run the Cloudflare bundle/preview gate in Linux or WSL; the repository CI uses Ubuntu and treats that result as authoritative. Do not weaken the gate or patch installed dependencies in a release build.

## Contract invariants

`WadangCampaigns` enforces:

- current verification through one immutable `verifier` and `attesterId` pair;
- one entry per campaign and wallet;
- inclusive start, exclusive end, bounded capacity, and cancellation;
- organizer-only cancellation;
- historical entry retention while `isEligible` follows current verification and cancellation.
- a test-only consumer contract that reuses `isEligible` as an access condition.

It cannot receive or transfer value and has no admin, upgrade, pause, delegatecall, or arbitrary-call path. `contracts/test/MockDojangVerifier.sol` is local-test-only and must never be used for public evidence.

## Read-only attester gate

Use a dedicated wallet issued through GIWA Playground:

```powershell
pnpm check:attesters 0xPLAYGROUND_WALLET
```

The script reads both documented candidates from the official verifier. Exactly one must return `true`; zero or two matches stop with exit code 2. The release wallet resolves only the TESTNET FAUCET candidate. This is Playground test evidence, not a claim that UPBIT KOREA KYC is active. Never substitute the mock.

## Deployment secret

The repository has no `PRIVATE_KEY` environment-variable path. Store only a dedicated testnet key in Hardhat's encrypted keystore:

```powershell
pnpm exec hardhat keystore set GIWA_SEPOLIA_PRIVATE_KEY
```

Deployment, source verification, public GitHub push, Worker deployment, profile publication, and form submission remain separate external-write gates. See [`docs/specs/wadang-mvp.md`](docs/specs/wadang-mvp.md). The private application pack is kept outside the repository.

## Personal data

`/team`의 사진·경력 공개 범위는 2026-07-15 사용자 승인을 받았습니다. 사진 원본, 지원 답변, 제출용 PDF 정본, 이메일과 개인키는 저장소에 넣지 않습니다. Worker에 포함되는 사진·PDF는 공개 배포 직전에 ignored staging asset으로 복사합니다.
