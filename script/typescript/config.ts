import { Address, createPublicClient, createWalletClient, defineChain, http } from 'viem'
import { anvil, odysseyTestnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { eip7702Actions } from 'viem/experimental'
import ethers from 'ethers'

export const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')
export const delegater = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')

const anvil1 = defineChain({
  ...anvil,
  id: 31337,
  rpcUrls: {
    default: {
      http: ['http://localhost:8545'],
    },
  },
})

const anvil2 = defineChain({
  ...anvil,
  id: 31338,
  rpcUrls: {
    default: {
      http: ['http://localhost:8546'],
    },
  },
})

export const anvil1Provider = new ethers.providers.JsonRpcProvider()

export const delegateWalletProvider = new ethers.Wallet('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d', anvil1Provider)

export const anvil1WalletClient = createWalletClient({
  account,
  chain: anvil1,
  transport: http(),
}).extend(eip7702Actions())

export const anvil1DelegaterWalletClient = createWalletClient({
  account: delegater,
  chain: anvil1,
  transport: http(),
}).extend(eip7702Actions())

export const anvil2WalletClient = createWalletClient({
  account,
  chain: anvil2,
  transport: http(),
}).extend(eip7702Actions())

export const anvil2DelegaterWalletClient = createWalletClient({
  account: delegater,
  chain: anvil2,
  transport: http(),
}).extend(eip7702Actions())

export const odysseyWalletClient = createWalletClient({
  account,
  chain: odysseyTestnet,
  transport: http(),
}).extend(eip7702Actions())

export const anvil1PublicClient = createPublicClient({
  chain: anvil1,
  transport: http(),
}).extend(eip7702Actions())

export const anvil2PublicClient = createPublicClient({
  chain: anvil2,
  transport: http(),
}).extend(eip7702Actions())

export const odysseyPublicClient = createPublicClient({
  chain: odysseyTestnet,
  transport: http(),
}).extend(eip7702Actions())

export const getWalletClient = (chainId: number, owner: Address) => {
  if (chainId === 31337) {
    if (owner === delegater.address) return anvil1DelegaterWalletClient
    return anvil1WalletClient
  }
  if (chainId === 31338) {
    if (owner === delegater.address) return anvil2DelegaterWalletClient
    return anvil2WalletClient
  }
  if (chainId === 1088) return odysseyWalletClient
  throw new Error(`Unsupported chainId: ${chainId}`)
}

export const getPublicClient = (chainId: number) => {
  if (chainId === 31337) return anvil1PublicClient
  if (chainId === 31338) return anvil2PublicClient
  if (chainId === 1088) return odysseyPublicClient
  throw new Error(`Unsupported chainId: ${chainId}`)
}
