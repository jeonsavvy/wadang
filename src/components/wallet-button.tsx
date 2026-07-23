"use client";

import { Check, ChevronDown, CircleAlert, LoaderCircle, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import { giwaSepolia } from "@/lib/chain";
import { shortenAddress } from "@/lib/campaign-state";
import { getMetaMaskDappUrl, isMobileBrowser } from "@/lib/wallet-link";

export function WalletButton() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== giwaSepolia.id;

  async function handleConnect() {
    setFeedback(null);
    const connector = connectors[0];
    const provider = connector ? await connector.getProvider().catch(() => undefined) : undefined;

    if (!provider) {
      if (isMobileBrowser(navigator.userAgent, navigator.maxTouchPoints)) {
        window.location.assign(getMetaMaskDappUrl(new URL(window.location.href)));
        return;
      }

      setFeedback("브라우저 지갑을 찾지 못했습니다. MetaMask를 설치한 뒤 페이지를 새로고침해 주세요.");
      return;
    }

    connect(
      { connector },
      {
        onError: () =>
          setFeedback("지갑 연결을 완료하지 못했습니다. 지갑의 연결 요청을 확인한 뒤 다시 시도해 주세요."),
        onSuccess: () => setFeedback(null),
      },
    );
  }

  if (!isConnected) {
    return (
      <div className="wallet-connect">
        <button
          aria-describedby={feedback ? "wallet-connect-feedback" : undefined}
          className="button button-dark"
          disabled={isConnecting}
          onClick={handleConnect}
          type="button"
        >
          {isConnecting ? <LoaderCircle className="spin" size={16} /> : <Wallet size={16} />}
          지갑 연결
        </button>
        {feedback ? (
          <div className="wallet-feedback" id="wallet-connect-feedback" role="status">
            <span>{feedback}</span>
            <a href="https://metamask.io/download/" rel="noreferrer" target="_blank">
              MetaMask 설치
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div className="wallet-connect">
        <button
          aria-describedby={feedback ? "wallet-connect-feedback" : undefined}
          className="button button-warning"
          disabled={isSwitching}
          onClick={() => {
            setFeedback(null);
            switchChain(
              { chainId: giwaSepolia.id },
              {
                onError: () =>
                  setFeedback(
                    "GIWA Sepolia로 전환하지 못했습니다. 지갑에서 네트워크를 직접 선택한 뒤 다시 시도해 주세요.",
                  ),
                onSuccess: () => setFeedback(null),
              },
            );
          }}
          type="button"
        >
          {isSwitching ? <LoaderCircle className="spin" size={16} /> : <CircleAlert size={16} />}
          GIWA Sepolia 전환
        </button>
        {feedback ? (
          <div className="wallet-feedback" id="wallet-connect-feedback" role="status">
            {feedback}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <details className="wallet-menu">
      <summary className="button button-light">
        <Check size={15} />
        {address ? shortenAddress(address) : "연결됨"}
        <ChevronDown size={14} />
      </summary>
      <div className="wallet-popover">
        <span>GIWA Sepolia · 연결됨</span>
        <button onClick={() => disconnect()} type="button">
          연결 해제
        </button>
      </div>
    </details>
  );
}
