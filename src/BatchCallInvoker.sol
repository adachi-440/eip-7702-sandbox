// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

contract BatchCallInvoker {
    struct Call {
        bytes data;
        address to;
        uint256 value;
    }

    function execute(Call[] calldata calls) external payable {
        for (uint256 i = 0; i < calls.length; i++) {
            Call memory call = calls[i];
            (bool success,) = call.to.call{ value: call.value }(call.data);
            require(success, "call reverted");
        }
    }
}