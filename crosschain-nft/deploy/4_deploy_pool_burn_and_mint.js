const { ethers } = require("hardhat");

module.exports = async ({ getNamesAccount, deployments }) => {
  const { firstAccount } = await getNamesAccount();
  const { deploy, log } = deployments;

  log("deploying");

  const ccipSimulatorDepolyment = await deployments.get("CCIPLocalSimulator");
  const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDepolyment);
  const ccipConfig = await ccipSimulator.configuration();
  const destChainRouter = ccipConfig._destinationRouter;
  const linkToken = ccipConfig._linkToken;

  const wnftTx = await deployments.get("WrapperMyToken");
  wnftAddr = wnftTx.address;

  await deploy("NTFPoolBurnAndMint", {
    contract: "NTFPoolBurnAndMint",
    from: firstAccount,
    log: true,
    arg: [destChainRouter, linkToken, wnftAddr],
  });

  log("deploy success");
};

module.exports.tags = ["destChain", "all"];
