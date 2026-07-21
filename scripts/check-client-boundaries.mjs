import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const publicManifestRoot = resolve(".next", "server", "app", "(public)");
const productManifest = resolve(
  ".next",
  "server",
  "app",
  "(product)",
  "open",
  "page_client-reference-manifest.js",
);
const web3Modules = [
  "src/components/providers.tsx",
  "src/components/wallet-button.tsx",
];

async function findManifests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findManifests(path);
    return entry.name.endsWith("client-reference-manifest.js") ? [path] : [];
  }));
  return files.flat();
}

const failures = [];
const publicManifests = await findManifests(publicManifestRoot);

for (const manifestPath of publicManifests) {
  const manifest = await readFile(manifestPath, "utf8");
  for (const modulePath of web3Modules) {
    if (manifest.includes(modulePath)) {
      failures.push(`${manifestPath}: unexpectedly includes ${modulePath}`);
    }
  }
}

const productSource = await readFile(productManifest, "utf8");
for (const modulePath of web3Modules) {
  if (!productSource.includes(modulePath)) {
    failures.push(`${productManifest}: expected ${modulePath}`);
  }
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Client boundary check passed for ${publicManifests.length} public route manifests; Web3 remains in the product layout.`,
  );
}
