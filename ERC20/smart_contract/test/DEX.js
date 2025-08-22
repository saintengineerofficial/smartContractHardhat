const { expect } = require("chai");

describe("DEX", () => {
  let tokenSupply = 100;
  let token;
  let dex;
  let price = 100;
  let owner;
  let addr1;
  let addr2;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();

    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(tokenAddress, price); // 传入price，单个代币的价格
    await dex.waitForDeployment();
  });

  describe("Sell", () => {
    it("should sell fail if contract is not approved", async () => {
      await expect(dex.sell()).to.be.reverted;
    });

    it("should allow dex to transfer tokens", async () => {
      const dexAddr = await dex.getAddress();
      // addr1 授权 dex 合约花费转移他的代币
      await token.connect(addr1).approve(dexAddr, 100);
    });

    it("should not allow dex non-owner to sell", async () => {
      await expect(dex.connect(addr1).sell()).to.be.reverted;
    });

    // owner把代币卖给合约
    it("sell should transfer tokens from owner to contract", async () => {
      const dexAddr = await dex.getAddress();
      await token.connect(owner).approve(dexAddr, 100);
      // owner 的代币余额减少了 100，合约地址的余额增加了 100。
      // 传入的参数是 token 合约地址，owner 地址，合约地址，减少的代币数量，增加的代币数量
      await expect(dex.sell()).to.changeTokenBalances(token, [owner.address, dexAddr], [-100, 100]);
    });
  });
  describe("Getters", () => {
    it("should get current token balance", async () => {
      expect(await dex.getTokenBalance()).to.equal(100);
    });

    it("should get current token price", async () => {
      expect(await dex.getPrice(10)).to.equal(price * 10);
    });
  });

  describe("Buy", () => {
    it("User can buy token", async () => {
      const dexAddr = await dex.getAddress();
      await expect(dex.connect(addr1).buy(10, { value: 1000 })).to.changeTokenBalances(token, [dexAddr, addr1.address], [-10, 10]);
    });
    it("User cannot buy invalid number of token", async () => {
      await expect(dex.connect(addr1).buy(91, { value: 91 })).to.be.reverted;
    });
    it("User cannot buy invalid amount of ether", async () => {
      await expect(dex.connect(addr1).buy(10, { value: 900 })).to.be.reverted;
    });
  });

  describe("Withdraw tokens", () => {
    it("Non-Owner cannot withdraw token", async () => {
      await expect(dex.connect(addr1).withdrawToken()).to.be.reverted;
    });
    it("Owner can withdraw token", async () => {
      const dexAddr = await dex.getAddress();
      await expect(dex.withdrawToken()).to.changeTokenBalances(token, [owner.address, dexAddr], [90, -90]);
    });
  });
  describe("Withdraw funds", () => {
    it("Non-Owner cannot withdraw funds", async () => {
      await expect(dex.connect(addr1).withdrawFunds()).to.be.reverted;
    });
    it("Owner can withdraw funds", async () => {
      const dexAddr = await dex.getAddress();
      await expect(dex.withdrawFunds()).to.changeEtherBalances([owner.address, dexAddr], [1000, -1000]);
    });
  });
});
