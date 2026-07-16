export const wadangRelease = {
  network: "GIWA Sepolia",
  chainId: 91_342,
  publishedAt: "2026-07-16",
  contractAddress: "0x4a787Aa8BD73bBA2F8a19a36672A808DAE8D5050",
  verifierAddress: "0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9",
  attesterId:
    "0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678",
  sourceCommit: "27b70b520654110d216a5c9db8083043e4251d7e",
  contractSourceSha256:
    "86a60fe99f44b2890d8da5c36a36faa08a57dcc5f9c920b180b7838187b5a86b",
  transactions: {
    deployment:
      "0xdbb5dc5c718a7aba5e2f769257a52fd6253da5986a59f830992bee168724ff8d",
    createCampaign1:
      "0x185fffa6e324e1d1c06beb7bb1bf69fdf5e31da98eb2f01fceb5b5f69db699d1",
    claimCampaign1:
      "0x9d3df05a011fd01c4c02859e6961e0e082392443d58daaf8f321ea337f038399",
    createCampaign2:
      "0x15d105f14ed55dda13e7d41a3d4c4a92b93d618c3cef909c86b9e7b561494768",
    cancelCampaign2:
      "0x49851234ce172f014c2a11feb75cfca370cfa8824a800c0ec6ee94b6bd8e0885",
  },
  simulations: {
    unverifiedClaim: "NotVerified",
    duplicateClaim: "AlreadyClaimed",
    unauthorizedCancel: "NotOrganizer",
  },
} as const;

export const repositoryUrl = "https://github.com/jeonsavvy/wadang";
export const sourceCommitUrl = `${repositoryUrl}/commit/${wadangRelease.sourceCommit}`;
