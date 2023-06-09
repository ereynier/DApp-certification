/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: config => {
      config.resolve.fallback = { fs: false, net: false, tls: false };
      return config;
    },
    env:{
      CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS
    }
  };
  
  module.exports = nextConfig;