const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy("100");

  const Dex = await hre.ethers.getContractFactory("DEX");
  const dex = await Dex.deploy(token.address, 100);

  await token.deployed();
  await dex.deployed();

  await writeDeploymentInfo(token, "token.json");
  await writeDeploymentInfo(dex, "dex.json");
}

async function writeDeploymentInfo(contract, filename = "") {
  const data = {
    network: hre.network.name,
    contract: {
      address: contract.address,
      signerAddress: await contract.signer.getAddress(), // 获取签名者的地址
      abi: contract.interface.format("json"),
    },
  };
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(filename, content, { encoding: "utf-8" });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
