import { encodeFunctionData, parseEther } from 'viem'
import { delegater, anvil1DelegaterWalletClient, anvil1WalletClient, anvil1PublicClient, delegateWalletProvider, account } from './config'
import { abi, contractAddress, permit2Abi, permit2Address, sampleTokenAbi, sampleTokenAddress } from './contract'
import { approvePermit2, getBalance, mintToken } from './token'
import { PERMIT2_ADDRESS, SignatureTransfer } from '@uniswap/permit2-sdk'

function toDeadline(expiration: number): number {
  return Math.floor((Date.now() + expiration) / 1000)
}

async function main() {
  console.log(`wallet client: ${anvil1WalletClient.account.address}`)
  console.log(`delegater: ${delegater.address}`)
  // 1. Authorize injection of the Contract's bytecode into our Account.
  const authorization = await anvil1WalletClient.signAuthorization({
    contractAddress,
    delegate: delegater,
  })

  // get balance of sender
  let oldBalance = await getBalance(anvil1PublicClient.chain.id, account.address)
  console.log('Old sender balance:', oldBalance)

  if (oldBalance <= 0) {
    console.log('Balance is less than 0, minting token to sender...')
    await mintToken(anvil1PublicClient.chain.id, account.address, account.address, 10000)
    oldBalance = await getBalance(anvil1PublicClient.chain.id, anvil1WalletClient.account.address)
    console.log('Old sender balance:', oldBalance)
  }

  // const balance of invoker
  let oldDelegaterBalance = await getBalance(anvil1PublicClient.chain.id, delegater.address)
  console.log('Old delegater balance:', oldDelegaterBalance)

  if (oldDelegaterBalance <= 0) {
    console.log('Balance is less than 0, minting token to delegater...')
    await mintToken(anvil1PublicClient.chain.id, delegater.address, delegater.address, 10000)
    oldDelegaterBalance = await getBalance(anvil1PublicClient.chain.id, delegater.address)
    console.log('Old delegater balance:', oldDelegaterBalance)
  }


  const hash = await approvePermit2(anvil1PublicClient.chain.id, delegater.address, account.address, 1, toDeadline(/* 30 days= */ 1000 * 60 * 60 * 24 * 30))
  console.log('Approved permit2:', hash)

  await new Promise((resolve) => setTimeout(resolve, 500))

  const [permitAmount, expiration, nonce] = await anvil1PublicClient.readContract({
    address: permit2Address,
    abi: permit2Abi,
    functionName: 'allowance',
    args: [delegater.address, sampleTokenAddress, account.address],
  }) as [bigint, bigint, bigint]

  console.log('permit amount:', permitAmount)
  console.log('expiration:', expiration)
  console.log('nonce:', nonce)

  const permit = {
    permitted: {
      token: sampleTokenAddress,
      amount: permitAmount,
    },
    nonce: 2,
    spender: account.address,
    deadline: toDeadline(/* 30 minutes= */ 1000 * 60 * 60 * 30),
  }

  const transferDetails = {
    to: account.address,
    requestedAmount: permitAmount,
  }

  const { domain, types, values } = SignatureTransfer.getPermitData(permit, PERMIT2_ADDRESS, anvil1PublicClient.chain.id)

  const signature = await delegateWalletProvider._signTypedData(domain, types, values)

  const permitTransfer = {
    permitted: permit.permitted,
    nonce: 2,
    deadline: permit.deadline,
  }

  const transferFromFunctionData = encodeFunctionData({
    abi: permit2Abi,
    functionName: 'permitTransferFrom',
    args: [permitTransfer, transferDetails, delegater.address, signature],
  })

  const transferFunctionData = encodeFunctionData({
    abi: sampleTokenAbi,
    functionName: 'transfer',
    args: ["0xd2135CfB216b74109775236E36d4b433F1DF507B", parseEther('1')],
  })

  try {
    // 2. Invoke the Contract's `execute` function to perform batch calls.
    const hash = await anvil1DelegaterWalletClient.sendTransaction({
      account: delegater,
      authorizationList: [authorization],
      data: encodeFunctionData({
        abi,
        functionName: 'execute',
        args: [
          [
            {
              data: transferFromFunctionData,
              to: permit2Address,
              value: parseEther('0'),
            },
            {
              data: transferFunctionData,
              to: sampleTokenAddress,
              value: parseEther('0'),
            },
          ]
        ],
      }),
      to: anvil1WalletClient
        .account.address,
    })

    // sleep for 1 seconds
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // get transaction receipt
    const receipt = await anvil1PublicClient.getTransactionReceipt({ hash })
    console.log('receipt:', receipt)

    // get balance of sender
    const newBalance = await getBalance(anvil1PublicClient.chain.id, account.address)
    console.log('New sender balance:', newBalance)
    console.log('Difference:', newBalance - oldBalance)

    // const balance of invoker
    const newDelegaterBalance = await getBalance(anvil1PublicClient.chain.id, delegater.address)
    console.log('New delegater balance:', newDelegaterBalance)
    console.log('Difference:', newDelegaterBalance - oldDelegaterBalance)
  } catch (error) {
    console.error(error)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
