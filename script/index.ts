import { getContract, parseEther } from 'viem'
import { walletClient } from './config'
import { abi, contractAddress } from './contract'

async function main() {
  // 1. Set up a Contract Instance pointing to our Account.
  const batchCallInvoker = getContract({
    abi,
    address: walletClient.account.address,
    client: walletClient,
  })

  // 2. Authorize injection of the Contract's bytecode into our Account.
  const authorization = await walletClient.signAuthorization({
    contractAddress,
  })

  // 3. Invoke the Contract's `execute` function to perform batch calls.
  const hash = await walletClient.writeContract({
    abi,
    address: walletClient.account.address,
    authorizationList: [authorization],
    functionName: 'execute',
    args: [
      [{
        data: '0x',
        to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
        value: parseEther('0.001'),
      }],
    ],
  })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
