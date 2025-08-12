// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Owner 手里有 10,000 瓶矿泉水（USDT），当初可能 2 元一瓶进的货，现在 3 元一瓶卖出去，合约就是他的“自动售货机”。

contract DEX {
  IERC20 public associatedToken;

  uint price;
  address public owner;

  // associatedToken 绑定你要卖的 ERC20 代币合约地址，每种 ERC20 代币都有自己的合约地址
  // price 绑定你卖的价格
  constructor(IERC20 _token,uint _price){
    associatedToken = _token;
    price = _price;
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only owner can call this function");
    _;
  }

  function sell() external onlyOwner {
    // 合约可以帮他花费的最大额度，用户的钱此时还在他自己钱包里
    // 授权能花费他钱包里的代币，并把多少token显示出来
    uint allowance = associatedToken.allowance(msg.sender, address(this));
    // 检查 msg.sender 对 address(this) 的 allowance 是否足够。
    // 如果足够，从 msg.sender 的余额里扣除 allowance 数量的代币。
    // 把这些代币转到 address(this)（合约地址），同时减少 allowance 的剩余额度。
    require(allowance > 0,"you must allow this contract to at least 1 token");
    bool sent = associatedToken.transferFrom(msg.sender, address(this), allowance);
    require(sent, "Failed to transfer tokens");
  }

  // 提现合约里的代币
  function withdrawlToken() external onlyOwner() {
    uint balance = getTokenBalance();
    associatedToken.transfer(msg.sender, balance);
  }

  // 提现合约里的钱ETH
  // Owner (发起交易) → 区块链网络 (EVM执行)
  //   → onlyOwner 检查通过
  //       → 读取合约余额
  //       → .call{} 转账给 Owner
  //           → 交易打包成功
  //               → ETH 到 Owner 钱包
  function withdrawFunds() external onlyOwner() {
    (bool sent,) = payable(msg.sender).call{value:address(this).balance}("");
    require(sent, "Failed to transfer funds");
  }

  // 以上是部署者(合约所有者)可以调用的函数，所有者会将自己在ERC20合约地址里的代币(USDT、BNB等)上架到合约，同时所有者可以提现自己合约中的代币或ETH
  // 以下是买家可以调用的函数，买家可以购买代币，需要支付ETH，并指定购买数量

  // 获取最终token对应的价格
  function getPrice(uint numberToken) public view returns(uint){
    return numberToken * price;
  } 

  // 获取合约里代币的数量
  function getTokenBalance() public view returns(uint256){
    return associatedToken.balanceOf(address(this));
  }

  // 其他用户购买代币，需要支付ETH，并指定购买数量
  function buy(uint numberToken) external payable{
    // 检查合约里是否有足够的代币
    require(numberToken <= getTokenBalance(),"Not enough tokens in the contract");
    // 获取最终token对应的价格
    uint priceForToken = getPrice(numberToken);
    // 检查用户是否支付了足够的钱
    // 交易附带 msg.value ETH，这些 ETH 会存进合约地址，合约所有者需要withdrwa这些eth
    require(msg.value == priceForToken,"Not enough funds");
    // 将代币转账给用户
    associatedToken.transfer(msg.sender, numberToken);
  }
}