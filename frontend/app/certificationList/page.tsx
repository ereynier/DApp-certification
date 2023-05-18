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
import Prompt from './components/Prompt';
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


const CertificationsList = () => {

    const [studentId, setStudentId] = useState(0);

    return (
        <WagmiConfig config={wagmiConfig}>
            <div className='flex flex-col items-center justify-center h-screen w-screen'>
                <Prompt onSubmit={setStudentId}/>
                <List studentId={studentId}/>
            </div>
        </WagmiConfig>
    )
}

export default CertificationsList