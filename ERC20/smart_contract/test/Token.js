const { expect } = require("chai");

describe("Token", () => {
  let tokenSupply = "100";
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);
  });

  describe("Deployment", () => {
    it("should set total supply of token to the owner", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      // totalSupply 是 ERC20 合约中的一个 view 函数
      const totalSupply = await token.totalSupply();

      expect(totalSupply).to.equal(ownerBalance);
    });
  });

  describe("Transation", () => {
    it("should transfer token between accounts", async () => {
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("should transfer token between accounts", async () => {
      await expect(token.connect(addr1).transfer(addr2.address, 51)).to.be.reverted;
    });
  });
});
