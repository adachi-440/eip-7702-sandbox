import { encodeFunctionData, getContract, parseEther } from 'viem'
import { delegater, anvil1DelegaterWalletClient, anvil1WalletClient, anvil1PublicClient } from './config'
import { abi, contractAddress } from './contract'

async function main() {
  console.log(`wallet client: ${anvil1WalletClient.account.address}`)
  console.log(`delegater: ${delegater.address}`)
  // 1. Authorize injection of the Contract's bytecode into our Account.
  const authorization = await anvil1WalletClient.signAuthorization({
    contractAddress,
    delegate: delegater,
  })

  // get balance of sender
  let oldBalance = await anvil1PublicClient.getBalance({ address: anvil1WalletClient.account.address })
  console.log('Old sender balance:', oldBalance)

  // const balance of invoker
  let oldDelegaterBalance = await anvil1PublicClient.getBalance({ address: delegater.address })
  console.log('Old delegater balance:', oldDelegaterBalance)

  try {
    // 2. Invoke the Contract's `execute` function to perform batch calls.
    const hash = await anvil1DelegaterWalletClient.sendTransaction({
      account: delegater,
      authorizationList: [authorization],
      data: encodeFunctionData({
        abi,
        functionName: 'execute',
        args: [
          [{
            data: '0x',
            to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
            value: parseEther('0.001'),
          },
          {
            data: '0x',
            to: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
            value: parseEther('0.002'),
          }]
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
    const newBalance = await anvil1PublicClient.getBalance({ address: anvil1WalletClient.account.address })
    console.log('New sender balance:', newBalance)
    console.log('Difference:', newBalance - oldBalance)

    // const balance of invoker
    const newDelegaterBalance = await anvil1PublicClient.getBalance({ address: delegater.address })
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
