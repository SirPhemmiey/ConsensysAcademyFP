pragma solidity ^0.4.23;

import "../installed_contracts/zeppelin/contracts/token/StandardToken.sol";
import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "./FakeStableCoin.sol";
import "./ERC20Proxy.sol";

contract EtherOptions is StandardToken, Ownable {
    
    string constant name = "EtherOption";
    string constant symbol = "EOPT";
    uint8 constant decimals = 0;
    
    uint expirationBlock;
    uint strikePrice;
    
    FakeStableCoin fakeStableCoin;
    ERC20Proxy erc20proxy;
    address proxy;
    address fsc;

    event EoptMinted(address to, uint amount);

    constructor(address _proxy, address _fakeStableCoin, uint _strikePrice) public {
        totalSupply = 0;
        proxy = _proxy;
        fsc = _fakeStableCoin;
        strikePrice = _strikePrice;
        fakeStableCoin = FakeStableCoin(_fakeStableCoin);
        erc20proxy = ERC20Proxy(_proxy);
        expirationBlock = now + 500;
    }

    function getProxyAddr() public view returns (address) {
        return proxy;
    }

    function getStableCoinAddr() public view returns (address) {
        return fsc;
    }

    function getBalance(address addr) public view returns (uint) {
        return balances[addr];
    }

    function getExpirationBlock() public view returns (uint) {
        return expirationBlock;
    }

    function generateOptions(uint amount) public onlyOwner returns (bool) {
        require(now < expirationBlock, "Issuance for this type has closed");
        require(amount > 1 ether && amount % 1 ether == 0, "Options must be denominated in integer amounts of ether, i.e. 1, 2, 3");
        require(erc20proxy.transferFrom(owner, this, amount), "Approve the correct amount before invoking generateOptions");
        totalSupply = totalSupply.add(amount);
        balances[owner] = balances[owner].add(amount);
        emit EoptMinted(owner, amount);
        return true;
    }


    function redeemOption(uint _amount) public returns (bool success) {
        require(now >= expirationBlock, "Contract not redeemable yet");
        require(_amount % strikePrice == 0, "Amount must be multiple of strikePrice");
        require(fakeStableCoin.transferFrom(msg.sender, this, _amount));
        totalSupply = totalSupply.sub(_amount);
        erc20proxy.payout(_amount/strikePrice, msg.sender);
        return success;
    }

    function closeUnredeemed() public onlyOwner {
        require(now >= expirationBlock + 2000);
        erc20proxy.payout(totalSupply, owner);
    }
}

