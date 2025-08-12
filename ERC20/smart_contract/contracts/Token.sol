// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import  "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20{
  constructor(uint256 initialSupply) ERC20("SaintCoin","STC"){
    // _mint 不消耗 ETH。
    // _mint 并不是用 ETH 铸造代币，而是直接在合约内部生成新的代币数量，把它们记到账户余额里
    // 合约所有者可以调用 _mint 函数铸造代币，向某个地址提供代币
    _mint(msg.sender, initialSupply);
  }
}