const { expect } = require("chai");

describe("DEX", () => {
  let tokenSupply = "100";
  let token;
  let dex;
  let price = "100";
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);

    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(token.address, price);
  });

  describe("Sell", () => {
    it("should sell fail if contract is not approved", async () => {
      await expect(dex.sell()).to.be.reverted;
    });

    it("should allow dex to transfer tokens", async () => {
      // addr1 授权 dex 合约花费转移他的代币
      await token.connect(addr1).approve(dex.address, 100);
    });

    it("should not allow dex non-owner to sell", async () => {
      await expect(dex.connect(addr1).sell()).to.be.reverted;
    });

    it("sell should transfer tokens from owner to contract", async () => {
      // owner 的代币余额减少了 100，合约地址的余额增加了 100。
      // 传入的参数是 token 合约地址，owner 地址，合约地址，减少的代币数量，增加的代币数量
      await expect(dex.sell()).to.changeTokenBalances(token, [owner.address, dex.address], [-100, 100]);
    });
  });
  describe("Getters", () => {});
  describe("Buy", () => {});
  describe("Withdraw tokens", () => {});
  describe("Withdraw funds", () => {});
});
