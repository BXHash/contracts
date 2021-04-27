// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import './interfaces/IBXH.sol';
import './uniswapv2/libraries/TransferHelper.sol';

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract RaiseDAO is ReentrancyGuard,Ownable {
  using SafeMath for uint256;
  using SafeERC20 for ERC20;

  // Info of each user.
  struct UserInfo {
      uint256 amount;   // How many tokens the user has provided.
      bool claimed;  // default false
      uint256   offeringTokenAmount;//how many tokens the user can be offered;
      uint256   amountDept;//tokens already withdraw by users;
      uint256   refundingTokenAmount;//how many tokens the user will be refund;
      bool   refundClaimed;
  }

  // admin address
  address public adminAddress;
  // The raising token
  address public lpToken;
  // The offering token
  address public offeringToken;
  // The block number when IFO starts
  uint256 public startBlock;
  // The block number when IFO ends
  uint256 public endBlock;

  // The block number when final withdraw ends
  uint256 public finalWithdrawBlock;
  

  // total amount of raising tokens need to be raised
  uint256 public raisingAmount;
  // total amount of offeringToken that will offer
  uint256 public offeringAmount;
  // total amount of raising tokens that have already raised
  uint256 public totalAmount;
  // address => amount
  mapping (address => UserInfo) public userInfo;
  // participators
  address[] public addressList;
  uint256 public lastUpdateBlock;

  struct ReleasePeroid{
    uint256  startBlock;
    uint256  endBlock;
    uint256  releasePerBlock;
    uint256  releaseAmount;
    uint256  lastTotalAmount;
  }


  ReleasePeroid []public releasePeroids;
  uint256  public totalAmountReleased;
  uint256  public currentReleaseIdx;

  event Deposit(address indexed user, uint256 amount);
  event HarvestRefund(address indexed user, uint256 excessAmount);
  event HarvestOffer(address indexed user, uint256 offerAmount);

  constructor() public {
  }

  function initialize(
      address _lpToken,
      address _offeringToken,
      uint256 _startBlock,
      uint256 _endBlock,
      uint256 _finalWithdrawBlock,
      uint256 _offeringAmount,
      uint256 _raisingAmount
  ) public onlyOwner {
      lpToken = _lpToken;
      offeringToken = _offeringToken;
      startBlock = _startBlock;
      endBlock = _endBlock;
      finalWithdrawBlock = _finalWithdrawBlock;
      offeringAmount = _offeringAmount;
      raisingAmount= _raisingAmount;
      totalAmount = 0;
  }

  function setFinalWithdrawBlock(uint256 _finalWithdrawBlock) public onlyOwner{
    finalWithdrawBlock = _finalWithdrawBlock;
  }

  function setOfferingToken(address _offeringToken) public onlyOwner{
    offeringToken = _offeringToken;
  }

  function addReleasePeroid(uint256 _startBlock,uint256 _endBlock,uint256 _releaseAmount) public onlyOwner {
    require (block.number < startBlock, 'offering already begin');

    uint256  _releasePerBlock = _releaseAmount.div(_endBlock.sub(_startBlock));
    uint256  _lastTotalAmount = 0;
    if(releasePeroids.length>0){
      _lastTotalAmount = releasePeroids[releasePeroids.length-1].lastTotalAmount.add(releasePeroids[releasePeroids.length-1].releaseAmount);
    }
    require(_lastTotalAmount.add(_releaseAmount)<=offeringAmount,"total release amount exceed limit");

    releasePeroids.push(ReleasePeroid(_startBlock,_endBlock,_releasePerBlock,_releaseAmount,_lastTotalAmount));
  }

  function getReleaseLength() public view returns (uint256){
    return releasePeroids.length;
  }

  function getReleaseInfo(uint256 pid) public view returns(uint256 _startBlock,uint256 _endBlock,uint256 _releasePerBlock,uint256 _releaseAmount,uint256 _lastTotalAmount){
    if(pid<releasePeroids.length)
    {
      ReleasePeroid storage rp = releasePeroids[pid];
      _startBlock = rp.startBlock;
      _endBlock = rp.endBlock;
      _releasePerBlock = rp.releasePerBlock;
      _releaseAmount = rp.releaseAmount;
      _lastTotalAmount = rp.lastTotalAmount;
    }
  }

  function setOfferingAmount(uint256 _offerAmount) public onlyOwner {
    require (block.number < startBlock, 'no');
    offeringAmount = _offerAmount;
  }

  function updateRelease() public {
      if (block.number < endBlock){
        return;
      }
      if(block.number==lastUpdateBlock){
        return;
      }
      (uint256 _releaseAmountUpdated,uint256 _releaseIdUpdate )= getReleaseUpdate(block.number);
      totalAmountReleased = _releaseAmountUpdated;
      currentReleaseIdx = _releaseIdUpdate;
      lastUpdateBlock = block.number;
  }


  function getReleaseUpdate(uint256 blockNumber) public view returns(uint256 _releaseAmountUpdated,uint256 _releaseIdUpdate){
      _releaseAmountUpdated = totalAmountReleased;
      _releaseIdUpdate = currentReleaseIdx;
      
      if(blockNumber >= endBlock && _releaseAmountUpdated < offeringAmount){
          uint256 peroidIndexBound = releasePeroids.length - 1;
          ReleasePeroid storage p = releasePeroids[_releaseIdUpdate];
          while(blockNumber > p.endBlock && _releaseIdUpdate < peroidIndexBound){
              _releaseIdUpdate = _releaseIdUpdate.add(1);
              p = releasePeroids[_releaseIdUpdate];
          }
          if(blockNumber >= p.endBlock){
              _releaseAmountUpdated = offeringAmount;
          }else if(blockNumber>p.startBlock){
              _releaseAmountUpdated = p.lastTotalAmount.add(blockNumber.sub(p.startBlock).mul(p.releasePerBlock));
              if(_releaseAmountUpdated>offeringAmount){
                _releaseAmountUpdated = offeringAmount;
              }
          }else{
            _releaseAmountUpdated = p.lastTotalAmount;
          }
      }
  }

  

  function setRaisingAmount(uint256 _raisingAmount) public onlyOwner {
    require (block.number < startBlock, 'no');
    raisingAmount = _raisingAmount;
  }

  function deposit(uint256 _amount) public {
    require (block.number > startBlock && block.number < endBlock, 'not ifo time');
    require (_amount > 0, 'need _amount > 0');
    
    TransferHelper.safeTransferFrom(lpToken,msg.sender, address(this), _amount); // send liquidity to pair

    if (userInfo[msg.sender].amount == 0) {
      addressList.push(address(msg.sender));
    }
    userInfo[msg.sender].amount = userInfo[msg.sender].amount.add(_amount);
    totalAmount = totalAmount.add(_amount);
    emit Deposit(msg.sender, _amount);
  }

  function getUserCurrentRlease(address addr) public view returns(uint256) {
    require (block.number > endBlock, 'not harvest time');
    UserInfo storage user = userInfo[addr];
    if(user.amount==0){
      return 0;
    }else{
      return user.offeringTokenAmount.mul(totalAmountReleased).div(offeringAmount).sub(user.amountDept);
    }
    
  }

  function getCurrentRlease(uint256 amount) public view returns(uint256) {
    require (block.number > endBlock, 'not harvest time');
    return amount.mul(totalAmountReleased).div(offeringAmount);
  }
  

  function harvest() public nonReentrant {
    require (block.number > endBlock, 'not harvest time');
    require (userInfo[msg.sender].amount > 0, 'have you participated?');
    UserInfo storage user = userInfo[msg.sender];
    if(!user.claimed){
      uint256 offeringTokenAmount = getOfferingAmount(msg.sender);
      uint256 refundingTokenAmount = getRefundingAmount(msg.sender);
      user.offeringTokenAmount = offeringTokenAmount;
      user.refundingTokenAmount = refundingTokenAmount;
      user.claimed = true;
    }

    if(!user.refundClaimed){
      uint256 refundingTokenAmount= user.refundingTokenAmount;
      if (refundingTokenAmount > 0 && block.number >= finalWithdrawBlock) {
        user.refundClaimed = true;
        // lpToken.safeTransfer(address(msg.sender), refundingTokenAmount);
        TransferHelper.safeTransfer(lpToken, address(msg.sender), refundingTokenAmount);
        emit HarvestRefund(msg.sender, refundingTokenAmount);
      }
    }


    //calc release
    updateRelease();
    uint256  currentAmount = user.offeringTokenAmount.mul(totalAmountReleased).div(offeringAmount).sub(user.amountDept);
    if(currentAmount>0){
      user.amountDept = user.amountDept.add(currentAmount);
      TransferHelper.safeTransfer(offeringToken, address(msg.sender), currentAmount); 
      emit HarvestOffer(msg.sender, currentAmount);
    }

  }

  function harvestV(address userAddr) public view returns (uint256 offeringTokenAmount,uint256 currentAmount,uint256 refundingTokenAmount) 
  {
     return harvestVWhen(block.number,userAddr);
  }

  function harvestVWhen( uint256 blocknumber,address userAddr) public view returns (uint256 offeringTokenAmount,uint256 currentAmount,uint256 refundingTokenAmount) {
    require (blocknumber > endBlock, 'not harvest time');
    
    UserInfo storage user = userInfo[userAddr];
    require (user.amount > 0, 'have you participated?');
    if(!user.claimed){
      offeringTokenAmount = getOfferingAmount(userAddr);
      refundingTokenAmount = getRefundingAmount(userAddr);
    }else{
      offeringTokenAmount = 0;
      refundingTokenAmount = 0;
    }
    //calc release
    currentAmount = user.offeringTokenAmount.mul(totalAmountReleased).div(offeringAmount).sub(user.amountDept);
  }

  function hasHarvest(address _user) external view returns(bool) {
      return userInfo[_user].claimed;
  }

  // allocation 100000 means 0.1(10%), 1 meanss 0.000001(0.0001%), 1000000 means 1(100%)
  function getUserAllocation(address _user) public view returns(uint256) {
    return userInfo[_user].amount.mul(1e12).div(totalAmount).div(1e6);
  }

  // get the amount of IFO token you will get
  function getOfferingAmount(address _user) public view returns(uint256) {
    if (totalAmount > raisingAmount) {
      uint256 allocation = getUserAllocation(_user);
      return offeringAmount.mul(allocation).div(1e6);
    }
    else {
      // userInfo[_user] / (raisingAmount / offeringAmount)
      return userInfo[_user].amount.mul(offeringAmount).div(raisingAmount);
    }
  }

  // get the amount of lp token you will be refunded
  function getRefundingAmount(address _user) public view returns(uint256) {
    if (totalAmount <= raisingAmount) {
      return 0;
    }
    uint256 allocation = getUserAllocation(_user);
    uint256 payAmount = raisingAmount.mul(allocation).div(1e6);
    return userInfo[_user].amount.sub(payAmount);
  }

  function getAddressListLength() external view returns(uint256) {
    return addressList.length;
  }

  function finalWithdraw(uint256 _lpAmount, uint256 _offerAmount) public onlyOwner {
    require (_lpAmount <= ERC20(lpToken).balanceOf(address(this)), 'not enough token 0');
    require (_offerAmount <= ERC20(offeringToken).balanceOf(address(this)), 'not enough token 1');
    
    // lpToken.safeTransfer(address(msg.sender), _lpAmount);
    TransferHelper.safeTransfer(lpToken, address(msg.sender), _lpAmount);
    // offeringToken.safeTransfer(address(msg.sender), _offerAmount);
    TransferHelper.safeTransfer(offeringToken, address(msg.sender), _offerAmount);
  }

}

