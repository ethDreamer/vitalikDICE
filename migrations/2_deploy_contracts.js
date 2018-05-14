var addrStack   = artifacts.require("./addrStack.sol");
var entropy     = artifacts.require("./entropy.sol");
var vitalikDice = artifacts.require("./vitalikDice.sol");
var safeMath    = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(addrStack);
  deployer.deploy(safeMath);
  deployer.deploy(entropy);
  deployer.link(safeMath, vitalikDice);
  deployer.link(addrStack, vitalikDice);
  deployer.link(entropy, vitalikDice);

  deployer.deploy(vitalikDice);
};
