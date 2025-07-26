const { task } = require("hardhat/config");

task('interact', 'Interact with a contract')
  .addParam('addr', 'The address of the contract')
  .setAction(async (taskArgs, hre) => { 
  // 获取合约,创建工厂
  const fundMeFactory = await ethers.getContractFactory('FundMe')
  // 直接获取之前deploy的合约，传入地址
  const fundMe = fundMeFactory.attch(taskArgs.addr)
    
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
})


module.exports = {}