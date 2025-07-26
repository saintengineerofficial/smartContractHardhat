const { ethers } = require("hardhat");

async function main() {
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

  // init 2 accounts
  const [firstAccount, secondAccount] = await ethers.getSigners();
  // fund contract with first account
  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.01") });
  await fundTx.wait();
  console.log("Funded contract with first account");

  // check balance of contract
  const balance = await ethers.provider.getBalance(fundMe.target);
  console.log("🚀 ~ main ~ balance:", balance);

  // fund contract with second account
  // 默认查询的是第一个账户，所以需要使用connect来切换账户
  const fundTxSec = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.01") });
  await fundTxSec.wait();
  // check balance of contract
  const balanceSec = await ethers.provider.getBalance(fundMe.target);
  console.log("🚀 ~ main ~ balanceSec:", balanceSec);
  // check mapping fundersToAmount
  const firstFunderToAmount = await fundMe.fundersToAmount(firstAccount.address);
  const secondFunderToAmount = await fundMe.fundersToAmount(secondAccount.address);
  console.log("🚀 ~ main ~ firstFunderToAmount:", firstFunderToAmount);
  console.log("🚀 ~ main ~ secondFunderToAmount:", secondFunderToAmount);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
