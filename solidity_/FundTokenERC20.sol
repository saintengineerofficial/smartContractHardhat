// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FundMe} from "./FundMe.sol";
// FundMe
// 1.让FundMe的参与者，基于 mapping 来领取相应数量的通证 
// 2.让FundMe的参与者，transfer 通证
// 3.在使用完成以后，需要burn 通证

contract FundTokenERC20 is ERC20{
    FundMe fundMe;
    // 初始化传入必要值
    constructor(address fundMeAddr) ERC20("FundTokenERC20",'FT') {
        fundMe = FundMe(fundMeAddr);
    }

    // 前提（先充值一定的钱到合约了，在通过合约里的钱换取通证
    // 领取通证，对应的eth减少，类似充值游戏币??
    function mint(uint256 amountToMint) public {
        // 确保
        require(fundMe.fundersToAmount(msg.sender) >= amountToMint,"You cannot mint this many tokens");
        require(fundMe.getFundSuccess(),"The fundme is not completed yet"); // 虽然是变量，内部会加上getter函数，需要函数写法
        _mint(msg.sender,amountToMint);
        fundMe.setFunderToAmount(msg.sender,fundMe.fundersToAmount(msg.sender) - amountToMint);
    }

    // 将用过的通证销毁
    function claim(uint256 amountToClaim) public {
        require(balanceOf(msg.sender) >= amountToClaim,"You dont have enough ERC20 tokens");
        require(fundMe.getFundSuccess(),"The fundme is not completed yet"); // 虽然是变量，内部会加上getter函数，需要函数写法
        _burn(msg.sender,amountToClaim);
    }
}