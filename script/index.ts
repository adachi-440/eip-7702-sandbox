import { encodeFunctionData, getContract, parseEther } from 'viem'
import { publicClient, walletClient } from './config'
import { abi, contractAddress } from './contract'
import { privateKeyToAccount } from 'viem/accounts'

async function main() {
  // 1. Authorize injection of the Contract's bytecode into our Account.
  const authorization = await walletClient.signAuthorization({
    contractAddress,
  })

  const invoker = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d')

  // get balance of sender
  let balance = await publicClient.getBalance({ address: walletClient.account.address })
  console.log('Old sender balance:', balance)

  // const balance of invoker
  let invokerBalance = await publicClient.getBalance({ address: invoker.address })
  console.log('Old invoker balance:', invokerBalance)

  // 2. Invoke the Contract's `execute` function to perform batch calls.
  const hash = await walletClient.sendTransaction({
    account: invoker,
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
    to: walletClient
      .account.address,
  })

  // sleep for 1 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // get transaction receipt
  const receipt = await publicClient.getTransactionReceipt({ hash })
  console.log('receipt:', receipt)

  // get balance of sender
  balance = await publicClient.getBalance({ address: walletClient.account.address })
  console.log('New sender balance:', balance)

  // const balance of invoker
  invokerBalance = await publicClient.getBalance({ address: invoker.address })
  console.log('New invoker balance:', invokerBalance)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
