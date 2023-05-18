"use client"

import CertificateById from "./components/CertificateById"

import React from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import { configureChains, createConfig,useContractRead, WagmiConfig } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';


const { chains, publicClient, webSocketPublicClient } = configureChains(
    [hardhat, sepolia],
    [publicProvider()],
  )


const wagmiConfig = createConfig({
    autoConnect: false,
    publicClient,
    webSocketPublicClient
})


const Certification = () => {

    return (
        <WagmiConfig config={wagmiConfig}>
            <CertificateById />
        </WagmiConfig>
    )
}

export default Certification