var addrStack   = artifacts.require("./addrStack.sol");
var entropy     = artifacts.require("./entropy.sol");
var vitalikDICE = artifacts.require("./vitalikDICE.sol");
var safeMath    = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
    deployer.deploy(addrStack);
    deployer.deploy(safeMath);
    deployer.deploy(entropy);
    deployer.link(safeMath, vitalikDICE);
    deployer.link(addrStack, vitalikDICE);
    deployer.link(entropy, vitalikDICE);

    deployer.deploy(vitalikDICE);
};
