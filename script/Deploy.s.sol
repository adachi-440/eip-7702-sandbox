// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.25 <0.9.0;

import { BatchCallInvoker } from "../src/BatchCallInvoker.sol";
import { SimpleToken } from "../src/SampleToken.sol";
import { BaseScript } from "./Base.s.sol";

bytes32 constant SALT = bytes32(uint256(0x0000000000000000000000000000000000000000d3af2663da51c10215000000));

/// @dev See the Solidity Scripting tutorial: https://book.getfoundry.sh/tutorials/solidity-scripting
contract Deploy is BaseScript {
    function run() public broadcast returns (BatchCallInvoker invoker, SimpleToken token) {
        invoker = new BatchCallInvoker{ salt: SALT }();
        token = new SimpleToken{ salt: SALT }(10_000);
    }
}
