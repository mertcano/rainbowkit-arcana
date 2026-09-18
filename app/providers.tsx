"use client";

import React from "react";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { WagmiProvider } from "wagmi";

import config from "@/lib/wallet";


interface Props {
  children: React.ReactNode;
}

const Providers: React.FC<Props> = ({ children }) => {
  // Create a single React Query client per provider mount to avoid
  // a fresh cache being created on every re-render of the provider tree.
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <SessionProvider>
        <RainbowKitSiweNextAuthProvider>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiProvider>
  );
};
export default Providers;
