pragma solidity ^0.4.23;

import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/token/StandardToken.sol";
import "./EtherOptions.sol";
import "./FakeStableCoin.sol";

contract ERC20Proxy is Ownable, StandardToken {
    
    using SafeMath for uint;

    string constant name = "EtherOptionProxy";
    string constant symbol = "PROX";
    uint8 constant decimals = 18;
   
    uint totalSupply;
    FakeStableCoin fsc;
    EtherOptions etherOptions;
    address fscAddr;
    address etherOptionsAddr;
    uint constant MAX = 2 ** 256 - 1;

    mapping (address => mapping (address => uint256)) allowed;
    mapping (address => uint) balances;
    
    event Payout(uint amount, address to);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Minted(address indexed to, uint256 value);

    constructor() public {}

    function setEtherOptionsAddr(address addr) public onlyOwner {
        etherOptions = EtherOptions(addr);
        etherOptionsAddr = addr;
    }

    function setFscAddr(address addr) public onlyOwner {
        fscAddr = addr;
        fsc = FakeStableCoin(addr);
    }

    function getEtherOptionsAddr() public view returns (address) {
        return etherOptionsAddr;
    }

    function getOwner() public view returns (address) {
        return owner;
    }
    
    function getBalance(address addr) public view returns (uint) {
        return balances[addr];
    }

    function deposit() public payable {
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        totalSupply = totalSupply.add(msg.value);
        emit Minted(msg.sender, msg.value);
    }

    function() public payable {
        deposit();
    }

    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount, "Insufficient funds available");
        balances[msg.sender] = balances[msg.sender].sub(amount);
        totalSupply = totalSupply.sub(amount);
        require(msg.sender.send(amount));

    }

    function payout(uint amount, address _to) public {
        require(msg.sender == etherOptionsAddr);
        uint amountInEther = amount * 10 ** 8;
        balances[_to] = balances[_to].add(amountInEther);
        totalSupply = totalSupply.add(amountInEther);
        emit Payout(amountInEther, _to);
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));

        uint256 _allowance = allowed[_from][msg.sender];

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = _allowance.sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    
}
