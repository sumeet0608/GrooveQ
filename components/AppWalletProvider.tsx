// "use client";

// import React, { useMemo } from "react";
// import {
//   ConnectionProvider,
//   WalletProvider,
// } from "@solana/wallet-adapter-react";
// import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// import { clusterApiUrl } from "@solana/web3.js";
// require("@solana/wallet-adapter-react-ui/styles.css");



// export default function AppWalletProvider({
//     children,
//   }: {
//     children: React.ReactNode;
//   }) {

//     const network = WalletAdapterNetwork.Devnet;
//     const endpoint = useMemo(() => clusterApiUrl(network), [network]);
//     const wallets = useMemo(
//       () => [
//         // manually add any legacy wallet adapters here
//         // new UnsafeBurnerWalletAdapter(),
//       ],
//       [network],
//     );
//     if (!endpoint) return null
//     return (
//       <ConnectionProvider endpoint={endpoint}>
//         <WalletProvider wallets={wallets} autoConnect>
//           <WalletModalProvider>{children}</WalletModalProvider>
//         </WalletProvider>
//       </ConnectionProvider>
//     );
//   }

"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
require("@solana/wallet-adapter-react-ui/styles.css");

export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      // new UnsafeBurnerWalletAdapter(),
    ],
    [network],
  );

  if (!mounted) return null; // Prevents any UI until mounted on client

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
