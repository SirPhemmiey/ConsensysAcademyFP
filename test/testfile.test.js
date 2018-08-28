var FakeStableCoin = artifacts.require("./FakeStableCoin.sol");
var EtherOptions = artifacts.require("./EtherOptions.sol");
var ERC20Proxy = artifacts.require("./ERC20Proxy.sol");



contract("FakeStableCoin", async (accounts) => {
    it("Should put 100000000 fsc in the first account", async () => {
        let instance = await FakeStableCoin.deployed();
        let balance = await instance.getBalance(accounts[0]);
        assert.equal(balance.valueOf(), 100000000);
        })

    it("Should send tokens correctly", function() {
        var fsc;

        var acct1 = accounts[0];
        var acct2 = accounts[1];

        var acct1Start;
        var acct2Start;
        var acct1End;
        var acct2End;

        var amount = 1000;

        return FakeStableCoin.deployed().then(function(instance) {
            fsc = instance;
            return fsc.getBalance.call(acct1);
        }).then(function(balance) {
            acct1Start = balance.toNumber();
            return fsc.getBalance.call(acct2);
        }).then(function(balance) {
            acct2Start = balance.toNumber();
            return fsc.transfer(acct2, amount, {from: acct1});
        }).then(function() {
            return fsc.getBalance.call(acct1);
        }).then(function(balance) {
            acct1End = balance.toNumber();
            return fsc.getBalance.call(acct2);
        }).then(function(balance) {
            acct2End = balance.toNumber();

            assert.equal(acct1Start - amount, acct1End, "Amount wasn't correctly taken from sender");
            assert.equal(acct2Start + amount, acct2End, "Amount wasn't correctly transferred to recipient");
        });
    });

});

contract("ERC20Proxy", async (accounts) => {
    it('Should store the correct EtherOptions address', async () => {
        let eopt = await EtherOptions.deployed();
        let proxy = await ERC20Proxy.deployed();
        let eoptAddr = await proxy.getEtherOptionsAddr.call();
        
        assert.equal(eoptAddr, eopt.address);
    }) 

    it('Should accept ether and adjust balances accordingly', async () => {
        let amount = 10;
        let proxy  = await ERC20Proxy.deployed();
        await proxy.send(amount, {from: accounts[0]});
        let balance = await proxy.getBalance.call(accounts[0]);
        assert.equal(balance, amount);
    })


    it('Should approve the etherOptions contract', async () => {
        let amount = 10;
        let proxy = await ERC20Proxy.deployed();
        let eopt = await EtherOptions.deployed();
        await proxy.approve.call(eopt.address, amount, {from: accounts[0]});
        let approved = await proxy.allowance.call(accounts[0], eopt.address);
        assert.equal(approved.toNumber(), amount);

    })


});

contract("EtherOptions", async (accounts) => {
    it('Should store the correct proxy and stablecoin addresses', async () => {
        let fsc = await FakeStableCoin.deployed();
        let proxy = await ERC20Proxy.deployed();
        let eopt = await EtherOptions.deployed();
        let fscAddr = await eopt.getStableCoinAddr.call();
        let proxyAddr = await eopt.getProxyAddr.call();

        assert.equal(fsc.address, fscAddr);
        assert.equal(proxy.address, proxyAddr);

    })

    it("Should have set the block expiration correctly", async (accounts) => {
        let eopt = await EtherOptions.deployed();
        let expirationBlock = eopt.getExpirationBlockNum.call();

        assert(expirationBlock, 10000);

    })
});