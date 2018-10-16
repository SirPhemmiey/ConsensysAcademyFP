# Ether Options

Ether Options is a fully decentralized means of issuing ERC20 compliant base ether call options right on the Ethereum blockchain! 

An option contract is a type of financial derivative in which the holder maintains the option/choice to exercise a trade for an underlying asset for a given price at some point in the future. Options contracts take on two distinct types, calls and puts.  In order to keep this description brief, I will only discuss call options, specifically what are known as European vanilla calls, (what I will now refer to as "calls") as they are the only type relevant to the scope of this project.  Calls can be abstracted into three crucial parameters: The amount of the asset underlying, the strike price, and the time of expiration.  We can issue a call by locking up some asset (1 ether), setting a strike price (500 Stablecoin where 1 Stablecoin = 1 USD), and determining some time of expiration (7 days from today).  The price of the option varies along with the price of the underlying asset and the time until expiration.  Options, like other financial derivatives, allow the holder to take a leveraged position, making them useful in speculation and/or hedging hedging against risk.  

## Smart Contract Structure

The Ether Options Dapp is involves the invocation of three separate but interacting smart contracts. 

ERC20Proxy.sol is an ERC20 compliant ether token wrapper that allows users to deposit ether in exchange for an ERC20 "wrapped" ether.  This wrapped ether (WETH) allows users to invoke crucial ERC20 functionality (mainly the approve and transferFrom functions) that makes exchanging/moving ether in and out of smart contracts much easier and more secure.  Along with providing an ERC20 compliant form of ether, the proxy contract also handles secure storage of ether before call minting and after call execution.

FakeStableCoin.sol is an ERC20 compliant "stable" coin.  This contract is included purely for testing purposes.  For the sake of the final project testing/demonstration, we assume fakestablecoin is a de facto US dollar.  This contract will eventually be deprecated in favor of tether, makerDAI, or some other stable token solution.

EtherOptions.sol is another ERC20 compliant token.  When deployed to the mainnet, EtherOptions calls will be set to expire 50,000 blocks from the one in which the EtherOptions contract was deployed. (That's approximately 7 days with a 12 second block time on the mainnet).  For testing purposes, I set the expiration block to be 500 from deployment.  If you follow the instructions, your ganache testnet should be mining a new block every second.  That means your Ether options should be redeemable approximately 8.3 minutes from the moment you migrated.

### Prerequisites

I assume that each user has ganache-cli, truffle, and metamask installed correctly.  Ganache should be set to run a local development blockchain on port 8545.

### Compilation, Migration & Running EtherOptions

Since the ether options application involves a timed parameter, execution of the following steps in a swift fashion is crucial.  Before going any further, be sure to set metamask to connect to localhost:8545.  

Begin by opening two separate terminal windows.

Terminal 1:
Run the local development chain instance. Pass in -b 1 to set a one second block time.
```
ganache-cli -b 1
```
Alternatively you can set the block time to be half a second, in which case you have four minutes to execute the following steps.  If it is your first time testing the app, I'd suggest setting the block time to be one minute.

Copy the private key from the first index of ganache and import the account into metamask.

![screen shot 2018-08-28 at 12 33 06 am](https://user-images.githubusercontent.com/20116582/44703120-70293380-aa64-11e8-85cd-f947ade8952d.png)


Terminal 2:
Cd into the project directory
```
npm install
```
Compile the contracts using truffle

```
truffle compile
```
Migrate the contracts onto the local development chain
```
truffle migrate --reset
```
Run the lite server
```
npm run dev
```
The frontend can be accessed on http://localhost:3000

## Running the tests

Tests can be executed with truffle
```
truffle test
```

### Application Use

Information pertaining to Dapp state is tracked at the bottom of the page

![screen shot 2018-08-28 at 1 50 18 am](https://user-images.githubusercontent.com/20116582/44703215-cdbd8000-aa64-11e8-87c2-a0a9da18f823.png)

Begin by wrapping your ether

![screen shot 2018-08-28 at 12 40 05 am](https://user-images.githubusercontent.com/20116582/44704322-dfa12200-aa68-11e8-8377-806be2eb1ec2.png)

Once you've successfully wrapped your ether, you need to grant custodian access to the etherOptions smart contract

![screen shot 2018-08-28 at 12 40 33 am](https://user-images.githubusercontent.com/20116582/44704420-373f8d80-aa69-11e8-9d9e-5b3ff2c6d9b6.png)

Now that that's done, we can finally mint our ether calls.  Input the number of calls you want to mint and click "Mint Ether Calls".

![screen shot 2018-08-28 at 12 41 07 am](https://user-images.githubusercontent.com/20116582/44704473-68b85900-aa69-11e8-8174-68375ca9eb99.png)

Grant custodian access to some number of your stablecoins to the ether options smart contract.  Input should be in multiples of the 500 (the strike price) in order to avoid confusion.

![screen shot 2018-08-28 at 12 41 38 am](https://user-images.githubusercontent.com/20116582/44704560-be8d0100-aa69-11e8-8625-3a2ff8ed0716.png)

Finally, once the expiration block has passed, redeem your calls!

![screen shot 2018-08-28 at 2 25 51 am](https://user-images.githubusercontent.com/20116582/44704627-09a71400-aa6a-11e8-81b7-afd9de30dca3.png)

Currently, the application only handles minting and redeeming ether calls.  Future work will involve decentralized exchange functionality (I hope build an ether options exchange on top of the 0x protocol) and an ether options factory contract with which users can generate their own custom ERC20 options contracts.

Note: I did not have time to write the requisite 5 tests per contract.  
