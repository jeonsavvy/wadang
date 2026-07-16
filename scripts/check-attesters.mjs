import { createPublicClient, getAddress, http, isAddress } from "viem";

const RPC_URL = "https://sepolia-rpc.giwa.io";
const CHAIN_ID = 91342;
const VERIFIER = getAddress("0xd5077b67dcb56caC8b270C7788FC3E6ee03F17B9");
const CANDIDATES = [
  {
    label: "UPBIT KOREA",
    id: "0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034",
  },
  {
    label: "TESTNET FAUCET",
    id: "0xaa92f8c143657dde575de430aecaea6ca91f2e6072339b16932d426895d8d678",
  },
];
const verifierAbi = [
  {
    type: "function",
    name: "isVerified",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "attesterId", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

const wallet = process.argv[2];
if (!wallet || !isAddress(wallet)) {
  console.error("Usage: pnpm check:attesters <PLAYGROUND_WALLET_ADDRESS>");
  process.exit(1);
}

const chain = {
  id: CHAIN_ID,
  name: "GIWA Sepolia",
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
};
const client = createPublicClient({ chain, transport: http(RPC_URL) });

const results = [];
for (const candidate of CANDIDATES) {
  const verified = await client.readContract({
    address: VERIFIER,
    abi: verifierAbi,
    functionName: "isVerified",
    args: [getAddress(wallet), candidate.id],
  });
  results.push({ ...candidate, verified });
  console.log(`${candidate.label}: ${verified}`);
}

const matches = results.filter((result) => result.verified);
if (matches.length !== 1) {
  console.error(
    `STOP: expected exactly one true attester, received ${matches.length}. Confirm with GIWA before deployment.`,
  );
  process.exit(2);
}

console.log(`SELECTED_ATTESTER_ID=${matches[0].id}`);
