# WADANG GASOK submission brief

## Outcome

Submit a public, testnet-only Track 03 MVP that connects a Dojang test attestation to participation rules and reusable access eligibility. An organizer opens a madang, a verified wallet enters once, and another app can read `isEligible`. The Worker app, verified contract source, docs, deck, profile, and form links must resolve to one release evidence package.

## Stakeholders

- **GASOK reviewers:** need a working, explainable participation primitive that uses Dojang directly and shows a credible path beyond one campaign UI.
- **Organizers:** need a low-friction verification gate without collecting identity data again.
- **Participants:** need clear verification, rule, transaction, receipt, and recovery states.
- **Maintainer:** needs a bounded frontend-and-contract system with explicit release checks.

## Acceptance criteria

1. `WadangCampaigns` enforces current Dojang verification, one entry per wallet, time, capacity, cancellation, and organizer ownership; a consumer test reuses `isEligible` as access control.
2. The app supports wallet connection, GIWA Sepolia switching, madang creation, event-derived share IDs, chain-only management, entry, close, receipts, and failure recovery.
3. Missing contract configuration, wallet rejection, verifier/RPC failures, and blocked entry states remain explicit and never pretend success.
4. Cloudflare OpenNext production build works without D1/KV/R2 or a backend.
5. The profile, nine-slide deck, technical docs, demo, application answers, and evidence are renderable from the same source.
6. `lint -> typecheck -> UI unit tests -> contract tests -> Next build -> OpenNext build -> local preview -> rendered QA` passes before public writes.

## Failure criteria

- Public mock verifier, fabricated users/metrics/transactions, or an unverified deployment claim.
- Private key or email in source, logs, screenshots, or artifacts.
- A UI success state that precedes the receipt or misreads `CampaignCreated`.
- Unapproved publication of the profile photo or biography.
- Public artifacts that point to different contract source or release commits.

## Release evidence

- Exact contract source SHA-256 and release commit.
- Verified GIWA Sepolia address and create/claim receipts.
- Cloudflare Worker and public GitHub URLs.
- Three rendered PDFs and an accessible Worker app backed by real testnet evidence and accurately labeled simulations.
- Desktop/mobile pixels and signed-out link audit.
