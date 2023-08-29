// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketMinter is ERC721, Ownable {

    uint256 public constant MAX_TICKETS = 1000;
    uint256 public ticketID;
    uint256 private ticketPrice;

    ERC20 private currencyToken;

    constructor(
        address _currencyToken,
        uint256 _ticketPrice
    ) ERC721("Fest Ticket", "TICKET") {
        currencyToken = ERC20(_currencyToken);
        ticketPrice = _ticketPrice;
    }

    function buyTicket() external {
        require(ticketID < MAX_TICKETS, "All tickets sold");
        require(currencyToken.transferFrom(msg.sender, owner(), ticketPrice), "Transfer failed");
        ticketID++;
        _mint(msg.sender, ticketID);
    } 

    function getTicketPrice() external view returns(uint256) {
        return ticketPrice;
    }
}
