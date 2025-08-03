module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("deploying ....");
  await deploy("WrapperMyToken", {
    contract: "WrapperMyToken",
    from: firstAccount,
    log: true,
    args: ["WrapperMyToken", "WMT"],
  });
  log("deploy success");
};

module.exports.tags = ["destchain", "all"];
