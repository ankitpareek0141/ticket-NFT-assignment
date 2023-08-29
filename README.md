# Ticket NFT
This is the Ticket NFT smart contracts for distributing tickets for an 
event through Blochchain technology so, the organizer sets the price of 
the tickets and users can able to buy those ticket and they get the tickets 
in the NFT form and only maximum of 1000 Tickets will be sold from the 
organizer and then they will circulate in the secondary market.

The users can also further sell their tickets in the secondary market 
at different prices so that anyone can able to buy that tickets from 
there instead from the organizer. 

The organizer can also set the commission for monitizing so that when 
someone make a trade for the ticket the organizer gets some amount in 
the form of commission.

## Smart contracts flow
There are basically 3 smart contracts which will handle the buy and selling
of tickets between the organizer and the users so, below are the details of 
each smart contracts.

### 1. ERC20 Token smart contract (FESTToken.sol)
This is payout token for buying the tickets from the organizer or from the market. 
This implement the basic ERC20 token standard protocols which includes function like 
'transfer', 'transferFrom', 'approve', etc. so the user should have sufficient amount 
of FEST token for purchasing tickets.

### 2. Ticket Minter smart contract (TicketMinter.sol)
The TicketMinter designed to  facilitate the creation, management, and exchange 
of event tickets on the blockchain. This contract is implemented in Solidity and 
operates on the Ethereum blockchain. It inherits from the ERC721 token standard, 
making it compatible with various decentralized applications and wallets.

### Features

**- Ticket Minting:** The contract allows the creation and minting of event tickets 
as ERC721 tokens. Each ticket is represented by a unique token ID.

**- Limited Supply:** The contract supports up to a maximum of 1000 tickets. Once 
this limit is reached, no more tickets can be minted.

**- Ticket Price:** Tickets can be purchased using an ERC20 token. The ticket price 
is set when deploying the contract.

**- Currency Token:** The contract is configured to accept a specific ERC20 token as 
payment for tickets.

### Functions

**- constructor(address _currencyToken, uint256 _ticketPrice):** The constructor initializes 
the contract, setting the accepted currency token address and the ticket price.

**- buyTicket() external:** Allows users to buy tickets by transferring the specified 
ticket price in the accepted ERC20 currency. Each successful purchase mints a new ticket 
token to the buyer.

**- getTicketPrice() external view returns(uint256):** Returns the current ticket price.


### 3. Market smart contract (Market.sol)
The Ticket Market smart contract is a decentralized marketplace designed to enable 
the buying and selling of event tickets on the blockchain. This Solidity contract 
operates on the Ethereum blockchain, providing a secure and transparent platform for 
secondary market trading of event tickets.

### Features

**- Ticket Listing:** Sellers can list their event tickets on the marketplace with 
a specified selling price. The listed price must not exceed 110% of the last sale 
price to prevent excessive price hikes.

**- Ticket Purchase:** Buyers can purchase listed tickets by paying the selling price 
set by the seller. The contract handles the transfer of tokens between the buyer, seller, 
and the contract owner.

**- Organizer Commission:** The contract allows the contract owner to set an organizer
commission percentage (up to 30%). A portion of the selling price is transferred to the 
contract owner as commission upon successful purchase.

### Functions

**- constructor(uint256 _organizerCommission, address _festToken, address _minterContract):** 
The constructor initializes the contract with the specified organizer commission, 
the address of the ERC20 token used for payment, and the address of the ERC721 
ticket minter contract.

**- setCommissionPercentage(uint256 _newOrganizerCommission) external onlyOwner:** Allows the contract owner to update the organizer commission percentage.

**- listTicket(uint256 _ticketID, uint256 _price) external:** Sellers can list their tickets
for sale with a specified price, provided it does not exceed the allowed price increase limit.

**- purchaseTicket(uint256 _ticketID) external:** Buyers can purchase tickets from the 
marketplace by paying the selling price. The contract ensures that the correct amounts 
are transferred to the seller, contract owner (for commission), and buyer.


## How to run ?
Now below are the steps of how you can run & test smart contrats on your local machine.
Open you terminal and follow the steps below,

### Running the hardhat test cases  

1. Clone the repository 
```shell
git clone https://github.com/ankitpareek0141/ticket-NFT-assignment.git
```

2. Install the dependencies
```shell
npm install 
   or
npm i
```

3. Run the test cases file with this command
```shell
npx hardhat test
```
Then you'll see test cases results one by one on your console wheather the test cases indicating passed or failed. 

### Deploying the contracts on test network  

1. Compile the smart contracts, just for creating the artifacts file.
```shell
npx hardhat compile
```

3. To deploy the smart contracts on local hardhat environment
```shell
npx hardhat run scripts/deploy.js
```
Then you'll see the addresses on the console once all the contracts are deployed.

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
