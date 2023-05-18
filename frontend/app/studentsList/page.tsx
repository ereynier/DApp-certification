"use client"

import React, { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import {
    getDefaultWallets,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import { configureChains, createConfig,useContractRead, WagmiConfig } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura';
import List from './components/List';


const { chains, publicClient, webSocketPublicClient } = configureChains(
    [hardhat, sepolia],
    [publicProvider()],
  )

const wagmiConfig = createConfig({
    autoConnect: false,
    publicClient,
    webSocketPublicClient
})

const StudentList = () => {
  return (
    <WagmiConfig config={wagmiConfig}>
        <List />
    </WagmiConfig>
  )
}

export default StudentList