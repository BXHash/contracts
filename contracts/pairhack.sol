// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./uniswapv2/interfaces/IUniswapV2Pair.sol";

library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }

    function safeTransfer(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }
}

contract PairHack is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

   
   
    constructor(
    ) public {
    }

    function testswap(address lptoken,address token0,address token1,uint256 amountIn0,uint256 amountIn1,uint256 amountOut0,uint256 amountOut1,bytes calldata data) external {
        if(amountIn0>0)
        {
            TransferHelper.safeTransferFrom(token0,msg.sender,lptoken,amountIn0);
        }
        if(amountIn1>0)
        {
            TransferHelper.safeTransferFrom(token1,msg.sender,lptoken,amountIn1);
        }

        IUniswapV2Pair(lptoken).swap(amountOut0,amountOut1,msg.sender,data);
    }


}
