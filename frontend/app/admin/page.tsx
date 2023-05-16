"use client"

import React from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import { configureChains, createConfig, useAccount, useContractRead, WagmiConfig } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';

import AdminConnect from './components/AdminConnect';

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [hardhat, sepolia],
    [publicProvider()],
  )

const { connectors } = getDefaultWallets({
    appName: 'Certifications',
    projectId: 'YOUR_PROJECT_ID',
    chains
});

const wagmiConfig = createConfig({
    autoConnect: false,
    connectors,
    publicClient,
    webSocketPublicClient
})

export default function Admin() {


    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains}>
                <AdminConnect />
            </RainbowKitProvider>
        </WagmiConfig>
    )
}