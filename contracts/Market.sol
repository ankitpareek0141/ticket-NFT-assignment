// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

interface ITicketMinter {
    function getTicketPrice() external view returns(uint256);
}

contract Market is ERC721Holder, Ownable {

    struct Sale {
        address seller;
        uint256 price;
    }

    uint256 private constant PRECISION = 1000; // Decimal precision
    uint256 private constant MAX_PRICE_RATE = 100; // maximum price increase percentage, Eg :- 10%
    uint256 public organizerCommission; // Organizer commission for secondary market sales

    ERC20 private festToken; // ERC20 token contract
    ERC721 private minterContract; // ERC721 token contract

    mapping(uint256 => uint256) public lastPriceOfID; // Last sale price of every token
    mapping(uint256 => Sale) public idToSale; // Token ID to Sale structure

    event Listing(uint256 ticketID, address seller);
    event Purchase(uint256 ticketID, address buyer, address _seller);
    
    constructor(
        uint256 _organizerCommission,
        address _festToken,
        address _minterContract
    ) {
        require(
            _minterContract.code.length != 0,
            "Address should be a smart contract"
        );
        require(
            _organizerCommission <= 300,
            "Commission cannot be more than 30%"
        );

        organizerCommission = _organizerCommission;
        festToken = ERC20(_festToken);
        minterContract = ERC721(_minterContract);
    }

    /**
     * Owner can change the commission percentage with this function
     * but the percentage should not be greater than 30%
     * @param _newOrganizerCommission New organizer commission percentage
     */
    function setCommissionPercentage(uint256 _newOrganizerCommission) external onlyOwner {
        require(
            _newOrganizerCommission <= 300,
            "Commission cannot be more than 30%"
        );
        organizerCommission = _newOrganizerCommission;
    }

    /**
     * Seller can put their tickets on sale with this function and the 
     * selling price should not be more than 110% of the last selling price
     * @param _ticketID Id of the ticket
     * @param _price Selling price of the ticket
     */
    function listTicket(uint256 _ticketID, uint256 _price) external {
        address _seller = msg.sender;
        require(
            idToSale[_ticketID].seller == address(0),
            "Ticket already on sale!"
        );
        require(
            minterContract.ownerOf(_ticketID) == _seller,
            "Not an owner of this ticket!"
        );

        uint256 _lastSalePrice = lastPriceOfID[_ticketID] != 0 
            ? lastPriceOfID[_ticketID] 
            : ITicketMinter(address(minterContract)).getTicketPrice();

        require(
            _price <= (_lastSalePrice + ((_lastSalePrice * MAX_PRICE_RATE) / PRECISION)),
            "Price cannot be more than 110% of the last sale price!"
        );

        idToSale[_ticketID] = Sale(_seller, _price);

        minterContract.safeTransferFrom(_seller, address(this), _ticketID);

        emit Listing(_ticketID, _seller);
    }

    /**
     * Buyer can purchase the tickets from this function by 
     * paying the appropiate selling price of the ticket ID
     * @param _ticketID ID of the ticket
     */
    function purchaseTicket(uint256 _ticketID) external {
        address _buyer = msg.sender;
        Sale memory _sale = idToSale[_ticketID];
        
        require(
            _sale.seller != address(0),
            "Ticket ID not for sale!"
        );
        require(
            _sale.seller != _buyer, 
            "Seller cannot purchase!"
        );

        uint256 _organizerCommission = (_sale.price * organizerCommission) / PRECISION;
        uint256 _sellerAmount = _sale.price - _organizerCommission;
        
        lastPriceOfID[_ticketID] = _sale.price;

        delete idToSale[_ticketID];

        festToken.transferFrom(_buyer, owner(), _organizerCommission);
        festToken.transferFrom(_buyer, _sale.seller, _sellerAmount);

        minterContract.safeTransferFrom(address(this), _buyer, _ticketID);

        emit Purchase(_ticketID, _buyer, _sale.seller);
    }
}