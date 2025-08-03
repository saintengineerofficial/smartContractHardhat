module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy, log } = deployments;

  log("deploying ....");
  await deploy("CCIPLocalSimulator", {
    contract: "CCIPLocalSimulator",
    from: firstAccount,
    log: true,
    args: [],
  });
  log("deploy success");
};

module.exports.tags = ["test", "all"];
