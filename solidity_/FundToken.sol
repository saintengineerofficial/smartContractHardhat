// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// | 场景   | 举例                                 |
// | ---- | ---------------------------------- |
// | 奖励用户 | 用户参与某个任务 → 给他 100 个 FundToken      |
// | 众筹积分 | 用户出资 ETH → 你发给他等值 FundToken        |
// | 项目治理 | 用 FundToken 代表投票权重                 |
// | 生态货币 | 在 DApp 内使用 FundToken 作为“消耗品”或“优惠券” |

// 是一个简单的 ERC20-like 通证（Token）发行与转账合约。也就是你自己定义的一个代币系统
// 这类通证可以用于模拟积分系统、众筹返还、项目内奖励等场景。
// 通政合约
contract FundToken{
    // 1.通证的名字
    // 2. 通证的简称
    // 3. 通证的发行数量
    // 4. owner地址
    // 5. balance address => uint256

    string public tokenName;
    string public tokenSymbol;
    uint256 public totalSupply;
    address public owner;
    mapping(address => uint256) public balances;

    constructor(string memory _tokenName,string memory _tokenSymbol){
        tokenName = _tokenName;
        _tokenSymbol = _tokenSymbol;
        owner = msg.sender;
    }

    // mint获取通证
    function mint(uint256 amountToMint) public {
        balances[msg.sender] = balances[msg.sender] +amountToMint;
        totalSupply+=amountToMint;
    }
    // transfer通证
    function transfer(address payee,uint256 amount) public {
        require(balances[msg.sender] >= amount,'');
        balances[msg.sender] -= amount;
        balances[payee] += amount;
    }

    // 查某一个地址的通证数量
    function balanceof(address addr) public view returns(uint256) {
        return balances[addr];
    }
}

// ERC20: Fungible Token 通用通政，可以拆分
// OpenZeppelin的ERC20
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol

// ERC721: NFT - Non-Fungible Token 和上面相反，通镇不一样，不可以拆分