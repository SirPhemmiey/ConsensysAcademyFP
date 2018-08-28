pragma solidity ^0.4.23;

import "../installed_contracts/zeppelin/contracts/token/StandardToken.sol";
import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "./FakeStableCoin.sol";
import "./ERC20Proxy.sol";

/**
 * @title EtherOptions
 * @author Matt Czernik <matt.czernik@gmail.com>
 */

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
    /**
     * @notice current iteration of the contract is for testing purposes only
     * @notice expiration block set to 500 for ease of use
     * @param _proxy address of the erc20proxy contract
     * @param _fakeStableCoin address of the stablecoin contract to be in use
     * @param _strikePrice the amount of stablecoin needed to execute an expired call
     * @dev future iterations of this contract will involve more modularity
     */
    constructor(address _proxy, address _fakeStableCoin, uint _strikePrice) public {
        totalSupply = 0;
        proxy = _proxy;
        fsc = _fakeStableCoin;
        strikePrice = _strikePrice;
        fakeStableCoin = FakeStableCoin(_fakeStableCoin);
        erc20proxy = ERC20Proxy(_proxy);
        expirationBlock = now + 500;
    }
    // Returns the erc20proxy address (for testing)
    function getProxyAddr() public view returns (address) {
        return proxy;
    }
    // Returns the Stablecoin address (for testing)
    function getStableCoinAddr() public view returns (address) {
        return fsc;
    }
    // Returns number of calls held by a given address
    function getBalance(address addr) public view returns (uint) {
        return balances[addr];
    }
    // Returns expiration block (for testing)
    function getExpirationBlock() public view returns (uint) {
        return expirationBlock;
    }
    /**
     * @notice mints new ether options given WETH
     * @param amount number of WETH to be converted into call options
     */
    function generateOptions(uint amount) public onlyOwner returns (bool) {
        require(now < expirationBlock, "Issuance for this type has closed");
        require(amount > 1 ether && amount % 1 ether == 0, "Options must be denominated in integer amounts of ether, i.e. 1, 2, 3");
        require(erc20proxy.transferFrom(owner, this, amount), "Approve the correct amount before invoking generateOptions");
        totalSupply = totalSupply.add(amount);
        balances[owner] = balances[owner].add(amount);
        emit EoptMinted(owner, amount);
        return true;
    }

    /**
     * @notice redeems owned contracts after expiration block
     * @param _amount the amount of options to be redeemed
     */
    function redeemOption(uint _amount) public returns (bool success) {
        require(now >= expirationBlock, "Contract not redeemable yet");
        require(balances[msg.sender] >= _amount, "Not enough calls owned");
        require(_amount % strikePrice == 0, "Amount must be multiple of strikePrice");
        require(fakeStableCoin.transferFrom(msg.sender, this, _amount));
        totalSupply = totalSupply.sub(_amount);
        erc20proxy.payout(_amount/strikePrice, msg.sender);
        return success;
    }
    /**
     * @notice Allows the owner of the contract to close all unredeemed positions
     * @dev allows owner to collect any would-be frozen ether
     */
    function closeUnredeemed() public onlyOwner {
        require(now >= expirationBlock + 2000);
        erc20proxy.payout(totalSupply, owner);
    }
}

