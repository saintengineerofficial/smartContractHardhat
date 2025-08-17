const { expect } = require("chai");
const { ethers } = require("hardhat");

const TOKEN_NAME = "TokenMaster";
const TOKEN_SYMBOL = "TM";

const OCCASION_NAME = "Occasion 1";
const OCCASION_COST = ethers.utils.parseUnits("1", "ether");
const OCCASION_MAX_TICKETS = 100;
const OCCASION_DATE = "2025-01-01";
const OCCASION_TIME = "10:00";
const OCCASION_LOCATION = "Location 1";

describe("TokenMaster", () => {
  let tokenMaster;
  let deployer, buyer;

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    const TokenMaster = await ethers.getContractFactory("TokenMaster");
    tokenMaster = await TokenMaster.deploy(TOKEN_NAME, TOKEN_SYMBOL);

    const transaction = await tokenMaster
      .connect(deployer)
      .list(
        OCCASION_NAME,
        OCCASION_COST,
        OCCASION_MAX_TICKETS,
        OCCASION_DATE,
        OCCASION_TIME,
        OCCASION_LOCATION
      );

    await transaction.wait();
  });

  describe("Deployment", () => {
    it("Set the contract name", async () => {
      expect(await tokenMaster.name()).to.equal(TOKEN_NAME);
    });

    it("Set the contract symbol", async () => {
      expect(await tokenMaster.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Set the owner", async () => {
      expect(await tokenMaster.owner()).to.equal(deployer.address);
    });
  });

  describe("Occasion", () => {
    it("should update the totalOccasion", async () => {
      expect(await tokenMaster.totalOccasions()).to.equal(1);
    });

    it("should return the occasion attr", async () => {
      const occasion = await tokenMaster.getOccasion(1);
      expect(occasion.id).to.equal(1);
      expect(occasion.name).to.equal(OCCASION_NAME);
      expect(occasion.cost).to.equal(OCCASION_COST);
      expect(occasion.tickets).to.equal(OCCASION_MAX_TICKETS);
      expect(occasion.maxTickets).to.equal(OCCASION_MAX_TICKETS);
      expect(occasion.date).to.equal(OCCASION_DATE);
    });
  });

  describe("Mint", () => {
    const ID = 1;
    const SEAT_ID = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");

    beforeEach(async () => {
      const transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT_ID, { value: AMOUNT });

      await transaction.wait();
    });

    it("should update the occasion tickets count", async () => {
      const occasion = await tokenMaster.getOccasion(ID);
      expect(occasion.tickets).to.equal(OCCASION_MAX_TICKETS - 1);
    });

    it("should update the status of the seat", async () => {
      const isBought = await tokenMaster.hasBought(ID, buyer.address);
      expect(isBought).to.equal(true);
    });

    it("should update the seatTaken", async () => {
      const addr = await tokenMaster.seatTaken(ID, SEAT_ID);
      expect(addr).to.equal(buyer.address);
    });

    it("should get the seatsTaken", async () => {
      const seats = await tokenMaster.getSeatsTaken(ID);
      expect(seats.length).to.equal(1);
      expect(seats[0]).to.equal(SEAT_ID);
    });

    it("update the contract balance", async () => {
      const balance = await ethers.provider.getBalance(tokenMaster.address);
      expect(balance).to.equal(AMOUNT);
    });
  });

  describe("Withdraw", () => {
    const ID = 1;
    const SEAT_ID = 50;
    const AMOUNT = ethers.utils.parseUnits("1", "ether");
    let balanceBefore;

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address);

      let transaction = await tokenMaster
        .connect(buyer)
        .mint(ID, SEAT_ID, { value: AMOUNT });
      await transaction.wait();

      transaction = await tokenMaster.connect(deployer).withdrawFunds();
      await transaction.wait();
    });

    it("should update the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("should update the contract balance", async () => {
      const balance = await ethers.provider.getBalance(tokenMaster.address);
      expect(balance).to.equal(0);
    });
  });
});
