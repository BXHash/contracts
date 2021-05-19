// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StarMaking is Ownable,ReentrancyGuard{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _caller;

    IERC20 public BXH;
    uint8 public constant TOPNUM = 3;

    // vote for project 
    struct ProjectVotes{
        uint256     voteAmount; //bxh amount 
        uint256     addressCount;// user address count
        uint256     createdBlockNumber;// created log when add to phase
    }
    

    struct Phase{
        uint256     blockStart; // 
        uint256     blockEnd;
        uint256     blockLocked;//when to release vote coin. 14 days = 403200
        uint256     totalVoteAmount; // total vote 
        uint256     totalAddrCount;//total address
        uint256     totalWithdrawAmount;// total amount for withdraw
        bool        stopped; // is stops?
    }

    address public emergencyAddress;
    
    mapping(uint=>Phase)  public phases; //id to phase, id like 20210411, 20210405...

    mapping(uint=>mapping(address=>ProjectVotes))  public projectVotes; // (phaseid =>( project address ==> project vote )) voting logs;

    mapping(address=>mapping(uint256=>mapping(address=>uint256))) public userPhaseProjectVotes; // (useraddr ==> (phaseid ==> project==>vote amount)) voting amount for user in projects;

    mapping(address=>mapping(uint256=>uint256)) public userPhaseVotes; // (useraddr ==> (phaseid ==> vote amount)) voting amount for user;
    mapping(address=>mapping(uint256=>bool)) public userPhaseWithdrawed;// (useraddr ==> (phaseid ==> vote amount)) withdraw flag for user;

    mapping(uint => address[]) public phaseProjectList; //(phaseid ==> project address list) project list for phase


    constructor (address _emergencyAddress,address _bxh) public {
        emergencyAddress = _emergencyAddress;
        BXH = IERC20(_bxh);

    }

    //manager interface
    function setEmergencyAddress(address _newAddress) public onlyOwner {
        require(_newAddress != address(0), "Is zero address");
        emergencyAddress = _newAddress;
        addCaller(msg.sender);
    }

    function addCaller(address _newCaller) public onlyOwner returns (bool) {
        require(_newCaller != address(0), "NewCaller is the zero address");
        return EnumerableSet.add(_caller, _newCaller);
    }

    function delCaller(address _delCaller) public onlyOwner returns (bool) {
        require(_delCaller != address(0), "DelCaller is the zero address");
        return EnumerableSet.remove(_caller, _delCaller);
    }

    function getCallerLength() public view returns (uint256) {
        return EnumerableSet.length(_caller);
    }

    function isCaller(address _call) public view returns (bool) {
        return EnumerableSet.contains(_caller, _call);
    }

    function getCaller(uint256 _index) public view returns (address){
        require(_index <= getCallerLength() - 1, "index out of bounds");
        return EnumerableSet.at(_caller, _index);
    }

    modifier onlyCaller() {
        require(isCaller(msg.sender), "Not the caller");
        _;
    }

    function emergencyWithdraw(address _token) public onlyOwner {
        require(IERC20(_token).balanceOf(address(this)) > 0, "Insufficient contract balance");
        IERC20(_token).transfer(emergencyAddress, IERC20(_token).balanceOf(address(this)));
    }



    // add phase with parameters;
    function addPhase(uint _phaseId,uint256  _blockStart,uint256  _blockEnd,uint _blockLocked) public onlyCaller{
        require(_blockStart > block.number,"cannot add phase before current blocknumber");
        require(_blockEnd > _blockStart,"block end should be larged than block start");
        require(phases[_phaseId].blockStart == 0,"phase id exists");
        if(_blockLocked==0){
            _blockLocked = _blockEnd+403200;
        }
        phases[_phaseId] = Phase({blockStart:_blockStart,blockEnd:_blockEnd,blockLocked:_blockLocked,totalVoteAmount:0,totalAddrCount:0,totalWithdrawAmount:0,stopped:false});
    }


    // add phase project , can call multiply times before vote start 
    function addPhaseProjects(uint _phaseId,address[] memory addrs) public onlyCaller{
        require(phases[_phaseId].blockStart > 0, "phase not found");
        require(phases[_phaseId].blockStart > block.number, "phase already started");
        require(addrs.length> 0,"project none");
        uint length = addrs.length;
        uint blocknumber = block.number;
        for(uint i=0;i<length;i++){
            address addr = addrs[i];
            if(projectVotes[_phaseId][addr].createdBlockNumber == 0){
                projectVotes[_phaseId][addr] = ProjectVotes({
                    voteAmount: 0,
                    addressCount: 0,
                    createdBlockNumber:blocknumber});
                phaseProjectList[_phaseId].push(addr);
            }
            

        }
    }

    // for emergencyAddress stoped
    function setPhaseStop(uint _phaseId,bool stopped) public onlyCaller{
        require(phases[_phaseId].blockStart>0, "phase not found");
        phases[_phaseId].stopped = stopped;
    }


    // user vote project with bxh amount 
    function userVoteProject(uint _phaseId,address _projectAddr,uint256 amount) payable public returns (uint256){
        require(phases[_phaseId].blockStart <= block.number, "phase not start");
        require(phases[_phaseId].blockEnd >= block.number, "phase ended");
        require(!phases[_phaseId].stopped,"phase stopped");

        require(projectVotes[_phaseId][_projectAddr].createdBlockNumber > 0,"project not found in this phase");
        // require(amount>=1e18,"vote amount should large than 1");
        
        BXH.safeTransferFrom(msg.sender,address(this),amount);
        if(userPhaseVotes[msg.sender][_phaseId]==0){
            phases[_phaseId].totalAddrCount = phases[_phaseId].totalAddrCount.add(1);
            projectVotes[_phaseId][_projectAddr].addressCount = projectVotes[_phaseId][_projectAddr].addressCount.add(1);
        }
        phases[_phaseId].totalVoteAmount = phases[_phaseId].totalVoteAmount.add(amount);
        userPhaseVotes[msg.sender][_phaseId] = userPhaseVotes[msg.sender][_phaseId].add(amount);
        userPhaseProjectVotes[msg.sender][_phaseId][_projectAddr]  = userPhaseProjectVotes[msg.sender][_phaseId][_projectAddr].add(amount);
        projectVotes[_phaseId][_projectAddr].voteAmount = projectVotes[_phaseId][_projectAddr].voteAmount.add(amount);

        
        return phases[_phaseId].totalVoteAmount;
    }
     

    function projectCount(uint _phaseId) public view returns (uint256){
        return phaseProjectList[_phaseId].length;
    } 

     function projectVoteInfo(uint _phaseId,uint _sortedIdx) public view returns (address addr,uint256 voteAmount){
        addr = phaseProjectList[_phaseId][_sortedIdx];
        voteAmount = projectVotes[_phaseId][addr].voteAmount;
    } 


    //user withraw vote amount after phase end and lock time .
    function userWithdraw(uint _phaseId) nonReentrant public returns (uint256){
        require(phases[_phaseId].blockLocked > 0 && phases[_phaseId].blockLocked <= block.number, "phase withdraw locked");
        require(!userPhaseWithdrawed[msg.sender][_phaseId],"user already withdraw");
        require(!phases[_phaseId].stopped,"phase stopped");

        uint256 amount = userPhaseVotes[msg.sender][_phaseId];
        require(phases[_phaseId].totalWithdrawAmount.add(amount)<=phases[_phaseId].totalVoteAmount,"phase withdraw exceed max vote Amount");
        userPhaseWithdrawed[msg.sender][_phaseId] = true;
        phases[_phaseId].totalWithdrawAmount = phases[_phaseId].totalWithdrawAmount.add(amount);
        BXH.transfer(msg.sender,amount);
        return amount;
    }


   




    

}