// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {MyToken} from './MyToken.sol';

contract WrapperMyToken is MyToken{
  constructor(string memory tokenName,string memory tokenSymbol) 
  MyToken(tokenName,tokenSymbol){}

  function mintTokenWithSpecificTokenId(address to,uint256 tokenId) public{
    _safeMint(to,tokenId);
  }
}