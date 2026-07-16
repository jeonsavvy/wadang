import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress, zeroHash } from "viem";

describe("WadangCampaigns", async function () {
  const { viem, networkHelpers } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [organizer, verifiedWallet, secondVerifiedWallet, unverifiedWallet] =
    await viem.getWalletClients();
  const attesterId = `0x${"11".repeat(32)}` as const;

  async function deployFixture() {
    const verifier = await viem.deployContract("MockDojangVerifier");
    const campaigns = await viem.deployContract("WadangCampaigns", [
      verifier.address,
      attesterId,
    ]);

    await verifier.write.setVerified([
      verifiedWallet.account.address,
      attesterId,
      true,
    ]);
    await verifier.write.setVerified([
      secondVerifiedWallet.account.address,
      attesterId,
      true,
    ]);

    const verifiedCampaigns = await viem.getContractAt(
      "WadangCampaigns",
      campaigns.address,
      { client: { public: publicClient, wallet: verifiedWallet } },
    );
    const secondVerifiedCampaigns = await viem.getContractAt(
      "WadangCampaigns",
      campaigns.address,
      { client: { public: publicClient, wallet: secondVerifiedWallet } },
    );
    const unverifiedCampaigns = await viem.getContractAt(
      "WadangCampaigns",
      campaigns.address,
      { client: { public: publicClient, wallet: unverifiedWallet } },
    );

    return {
      verifier,
      campaigns,
      verifiedCampaigns,
      secondVerifiedCampaigns,
      unverifiedCampaigns,
    };
  }

  async function activeWindow() {
    const now = (await publicClient.getBlock()).timestamp;
    return { startsAt: now, endsAt: now + 3_600n };
  }

  async function createActiveCampaign(
    campaigns: Awaited<ReturnType<typeof deployFixture>>["campaigns"],
    capacity = 10,
  ) {
    const { startsAt, endsAt } = await activeWindow();
    await campaigns.write.createCampaign([
      "Early access",
      "A verified-wallet campaign",
      startsAt,
      endsAt,
      capacity,
    ]);
    return { startsAt, endsAt };
  }

  it("stores a bounded campaign and emits its creation", async function () {
    const { campaigns } = await deployFixture();
    const { startsAt, endsAt } = await activeWindow();

    await viem.assertions.emitWithArgs(
      campaigns.write.createCampaign([
        "Launch circle",
        "First 100 verified members",
        startsAt,
        endsAt,
        100,
      ]),
      campaigns,
      "CampaignCreated",
      [1n, organizer.account.address, "Launch circle", startsAt, endsAt, 100],
    );

    const campaign = await campaigns.read.getCampaign([1n]);
    assert.equal(await campaigns.read.campaignCount(), 1n);
    assert.equal(getAddress(campaign.organizer), getAddress(organizer.account.address));
    assert.equal(campaign.title, "Launch circle");
    assert.equal(campaign.claimCount, 0);
    assert.equal(campaign.canceled, false);
  });

  it("rejects invalid campaign inputs", async function () {
    const { campaigns } = await deployFixture();
    const { startsAt, endsAt } = await activeWindow();

    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign(["", "Details", startsAt, endsAt, 1]),
      campaigns,
      "EmptyTitle",
    );
    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign([
        "x".repeat(81),
        "Details",
        startsAt,
        endsAt,
        1,
      ]),
      campaigns,
      "TitleTooLong",
    );
    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign([
        "Title",
        "x".repeat(281),
        startsAt,
        endsAt,
        1,
      ]),
      campaigns,
      "DetailsTooLong",
    );
    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign(["Title", "Details", startsAt, startsAt, 1]),
      campaigns,
      "InvalidWindow",
    );
    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign(["Title", "Details", startsAt, endsAt, 0]),
      campaigns,
      "InvalidCapacity",
    );
    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign(["Title", "Details", startsAt, endsAt, 10_001]),
      campaigns,
      "InvalidCapacity",
    );
  });

  it("enforces UTF-8 byte boundaries for Korean copy", async function () {
    const { campaigns } = await deployFixture();
    const { startsAt, endsAt } = await activeWindow();

    await campaigns.write.createCampaign([
      "가".repeat(26),
      "나".repeat(93),
      startsAt,
      endsAt,
      10_000,
    ]);
    const campaign = await campaigns.read.getCampaign([1n]);
    assert.equal(campaign.capacity, 10_000);

    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign([
        "가".repeat(27),
        "설명",
        startsAt,
        endsAt,
        1,
      ]),
      campaigns,
      "TitleTooLong",
    );
    await viem.assertions.revertWithCustomError(
      campaigns.write.createCampaign([
        "제목",
        "나".repeat(94),
        startsAt,
        endsAt,
        1,
      ]),
      campaigns,
      "DetailsTooLong",
    );
  });

  it("accepts a currently verified wallet exactly once", async function () {
    const { campaigns, verifiedCampaigns } = await deployFixture();
    await createActiveCampaign(campaigns);

    await viem.assertions.emitWithArgs(
      verifiedCampaigns.write.claim([1n]),
      campaigns,
      "CampaignClaimed",
      [1n, verifiedWallet.account.address],
    );

    assert.equal(
      await campaigns.read.hasClaimed([1n, verifiedWallet.account.address]),
      true,
    );
    assert.equal(
      await campaigns.read.isEligible([1n, verifiedWallet.account.address]),
      true,
    );
    await viem.assertions.revertWithCustomError(
      verifiedCampaigns.write.claim([1n]),
      campaigns,
      "AlreadyClaimed",
    );
  });

  it("rejects an unverified wallet", async function () {
    const { campaigns, unverifiedCampaigns } = await deployFixture();
    await createActiveCampaign(campaigns);

    await viem.assertions.revertWithCustomError(
      unverifiedCampaigns.write.claim([1n]),
      campaigns,
      "NotVerified",
    );
  });

  it("accepts the exact start boundary and rejects the exact end boundary", async function () {
    const { campaigns, verifiedCampaigns, secondVerifiedCampaigns } =
      await deployFixture();
    const now = (await publicClient.getBlock()).timestamp;
    const startsAt = now + 100n;
    const endsAt = startsAt + 100n;
    await campaigns.write.createCampaign([
      "Timed",
      "A fixed window",
      startsAt,
      endsAt,
      2,
    ]);

    await viem.assertions.revertWithCustomError(
      verifiedCampaigns.write.claim([1n]),
      campaigns,
      "CampaignNotStarted",
    );
    await networkHelpers.time.increaseTo(startsAt);
    await verifiedCampaigns.write.claim([1n]);
    await networkHelpers.time.increaseTo(endsAt);
    await viem.assertions.revertWithCustomError(
      secondVerifiedCampaigns.write.claim([1n]),
      campaigns,
      "CampaignEnded",
    );
  });

  it("rejects claims after capacity is reached", async function () {
    const { campaigns, verifiedCampaigns, secondVerifiedCampaigns } =
      await deployFixture();
    await createActiveCampaign(campaigns, 1);
    await verifiedCampaigns.write.claim([1n]);

    await viem.assertions.revertWithCustomError(
      secondVerifiedCampaigns.write.claim([1n]),
      campaigns,
      "CampaignFull",
    );
  });

  it("allows only the organizer to cancel and blocks later claims", async function () {
    const { campaigns, verifiedCampaigns } = await deployFixture();
    await createActiveCampaign(campaigns);

    await viem.assertions.revertWithCustomError(
      verifiedCampaigns.write.cancelCampaign([1n]),
      campaigns,
      "NotOrganizer",
    );
    await campaigns.write.cancelCampaign([1n]);
    await viem.assertions.revertWithCustomError(
      verifiedCampaigns.write.claim([1n]),
      campaigns,
      "CampaignCanceled",
    );
  });

  it("preserves claim history while current eligibility follows revocation", async function () {
    const { verifier, campaigns, verifiedCampaigns } = await deployFixture();
    await createActiveCampaign(campaigns);
    await verifiedCampaigns.write.claim([1n]);

    await verifier.write.setVerified([
      verifiedWallet.account.address,
      attesterId,
      false,
    ]);

    assert.equal(
      await campaigns.read.hasClaimed([1n, verifiedWallet.account.address]),
      true,
    );
    assert.equal(
      await campaigns.read.isEligible([1n, verifiedWallet.account.address]),
      false,
    );

    await verifier.write.setVerified([
      verifiedWallet.account.address,
      attesterId,
      true,
    ]);
    assert.equal(
      await campaigns.read.isEligible([1n, verifiedWallet.account.address]),
      true,
    );
  });

  it("preserves history but removes current eligibility after cancellation", async function () {
    const { campaigns, verifiedCampaigns } = await deployFixture();
    await createActiveCampaign(campaigns);
    await verifiedCampaigns.write.claim([1n]);
    await campaigns.write.cancelCampaign([1n]);

    assert.equal(
      await campaigns.read.hasClaimed([1n, verifiedWallet.account.address]),
      true,
    );
    assert.equal(
      await campaigns.read.isEligible([1n, verifiedWallet.account.address]),
      false,
    );
  });

  it("lets another contract reuse current eligibility as an access condition", async function () {
    const { verifier, campaigns, verifiedCampaigns } = await deployFixture();
    await createActiveCampaign(campaigns);
    const gate = await viem.deployContract("MockWadangAccessGate", [
      campaigns.address,
      1n,
    ]);
    const verifiedGate = await viem.getContractAt(
      "MockWadangAccessGate",
      gate.address,
      { client: { public: publicClient, wallet: verifiedWallet } },
    );

    await viem.assertions.revertWithCustomError(
      verifiedGate.read.gatedAction({
        account: verifiedWallet.account.address,
      }),
      gate,
      "AccessDenied",
    );

    await verifiedCampaigns.write.claim([1n]);
    assert.equal(
      await verifiedGate.read.gatedAction({
        account: verifiedWallet.account.address,
      }),
      "0x60e87068",
    );

    await verifier.write.setVerified([
      verifiedWallet.account.address,
      attesterId,
      false,
    ]);
    await viem.assertions.revertWithCustomError(
      verifiedGate.read.gatedAction({
        account: verifiedWallet.account.address,
      }),
      gate,
      "AccessDenied",
    );
  });

  it("propagates verifier failures instead of treating them as verification", async function () {
    const { verifier, campaigns, verifiedCampaigns } = await deployFixture();
    await createActiveCampaign(campaigns);
    await verifier.write.setShouldRevert([true]);

    await assert.rejects(verifiedCampaigns.write.claim([1n]));
    assert.equal(
      await campaigns.read.hasClaimed([1n, verifiedWallet.account.address]),
      false,
    );
  });

  it("returns false eligibility for unknown campaigns and rejects unknown mutations", async function () {
    const { campaigns, verifiedCampaigns } = await deployFixture();
    assert.equal(
      await campaigns.read.isEligible([999n, verifiedWallet.account.address]),
      false,
    );
    await viem.assertions.revertWithCustomError(
      verifiedCampaigns.write.claim([999n]),
      campaigns,
      "CampaignNotFound",
    );
    await viem.assertions.revertWithCustomError(
      verifiedCampaigns.write.cancelCampaign([999n]),
      campaigns,
      "CampaignNotFound",
    );
  });

  it("rejects the zero verifier at deployment", async function () {
    await assert.rejects(
      viem.deployContract("WadangCampaigns", [
        "0x0000000000000000000000000000000000000000",
        zeroHash,
      ]),
    );
  });
});
