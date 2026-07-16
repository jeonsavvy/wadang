import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OFFICIAL_GIWA_SEPOLIA_VERIFIER = "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9";

export default buildModule("WadangCampaignsModule", (m) => {
  const verifier = m.getParameter("verifier", OFFICIAL_GIWA_SEPOLIA_VERIFIER);
  // There is deliberately no default: deployment requires a confirmed Playground attester.
  const attesterId = m.getParameter("attesterId");
  const wadangCampaigns = m.contract("WadangCampaigns", [verifier, attesterId]);

  return { wadangCampaigns };
});
