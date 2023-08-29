const {
    time,
    loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');
const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Ticket NFT', function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.

    async function deployContractsFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, ...otherAccount] = await ethers.getSigners();

        const ticketPriceInWei = ethers.parseUnits('1', 'ether');

        const festToken = await ethers.deployContract('FESTToken');
        await festToken.waitForDeployment();
        const festTokenAddress = await festToken.getAddress();

        const ticketMinter = await ethers.deployContract("TicketMinter", [
          festTokenAddress,
          ticketPriceInWei.toString()
        ]);
        await ticketMinter.waitForDeployment();
        const tokenMinterAddress = await ticketMinter.getAddress();

        const market = await ethers.deployContract('Market', [
            '50',
            festTokenAddress,
            tokenMinterAddress,
        ]);
        await market.waitForDeployment();

        const weiAmount = ethers.parseUnits("100", "ether");

        let txn = await festToken.transfer(
            otherAccount[1].address,
            weiAmount
        );
        await txn.wait();

        txn = await festToken.transfer(
            otherAccount[2].address,
            weiAmount
        );
        await txn.wait();

        txn = await festToken.transfer(
            otherAccount[3].address,
            weiAmount
        );
        await txn.wait();

        return { festToken, ticketMinter, market, owner, otherAccount };
    }

    async function buyingTicketFixture(accountIndex) {
      const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(
        deployContractsFixture
      );

      const ticketPrice = await ticketMinter.getTicketPrice();

      await festToken.connect(otherAccount[1]).approve(await ticketMinter.getAddress(), ticketPrice.toString());
      
      await ticketMinter.connect(otherAccount[1]).buyTicket();

      await ticketMinter.connect(otherAccount[1]).approve(await market.getAddress(), 1);

      return { festToken, ticketMinter, market, owner, otherAccount };
    }

    describe('Deployment', function () {
        it('Should deploy the FESTToken with initial supply', async function () {
            const { festToken, ...args } = await loadFixture(
                deployContractsFixture
            );

            expect(await festToken.totalSupply()).to.equal(
                ethers.parseUnits('1000000', 'ether')
            );
        });

          it("Should deploy the TicketMinter with zero total supply", async function () {
            const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(
              deployContractsFixture
            );

            expect(await ticketMinter.ticketID()).to.equal(
                "0"
            );
          });

          it("Should deploy the Market contract with owner address", async function () {
            const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(
              deployContractsFixture
            );

            expect(await market.owner()).to.equal(
              owner.address
            );
          });

          it("Users should have 100 FEST tokens initially", async function () {

            const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(
              deployContractsFixture
            );
            
            const weiAmount = ethers.parseUnits("100", "ether");

            expect(await festToken.balanceOf(otherAccount[1].address)).to.equal(
              weiAmount
            );

            expect(await festToken.balanceOf(otherAccount[2].address)).to.equal(
              weiAmount
            );

            expect(await festToken.balanceOf(otherAccount[3].address)).to.equal(
              weiAmount
            );
          });
    });

    describe("Minting", function () {
      it("Single user should able to buy tickets from organizer", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(deployContractsFixture);

        const ticketPrice = await ticketMinter.getTicketPrice();

        const contractAddress = await ticketMinter.getAddress();
        await festToken.connect(otherAccount[1]).approve(contractAddress, ticketPrice.toString());
        
        await ticketMinter.connect(otherAccount[1]).buyTicket();

        expect(await ticketMinter.ticketID()).to.equal(1);
        expect(await ticketMinter.ownerOf(1)).to.equal(otherAccount[1].address);
      });

      it("Multiple users should able to buy tickets from organizer", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(deployContractsFixture);

        const ticketPrice = await ticketMinter.getTicketPrice();

        const contractAddress = await ticketMinter.getAddress();
        await festToken.connect(otherAccount[1]).approve(contractAddress, ticketPrice.toString());
        
        await festToken.connect(otherAccount[2]).approve(contractAddress, ticketPrice.toString());

        await ticketMinter.connect(otherAccount[1]).buyTicket();
        expect(await ticketMinter.ticketID()).to.equal(1);

        await ticketMinter.connect(otherAccount[2]).buyTicket();
        expect(await ticketMinter.ticketID()).to.equal(2);

        expect(await ticketMinter.ownerOf(1)).to.equal(otherAccount[1].address);
        expect(await ticketMinter.ownerOf(2)).to.equal(otherAccount[2].address);
      });
    });

    describe("Buying & Selling", function () {
      it("User should revert when putting ticket for sale more than 110% of the last price", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(buyingTicketFixture);
        
        // Listing ticket for the price of 2 FEST Tokens
        await expect(
          market.connect(otherAccount[1]).listTicket(
            1, 
            ethers.parseUnits("2", "ether")
          )
        ).to.be.revertedWith("Price cannot be more than 110% of the last sale price!");
      });

      it("User should able to put ticket for sale through Market contract", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(buyingTicketFixture);
        
        // Listing ticket for the price of 2 FEST Tokens
        await market.connect(otherAccount[1]).listTicket(
          1, 
          ethers.parseUnits("1.1", "ether")
        );

        let sale = await market.idToSale(1);
        // console.log("sale := ", sale);
  
        // Checking the seller of the ticket ID 1
        expect(
          sale[0]
        ).to.equal(otherAccount[1].address);
      });

      it("Should revert when user put invalid ticket on sale", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(buyingTicketFixture);
        
        // Listing ticket for the price of 1.1 FEST Tokens
        await expect(market.connect(otherAccount[1]).listTicket(
          10, 
          ethers.parseUnits("1.1", "ether")
        )).to.be.revertedWith("ERC721: invalid token ID");
      });

      it("Should revert when user put invalid ticket on sale", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(buyingTicketFixture);
        
        // Listing ticket for the price of 1.1 FEST Tokens
        await expect(market.connect(otherAccount[1]).listTicket(
          10, 
          ethers.parseUnits("1.1", "ether")
        )).to.be.revertedWith("ERC721: invalid token ID");
      });

      it("User should able to buy ticket from sale", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(buyingTicketFixture);
        
        // Listing ticket for the price of 1.1 FEST Tokens
        await market.connect(otherAccount[1]).listTicket(
          1, 
          ethers.parseUnits("1.1", "ether")
        );

        const beforeOwnerBalance = await festToken.balanceOf(owner.address);

        // Approving Market contract for spending 1.1 FEST Token on user befalf
        await festToken.connect(otherAccount[2]).approve( // Using 3rd account as user
          await market.getAddress(),
          ethers.parseUnits("1.1", "ether")
        );

        await market.connect(otherAccount[2]).purchaseTicket(1);

        // Organizer also gets 5% commission
        const afterOwnerBalance = await festToken.balanceOf(owner.address);

        expect(
          await ticketMinter.ownerOf(1)
        ).to.equal(otherAccount[2].address);

        expect(
          afterOwnerBalance - beforeOwnerBalance
        ).to.equal(ethers.parseEther("0.055", "ether"));
      });

      it("Owner should able to change commission percentage", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(deployContractsFixture);

        const prevOrganizerCommission = await market.organizerCommission();

        await market.setCommissionPercentage("100"); // 10%

        const newOrganizerCommission = await market.organizerCommission();

        expect(newOrganizerCommission).to.equal("100");
      });

      it("Should revert if organizer try to set commission percentage more than 30%", async function () {
        const { festToken, ticketMinter, market, owner, otherAccount } = await loadFixture(deployContractsFixture);

        await expect(
          market.setCommissionPercentage("350")
        ).to.be.revertedWith("Commission cannot be more than 30%"); // 35%
      });
    });
});
