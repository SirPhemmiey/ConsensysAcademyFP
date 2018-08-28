pragma solidity ^0.4.23;

import "../installed_contracts/zeppelin/contracts/ownership/Ownable.sol";
import "../installed_contracts/zeppelin/contracts/token/StandardToken.sol";

contract FakeStableCoin is Ownable, StandardToken {

    string constant name = "Fake Stable Coin";
    string constant symbol = "FSC";
    uint constant decimals = 18;

    mapping (address => uint) balances;
    uint totalSupply = 100000000000;
    event Transfer(address from, address to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);


    constructor() public {
        balances[owner] = 100000000;
        emit Transfer(0x0, owner, 100000000);
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function getBalance(address addr) public view returns (uint) {
        return balances[addr];
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