import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = new URL(
  process.env.RELEASE_BASE_URL ?? "https://wadang.jeonsavvy.workers.dev",
);

const appRoutes = [
  "/",
  "/open",
  "/manage",
  "/madang/1",
  "/docs",
  "/deck",
  "/team",
  "/gasok",
].map((path) => ({
  path,
  contentType: "text/html",
  minimumBytes: 1_000,
}));

const releaseAssets = [
  {
    path: "/artifacts/wadang-pitch-deck.pdf",
    localPath: "public/artifacts/wadang-pitch-deck.pdf",
    contentType: "application/pdf",
    minimumBytes: 100_000,
  },
  {
    path: "/artifacts/wadang-team-profile.pdf",
    localPath: "public/artifacts/wadang-team-profile.pdf",
    contentType: "application/pdf",
    minimumBytes: 100_000,
  },
  {
    path: "/artifacts/wadang-technical-docs.pdf",
    localPath: "public/artifacts/wadang-technical-docs.pdf",
    contentType: "application/pdf",
    minimumBytes: 100_000,
  },
  {
    path: "/team/jeon-chan-hyuk.webp",
    localPath: "public/team/jeon-chan-hyuk.webp",
    contentType: "image/webp",
    minimumBytes: 10_000,
    maximumBytes: 100_000,
  },
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function fetchReleaseFile(item) {
  const url = new URL(item.path, baseUrl);
  url.searchParams.set("release_check", Date.now().toString());
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "cache-control": "no-cache" },
    redirect: "follow",
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(`${item.path}: HTTP ${response.status}`);
  }
  if (!contentType.toLowerCase().startsWith(item.contentType)) {
    throw new Error(
      `${item.path}: expected ${item.contentType}, received ${contentType || "no content-type"}`,
    );
  }
  if (bytes.byteLength < item.minimumBytes) {
    throw new Error(
      `${item.path}: expected at least ${item.minimumBytes} bytes, received ${bytes.byteLength}`,
    );
  }
  if (item.maximumBytes && bytes.byteLength > item.maximumBytes) {
    throw new Error(
      `${item.path}: expected at most ${item.maximumBytes} bytes, received ${bytes.byteLength}`,
    );
  }

  return { bytes, contentType, status: response.status };
}

const failures = [];

for (const item of appRoutes) {
  try {
    const remote = await fetchReleaseFile(item);
    console.log(`PASS ${item.path} ${remote.status} ${remote.contentType} ${remote.bytes.byteLength} bytes`);
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
}

for (const item of releaseAssets) {
  try {
    const localBytes = await readFile(resolve(item.localPath));
    if (localBytes.byteLength < item.minimumBytes) {
      throw new Error(
        `${item.localPath}: expected at least ${item.minimumBytes} bytes, received ${localBytes.byteLength}`,
      );
    }
    if (item.maximumBytes && localBytes.byteLength > item.maximumBytes) {
      throw new Error(
        `${item.localPath}: expected at most ${item.maximumBytes} bytes, received ${localBytes.byteLength}`,
      );
    }

    const remote = await fetchReleaseFile(item);
    const localHash = sha256(localBytes);
    const remoteHash = sha256(remote.bytes);
    if (localHash !== remoteHash) {
      throw new Error(
        `${item.path}: SHA-256 mismatch (local ${localHash}, deployed ${remoteHash})`,
      );
    }

    console.log(
      `PASS ${item.path} ${remote.status} ${remote.contentType} ${remote.bytes.byteLength} bytes sha256=${remoteHash}`,
    );
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Release check passed for ${appRoutes.length} routes and ${releaseAssets.length} assets at ${baseUrl.origin}`);
}
