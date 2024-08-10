import { createWalletClient, http } from 'viem'
import { anvil } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { eip7702Actions } from 'viem/experimental'

export const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')

export const walletClient = createWalletClient({
  account,
  chain: anvil,
  transport: http(),
}).extend(eip7702Actions())
