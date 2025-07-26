const { task } = require("hardhat/config");

task("deploy", "Deploy a contract").setAction(async (taskArgs, hre) => {
    // 会自动去选择npx hardhat compile之后编辑的合约FundMe
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  console.log("🚀 ~ main ~ fundMeFactory:", "contract deploy start");

  const fundMe = await fundMeFactory.deploy(100); // lockTime
  await fundMe.waitForDeployment();
  console.log("FundMe deployed successfully:", fundMe.target);

  // verify fundme
  // 如果是部署在sepolia测试网络，并且有etherscan
  if (hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for 5 confirmations");
    await fundMe.deploymentTransaction().wait(5);

    await hre.run("verify:verify", {
      address: fundMe.target,
      constructorArguments: [100],
    });
  }
})

module.exports = {}