import { Address, erc20Abi } from "viem";
import { anvil1DelegaterWalletClient, anvil1PublicClient, anvil1WalletClient, getPublicClient, getWalletClient } from "./config";
import { parseEther } from "viem/utils";
import { permit2Address, sampleTokenAbi } from "./contract";
import { sampleTokenAddress, permit2Abi } from "./contract";

export const sendToken = async (chainId: number, owner: Address, to: Address, amount: number) => {
  const walletClient = getWalletClient(chainId, owner);
  const hash = await walletClient.writeContract({
    address: sampleTokenAddress,
    abi: sampleTokenAbi,
    functionName: 'transfer',
    args: [to, parseEther(amount.toString())],
  })
  return hash
}

export const mintToken = async (chainId: number, owner: Address, to: Address, amount: number) => {
  const walletClient = getWalletClient(chainId, owner);
  const hash = await walletClient.writeContract({
    address: sampleTokenAddress,
    abi: sampleTokenAbi,
    functionName: 'mint',
    args: [to, parseEther(amount.toString())],
  })
  return hash
}

export const getBalance = async (chainId: number, address: Address) => {
  const publicClient = getPublicClient(chainId);
  return await publicClient.readContract({
    address: sampleTokenAddress,
    abi: sampleTokenAbi,
    functionName: 'balanceOf',
    args: [address],
  })
}

export const approve = async (chainId: number, owner: Address, spender: Address, contractAddress: Address, amount: number) => {
  const walletClient = getWalletClient(chainId, owner);
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: sampleTokenAbi,
    functionName: 'approve',
    args: [spender, parseEther(amount.toString())],
  })
  return hash
}

export const approvePermit2 = async (chainId: number, owner: Address, spender: Address, amount: number, expiration: number) => {
  const walletClient = getWalletClient(chainId, owner);
  const hash = await walletClient.writeContract({
    address: permit2Address,
    abi: permit2Abi,
    functionName: 'approve',
    args: [sampleTokenAddress, spender, parseEther(amount.toString()), expiration],
  })
  return hash
}

export const getAllowance = async (chainId: number, owner: Address, spender: Address) => {
  const publicClient = getPublicClient(chainId);
  return await publicClient.readContract({
    address: sampleTokenAddress,
    abi: sampleTokenAbi,
    functionName: 'allowance',
    args: [owner, spender],
  })
}