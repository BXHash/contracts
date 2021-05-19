// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './uniswapv2/interfaces/IUniswapV2Factory.sol';
import './uniswapv2/UniswapV2Pair.sol';
import './bxhpool.sol';
import './uniswapv2/libraries/UniswapV2Library.sol';


contract BXHLPDelegate is Context,Ownable {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public lpToken;

    address public emergencyAddress;

    struct UserDelegateInfo{
        // uint256 reserve0;
        // uint256 reserve1;
        uint256 lpAmount;
        uint256 kLast;
        uint256 lpShared;
    }

    mapping(address => UserDelegateInfo) public userDelegateInfos;

    BXHPool public bxhPool;

    uint256 public totalLP;

    uint256 public pid;
    constructor(
        address _lpToken,
        address _bxhPool,
        uint256 _pid,
        address _emergencyAddress

    )public {
        lpToken=_lpToken;
        bxhPool = BXHPool(_bxhPool);
        pid=_pid;
        emergencyAddress=_emergencyAddress;
    }
    function setPid(uint256 _pid) onlyOwner public {
        pid=_pid;
    }

    //calc to burn;
    function depositLPToken(uint256 _amount) public payable returns(uint256 feeAmount,uint256 amount0,uint256 amount1) {
        require(_amount > 0,'deposit token must large than 0');
        uint256 _before = IERC20(lpToken).balanceOf(address(this));
        IERC20(lpToken).safeTransferFrom(msg.sender, address(this), _amount);
        uint256 _after = IERC20(lpToken).balanceOf(address(this));
        _amount = _after.sub(_before);

        UserDelegateInfo storage userInfo = userDelegateInfos[msg.sender];

        (uint112 _reserve0, uint112 _reserve1,) = UniswapV2Pair(lpToken).getReserves(); // gas savings
        if(userInfo.lpAmount>0){
            //
            uint rootK = Math.sqrt(uint(_reserve0).mul(_reserve1));
            uint rootKLast = Math.sqrt(userInfo.kLast);
            if (rootK > rootKLast) {
                uint numerator = UniswapV2Pair(lpToken).totalSupply().mul(rootK.sub(rootKLast));
                uint denominator = rootK.mul(2).add(rootKLast);
                uint liquidity = numerator / denominator;
                // if (liquidity > 0) _mint(feeTo, liquidity);
                userInfo.lpShared = userInfo.lpShared.add(liquidity.add(liquidity));
                require(userInfo.lpShared<userInfo.lpAmount,'share K error');
            }
        }
        IERC20(lpToken).safeApprove(address(bxhPool),_amount);
        bxhPool.deposit(pid,_amount);        
        totalLP = totalLP.add(_amount);

        userInfo.kLast = uint(_reserve0).mul(_reserve1);
        userInfo.lpAmount = userInfo.lpAmount.add(_amount);

    }


    function pendingBXH(address userA) public view returns(uint256 lpReturn,uint256 bxhReturn){

        UserDelegateInfo storage userInfo = userDelegateInfos[userA];
        require( userInfo.lpAmount > 0,'user lp token must large than 0');
        require( userInfo.lpAmount > userInfo.lpShared,'user lp token must large shared');
        
        uint256 lpShared = userInfo.lpShared ;
        (uint112 _reserve0, uint112 _reserve1,) = UniswapV2Pair(lpToken).getReserves(); // gas savings
        uint rootK = Math.sqrt(uint(_reserve0).mul(_reserve1));
        uint rootKLast = Math.sqrt(userInfo.kLast);
        if (rootK > rootKLast) {
            uint numerator = UniswapV2Pair(lpToken).totalSupply().mul(rootK.sub(rootKLast));
            uint denominator = rootK.mul(2).add(rootKLast);
            uint liquidity = numerator / denominator;
            // if (liquidity > 0) _mint(feeTo, liquidity);
            lpShared = userInfo.lpShared.add(liquidity.add(liquidity));
            require(lpShared < userInfo.lpAmount,'share K error');
        }

        lpReturn = userInfo.lpAmount.sub(lpShared);
        (uint256 totalBxhReturn,) = bxhPool.pending(pid,address(this));
        bxhReturn = totalBxhReturn.mul(lpReturn).div(totalLP);

    }

    function withrawLPToken() public payable returns(uint256 lpReturn,uint256 bxhReturn){
        
        UserDelegateInfo storage userInfo = userDelegateInfos[msg.sender];
        require( userInfo.lpAmount > 0,'user lp token must large than 0');
        require( userInfo.lpAmount > userInfo.lpShared,'user lp token must large shared');
        
        (uint112 _reserve0, uint112 _reserve1,) = UniswapV2Pair(lpToken).getReserves(); // gas savings
        uint rootK = Math.sqrt(uint(_reserve0).mul(_reserve1));
        uint rootKLast = Math.sqrt(userInfo.kLast);
        if (rootK > rootKLast) {
            uint numerator = UniswapV2Pair(lpToken).totalSupply().mul(rootK.sub(rootKLast));
            uint denominator = rootK.mul(2).add(rootKLast);
            uint liquidity = numerator / denominator;
            // if (liquidity > 0) _mint(feeTo, liquidity);
            userInfo.lpShared = userInfo.lpShared.add(liquidity.add(liquidity));
            require(userInfo.lpShared < userInfo.lpAmount,'share K error');
        }

        lpReturn = userInfo.lpAmount.sub(userInfo.lpShared);

        // require( lpReturn<=UniswapV2Pair(lpToken).balanceOf(address(this)),'contract lp token must large than user lp token');
        
        uint256 beforeToken = IERC20(address(bxhPool.bxh())).balanceOf(address(this));
        bxhPool.withdraw(pid,userInfo.lpAmount);
        uint256 afterToken = IERC20(address(bxhPool.bxh())).balanceOf(address(this));

        bxhReturn  = afterToken.sub(beforeToken);
        
        totalLP = totalLP.sub(userInfo.lpAmount);

        userInfo.lpAmount = 0;
        userInfo.lpShared = 0;
        
        IUniswapV2Pair(lpToken).transfer(msg.sender, lpReturn); // send liquidity to pair
        IERC20(address(bxhPool.bxh())).transfer(msg.sender,bxhReturn);

    }
    

    function setEmergencyAddress(address _newAddress) public onlyOwner {
        require(_newAddress != address(0), "Is zero address");
        emergencyAddress = _newAddress;
    }
    function emergencyWithdraw(address _token) public onlyOwner {
        require(IERC20(_token).balanceOf(address(this)) > 0, "Insufficient contract balance");
        IERC20(_token).transfer(emergencyAddress, IERC20(_token).balanceOf(address(this)));
    }


}