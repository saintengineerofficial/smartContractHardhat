// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// abstract抽象类，意味着virtual函数可以被重写
abstract contract Parent{
    uint256 public a;
    function addOne() public  {
        a++;
    }

    function addCustom() public virtual {
        a = a +2;
    }
}

// is 是继承合约
// override重写
contract Child is Parent{
    function addCustom() public override{
        a = a+3;
    }
}