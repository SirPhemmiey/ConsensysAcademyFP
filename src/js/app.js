var eoptAddress;
var proxyAddress;
var fscAddress;

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  proxyBalance: 10,
  eoptBalance: 10,
  fscBalance: 10,
  eoptAllowed: 0,
  

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initFSC();
  },

  initFSC: function() {
    $.getJSON("FakeStableCoin.json", function(fakeStableCoin) {
      App.contracts.FakeStableCoin = TruffleContract(fakeStableCoin);
      App.contracts.FakeStableCoin.setProvider(App.web3Provider);
      App.contracts.FakeStableCoin.deployed().then(function(fakeStableCoin) {
        console.log("FakeStableCoin Address:", fakeStableCoin.address);
        fscAddress = fakeStableCoin.address;
        return App.initProxy();
      });
    });
  },

  initProxy: function() {
    $.getJSON("ERC20Proxy.json", function(erc20Proxy) {
      App.contracts.ERC20Proxy = TruffleContract(erc20Proxy);
      App.contracts.ERC20Proxy.setProvider(App.web3Provider);
      App.contracts.ERC20Proxy.deployed().then(function (erc20Proxy) {
        console.log("ERC20Proxy Address:", erc20Proxy.address);
        proxyAddress = erc20Proxy.address;
        return App.initEopt();
      });
    });
  },

  initEopt: function() {
    $.getJSON("EtherOptions.json", function(etherOptions) {
      App.contracts.EtherOptions = TruffleContract(etherOptions);
      App.contracts.EtherOptions.setProvider(App.web3Provider);
      App.contracts.EtherOptions.deployed().then(function(etherOptions) {
        console.log("EtherOptions Address:", etherOptions.address);
        eoptAddress = etherOptions.address;
        App.listenForFscApproval();
        App.listenForEoptMint();
        App.listenForWethApprove();
        App.listenForFscTransfer();
        App.listenForProxyEvents();
        return App.render();
      });
    })
  },

  listenForFscApproval: function() {
    App.contracts.FakeStableCoin.deployed().then(function(instance) {
      instance.Approval({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("FSC approval event triggered", event);
      })
    })
  },

  listenForFscTransfer: function() {
    App.contracts.FakeStableCoin.deployed().then(function(instance) {
      instance.Transfer(
        {}, {
        fromBlock: 0,
        toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("FSC transfer event triggered", event);
          return App.render();
        })
    })
  },

  listenForProxyEvents: function() {
    App.contracts.ERC20Proxy.deployed().then(function(instance) {
      instance.Minted({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("WETH mint event triggered", event);
        return App.render();
      })
    })
  },

  listenForWethApprove: function() {
    App.contracts.ERC20Proxy.deployed().then(function(instance) {
      instance.Approval({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("WETH approval event triggered", event);
        return App.render();
      })
    })
  },

  listenForEoptMint: function() {
    App.contracts.EtherOptions.deployed().then(function(instance) {
      instance.EoptMinted({}, {
        fromBlock:0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("New ether calls minted", event);
        return App.render();
      })
    })
  },

  render: async () => {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $("#account-address").html("Account: " + account);
      }
    })

    App.contracts.ERC20Proxy.deployed().then(function(instance) {
      proxyInstance = instance;
      return proxyInstance.getBalance(App.account);
    }).then(function(balance){
      balanceInEth = web3.fromWei(balance, "ether");
      App.proxyBalance = balanceInEth;
      $('.weth-balance').html("WETH Balance: " + balanceInEth);
    })

    App.contracts.EtherOptions.deployed().then(function(instance) {
      eoptInstance = instance;
      return eoptInstance.getBalance(App.account);
    }).then(function(balance) {
      eoptBalance = web3.fromWei(balance, 'ether');
      $('.eopt-balance').html("Ether Options Balance: " + eoptBalance);
    })

    App.contracts.FakeStableCoin.deployed().then(function(instance) {
      fscInstance = instance;
      return fscInstance.getBalance(App.account);
    }).then(function(result) {
      App.fscBalance = result.toNumber();
      $('.fsc-balance').html("Stablecoin Balance: " + App.fscBalance);
    })

    App.contracts.FakeStableCoin.deployed().then(function(instance) {
      return instance.allowance(App.account, eoptAddress);
    }).then(function(allowed) {
      $('.fsc-approval').html("EtherOptions Stablecoin Allowance: " + allowed);
    })

    App.contracts.ERC20Proxy.deployed().then(function(instance) {
      proxyInstance = instance;
      return proxyInstance.allowance(App.account, eoptAddress);
    }).then(function(allowed) {
      App.eoptAllowed = allowed.toNumber();
      eoptAllowed = web3.fromWei(allowed, 'ether');
      $('.eopt-allowance').html("EtherOptions WETH Allowance: " + eoptAllowed)
    })

    
  },

  mintWeth: function() {
    var amount = $('#numberOfWeth').val();
    var ethAmount = web3.toWei(amount, 'ether');
    App.contracts.ERC20Proxy.deployed().then(function(instance) {
      return instance.deposit({
        from: App.account,
        value: ethAmount,
        gas: 800000
      });
    }).then(function(result) {
      console.log("WETH minted")
    })
  },

  approveWethTransfer: function() {
    var amount = $('#numberToApprove').val();
    var ethAmount = web3.toWei(amount, 'ether');
    var addr = eoptAddress;
    App.contracts.ERC20Proxy.deployed().then(function(instance) {
      return instance.approve(addr, ethAmount, {
        from: App.account,
        gas: 50000
      });
    })
  },

  generateOptions: function() {
    var amount = $('#numberToMint').val();
    var ethAmount = web3.toWei(amount, 'ether');
    App.contracts.EtherOptions.deployed().then(function(instance) {
      return instance.generateOptions(ethAmount, {
        from: App.account,
        gas: 500000
      });
    })
  },
  
  approveFsc: function() {
    var amount = $('#fscToApprove').val();
    var addr = eoptAddress;
    App.contracts.FakeStableCoin.deployed().then(function(instance) {
      return instance.approve(addr, amount, {
        from: App.account,
        gas: 50000
      });
    })
  },

  redeemOptions: function() {
    var amount = $('#fscToTransfer').val();
    App.contracts.EtherOptions.deployed().then(function(instance) {
      return instance.redeemOption(amount, {
        from: App.account,
        gas: 500000
      });
    })
  }
}


$(function() {
  $(window).load(function() {
    App.init();
  })
});
