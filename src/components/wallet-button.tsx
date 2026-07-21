"use client";

import { Check, ChevronDown, CircleAlert, LoaderCircle, Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

import { giwaSepolia } from "@/lib/chain";
import { shortenAddress } from "@/lib/campaign-state";

export function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== giwaSepolia.id;

  if (!isConnected) {
    return (
      <button
        className="button button-dark"
        disabled={isConnecting || connectors.length === 0}
        onClick={() => connectors[0] && connect({ connector: connectors[0] })}
        type="button"
      >
        {isConnecting ? <LoaderCircle className="spin" size={16} /> : <Wallet size={16} />}
        {connectors.length === 0 ? "사용 가능한 지갑 없음" : "지갑 연결"}
      </button>
    );
  }

  if (wrongNetwork) {
    return (
      <button
        className="button button-warning"
        disabled={isSwitching}
        onClick={() => switchChain({ chainId: giwaSepolia.id })}
        type="button"
      >
        {isSwitching ? <LoaderCircle className="spin" size={16} /> : <CircleAlert size={16} />}
        GIWA Sepolia 전환
      </button>
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
