"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Default to MagicBlock Magic Router for automatic smart routing (ER vs base)
const DEFAULT_RPC =
  process.env.NEXT_PUBLIC_ER_ROUTER_RPC || "https://devnet-router.magicblock.app";

require("@solana/wallet-adapter-react-ui/styles.css");

export function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => DEFAULT_RPC, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
