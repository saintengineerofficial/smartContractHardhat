const { getNamedAccounts, ethers } = require("hardhat");
const { expect } = require("chai");
// sourceChain => destChain
// test if user can mint a nft from nft contract
// test if user can lock the nft in the pool and send ccip message on source chain
// test if user can get a wrapped nft in the destination chain

// destChain => sourceChain
// test if user can burn the wnft and send ccip message on dest chain
// test if user have unlocked the nft on the source chain
// 终端执行npx hardhat test

let firstAccount;
let nft;
let wnft;
let poolLnU;
let poolMnB;
let ccipLocalSimulator;
let chainSelector;

before(async function () {
  firstAccount = await getNamedAccounts();
  await deployments.fixture(["all"]);

  nft = await ethers.getContractAt("MyToken", firstAccount);
  poolLnU = await ethers.getContractAt("NTFPoolLockAndRelease", firstAccount);
  wnft = await ethers.getContractAt("WrapperMyToken", firstAccount);
  poolMnB = await ethers.getContractAt("NTFPoolBurnAndMint", firstAccount);
  ccipLocalSimulator = await ethers.getContractAt("CCIPLocalSimulator", firstAccount);
  chainSelector = (await ccipLocalSimulator.configuration()).chainSelector_;
});

describe("sourceChain => destChain", async function () {
  it("test if user can mint a nft from nft contract", async function () {
    await nft.safeMint(firstAccount);

    // nft.ownerOf(0) 是在调用 NFT 合约中的函数 ownerOf(uint256 tokenId)，它的含义是：
    // 查询 tokenId 为 0 的 NFT 当前属于谁。
    const owner = await nft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });

  it("test if user can lock the nft in the pool and send ccip message on source chain", async function () {
    // 发点钱，从而可以锁定，从模拟器水龙头领 10 LINK 代币
    await ccipLocalSimulator.requestLinkFromFaucet(poolLnU.target, ethers.parseEther("10"));

    // 授权 NFT 合约的 tokenId = 0（id为0的数字资产） 被 poolLnU.target 合约转走。
    await nft.approve(poolLnU.target, 0);

    await nft.lockAndSendNFT(0, firstAccount, chainSelector, poolMnB.target);
    const owner = await nft.ownerOf(0);
    // 最后断言 tokenId = 0 的 NFT 现在属于 poolLnU.target，说明已经被成功锁定。
    expect(owner).to.equal(poolLnU.target);
  });

  it("test if user can get a wrapped nft in the destination chain", async function () {
    const owner = await wnft.ownerOf(0);
    expect(owner).to.equal(firstAccount);
  });
});

describe("test if the nft can be burned and transferred back to sourcechain", async function () {
  it("wnft can be burned", async function () {
    // fund some Link tokens
    ccipLocalSimulator.requestLinkFromFaucet(poolMnB.target, ethers.parseEther("10"));

    // grant permission
    await wnft.approve(poolMnB.target, 0);

    // transfer the token
    await poolMnB.burnAndMint(0, firstAccount, chainSelector, poolLnU.target);
    // 被burn掉之后，nft数量为0了
    const wnftTotalSupply = await wnft.totalSupply();
    expect(wnftTotalSupply).to.equal(0);
  });
  it("owner of the NFT is transferred to firstAccount", async function () {
    const newOwner = await nft.ownerOf(0);
    expect(newOwner).to.equal(firstAccount);
  });
});
