import { expect, test } from "@playwright/test";

const origin = "https://wadang.jeonsavvy.workers.dev";
const brandImage = `${origin}/wadang-social-card.png`;

const routes = [
  {
    path: "/",
    title: "WADANG | Dojang 인증 지갑의 온체인 캠페인",
    description:
      "기간과 정원을 정해 마당을 열고, Dojang 인증 지갑의 참여를 GIWA Sepolia에 기록하는 온체인 캠페인.",
    image: brandImage,
  },
  {
    path: "/gasok",
    title: "GASOK 제출자료 | WADANG",
    description:
      "WADANG 앱, 피치덱, 팀 소개, 기술문서와 GIWA Sepolia 배포 영수증을 한곳에서 확인합니다.",
    image: brandImage,
  },
  {
    path: "/docs",
    title: "기술문서 | WADANG",
    description:
      "WadangCampaigns 컨트랙트 API, 참여 규칙, isEligible 연동, 보안 경계와 GIWA Sepolia 실행 결과를 설명합니다.",
    image: brandImage,
  },
  {
    path: "/deck",
    title: "GASOK 피치덱 | WADANG",
    description:
      "Dojang 인증 지갑의 참여를 온체인에 기록하고 외부 앱의 접근 조건으로 연결하는 WADANG 피치덱입니다.",
    image: brandImage,
  },
  {
    path: "/team",
    title: "팀 소개 | WADANG",
    description:
      "WADANG의 제품 기획, 스마트 컨트랙트, 프론트엔드, 테스트와 기술문서를 맡은 전찬혁의 팀 프로필입니다.",
    image: `${origin}/team/jeon-chan-hyuk.webp`,
  },
  {
    path: "/open",
    title: "마당 열기 | WADANG",
    description:
      "기간과 정원을 정해 마당을 열고 Dojang 인증 지갑의 참여를 GIWA Sepolia에 기록합니다.",
    image: brandImage,
  },
  {
    path: "/manage",
    title: "내 마당 | WADANG",
    description:
      "연결한 운영자 지갑이 만든 GIWA Sepolia 캠페인의 상태, 참여 수와 공유 링크를 확인합니다.",
    image: brandImage,
  },
  {
    path: "/madang/1",
    title: "마당 #1 | WADANG",
    description:
      "GIWA Sepolia 마당 #1의 상태와 Dojang 인증 지갑 참여 조건을 확인합니다.",
    image: brandImage,
  },
] as const;

test("public pages expose canonical and social metadata", async ({ page }) => {
  for (const route of routes) {
    const routeUrl = route.path === "/" ? origin : `${origin}${route.path}`;
    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBe(true);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", route.description);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", routeUrl);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", route.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", route.description);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", routeUrl);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", route.image);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      route.path === "/team" ? "summary" : "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", route.title);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", route.description);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", route.image);
  }
});

test("route responses set low-risk security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["permissions-policy"]).toBe(
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

test("the social card is served as the inspected 1200 by 630 PNG", async ({ page, request }) => {
  const response = await request.get("/wadang-social-card.png");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const dimensions = await page.evaluate(async () => {
    const image = new Image();
    image.src = "/wadang-social-card.png";
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  expect(dimensions).toEqual({ width: 1200, height: 630 });
});
