const MOBILE_USER_AGENT = /Android|iPhone|iPad|iPod/i;

export function isMobileBrowser(userAgent: string, maxTouchPoints = 0) {
  return MOBILE_USER_AGENT.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
}

export function getMetaMaskDappUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("MetaMask dapp links require an HTTP(S) URL.");
  }

  return `https://link.metamask.io/dapp/${url.host}${url.pathname}`;
}
