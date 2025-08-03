module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("deploying ....");
  await deploy("MyToken", {
    contract: "MyToken",
    from: firstAccount,
    log: true,
    args: ["MyToken", "MT"],
  });
  log("deploy success");
};

module.exports.tags = ["sourceChain", "all"];
