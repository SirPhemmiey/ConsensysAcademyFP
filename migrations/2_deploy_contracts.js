var tokenProxy = artifacts.require("./ERC20Proxy.sol");
var fakeStableCoin = artifacts.require("./FakeStableCoin.sol");
var etherOptions = artifacts.require("./EtherOptions.sol");

var proxy;

module.exports = function(deployer) {
    deployer.deploy(tokenProxy).then(function() {
        return deployer.deploy(fakeStableCoin).then(function() {
            return deployer.deploy(etherOptions, tokenProxy.address, fakeStableCoin.address, 500).then(async (accounts) => {
                proxy = await tokenProxy.deployed();
                await proxy.setEtherOptionsAddr(etherOptions.address);
                await proxy.setFscAddr(fakeStableCoin.address);
                })
            })
        })
};

