// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BXHDao is IERC20, Context {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public governance;

    address public depositToken;

    mapping(address => uint256) public lockBlocks;

    uint256 public lockTime;

    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    mapping(address => bool) public transferLimitTargets;
    bool public enableTranferLimit = true;

    bool public allowContract = false;

    bool public openWithdraw = false;

    constructor(
        string memory __name,
        uint256 _lockTime,
        address _depositToken,
        address _governance,
        address chef
    )public {
        governance = _governance;
        lockTime = _lockTime;
        depositToken = _depositToken;
        _name = __name;
        _symbol = __name;
        _decimals = ERC20(depositToken).decimals();

        enableTranferLimit = true;
        transferLimitTargets[chef] = true;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view  returns (uint8) {
        return _decimals;
    }

    modifier onlyHuman {
        if (!allowContract) {
            require(msg.sender == tx.origin);
            _;
        }
    }

    function setGovernance(address _governance) public {
        require(msg.sender == governance, "!governance");
        governance = _governance;
    }

     function setDepositToken(address _depositToken) public {
        require(msg.sender == governance, "!governance");
        depositToken = _depositToken;
    }

    function updateLockTime(uint256 _lt) public {
        require(msg.sender == governance, "!governance");
        require(_lt > 0);
        lockTime = _lt;
    }

    function toggleTransferLimit(bool _e) public {
        require(msg.sender == governance, "!governance");
        enableTranferLimit = _e;
    }

    function toggleOpenWithdraw(bool _e) public {
        require(msg.sender == governance, "!governance");
        openWithdraw = _e;
    }

    function toggleAllowContract(bool _b) public {
        require(msg.sender == governance, "!governance");
        allowContract = _b;
    }


    function addLimitTarget(address _a) public {
        require(msg.sender == governance, "!governance");
        transferLimitTargets[_a] = true;
    }

    function removeLimitTarget(address _a) public {
        require(msg.sender == governance, "!governance");
        transferLimitTargets[_a] = false;
    }

    function deposit(uint256 _amount) public onlyHuman {
        require(_amount > 0);
        uint256 _before = IERC20(depositToken).balanceOf(address(this));
        IERC20(depositToken).safeTransferFrom(msg.sender, address(this), _amount);
        uint256 _after = IERC20(depositToken).balanceOf(address(this));
        _amount = _after.sub(_before);
        uint256 shares = _amount;

        uint256 oldAmt = balanceOf(msg.sender);
        if (oldAmt == 0) {
            lockBlocks[msg.sender] = block.number.add(lockTime);
        } else {
            uint256 expireBlock = lockBlocks[msg.sender];
            uint256 totalAmt = oldAmt.add(_amount);
            uint256 newAmtShare = _amount.mul(lockTime);
            if (expireBlock > block.number) {
                // (oldAmt * (expireBlock - block.number) + newAmt * lockTime) / (oldAmt + newAmt)
                uint256 deltaBlocks = expireBlock.sub(block.number);
                uint256 avgLockTime =
                    oldAmt.mul(deltaBlocks).add(newAmtShare).div(totalAmt);
                lockBlocks[msg.sender] = block.number.add(avgLockTime);
            } else {
                // newAmt * lockTime / (oldAmt + newAmt)
                uint256 avgLockTime = newAmtShare.div(totalAmt);
                lockBlocks[msg.sender] = block.number.add(avgLockTime);
            }
        }

        _mint(msg.sender, shares);
    }

    function withdrawAll() external onlyHuman {
        withdraw(balanceOf(msg.sender));
    }

    function withdraw(uint256 _shares) public onlyHuman {
        require(_shares > 0);
        if (!openWithdraw) {
            require(lockBlocks[msg.sender] < block.number);
        }
        uint256 r = _shares;
        _burn(msg.sender, _shares);

        IERC20(depositToken).safeTransfer(msg.sender, r);
    }

    function canWithdraw(address user) public view returns (bool) {
        if (openWithdraw) {
            return true;
        }
        return block.number >= lockBlocks[user];
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(
            sender,
            _msgSender(),
            _allowances[sender][_msgSender()].sub(
                amount,
                "ERC20: transfer amount exceeds allowance"
            )
        );
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].add(addedValue)
        );
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].sub(
                subtractedValue,
                "ERC20: decreased allowance below zero"
            )
        );
        return true;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        if (enableTranferLimit) {
            require(transferLimitTargets[sender]|| transferLimitTargets[recipient], "limit transfer targets");
        }

        _balances[sender] = _balances[sender].sub(
            amount,
            "ERC20: transfer amount exceeds balance"
        );
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: burn from the zero address");

        _balances[account] = _balances[account].sub(
            amount,
            "ERC20: burn amount exceeds balance"
        );
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _burnFrom(address account, uint256 amount) internal {
        _burn(account, amount);
        _approve(
            account,
            _msgSender(),
            _allowances[account][_msgSender()].sub(
                amount,
                "ERC20: burn amount exceeds allowance"
            )
        );
    }
}