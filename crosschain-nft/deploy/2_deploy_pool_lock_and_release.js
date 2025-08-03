const { ethers } = require("hardhat");

module.exports = async ({ getNamesAccount, deployments }) => {
  const { firstAccount } = await getNamesAccount();
  const { deploy, log } = deployments;

  log("deploying");

  const ccipSimulatorDepolyment = await deployments.get("CCIPLocalSimulator");
  const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDepolyment);
  const ccipConfig = await ccipSimulator.configuration();
  const sourceChainRouter = ccipConfig._sourceRoute;
  const linkToken = ccipConfig._linkToken;

  const nftTx = await deployments.get("MyToken");
  nftAddr = nftTx.address;

  await deploy("NTFPoolLockAndRelease", {
    contract: "NTFPoolLockAndRelease",
    from: firstAccount,
    log: true,
    arg: [sourceChainRouter, linkToken, nftAddr],
  });

  log("deploy success");
};

module.exports.tags = ["sourceChain", "all"];
