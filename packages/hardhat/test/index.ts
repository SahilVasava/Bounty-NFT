import { expect } from "chai";
import { ethers } from "hardhat";
import { Chance } from "chance";

async function deploy(name: string, ...params: string[]) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then((f) => f.deployed());
}
const tokenList = [...Array(3)].map((_, i) => ({
  tokenId: i,
  account: ethers.Wallet.createRandom().address,
}));

describe("BountyNFT", function () {
  before(async function () {
    this.chance = new Chance();
    this.accounts = await ethers.getSigners();
    ({ chainId: this.chainId } = await ethers.provider.getNetwork());
  });

  describe("Create a single BountyNFT and claim it", function () {
    before(async function () {
      this.contract = await deploy("BountyNFT");
    });

    it("Should create a BountyNFT", async function () {
      const data = {
        id: 0,
        rewardInWei: ethers.utils.parseEther("1"),
        title: "Smart Contracts Audit",
        hunter: this.accounts[0].address,
        status: 0,
        claimedAt: ethers.BigNumber.from("0"),
        uri: "ipfs://QmZ7Xp3F8CUFzgX4Z121RpYicbN4MHjH77qtE46US3vGxQ",
      };
      await expect(
        this.contract.createBountyNFT(data.rewardInWei, data.title, data.uri)
      )
        .to.emit(this.contract, "BountyNFTCreated")

        .withArgs(
          data.id,
          data.rewardInWei,
          data.title,
          data.hunter,
          data.status,
          data.claimedAt
        );
    });
    it("Should claim a BountyNFT", async function () {
      const signature = await this.accounts[0]._signTypedData(
        // Domain
        {
          name: "BountyNFT",
          version: "1.0.0",
          chainId: this.chainId,
          verifyingContract: this.contract.address,
        },
        // Types
        {
          BountyNFT: [
            { name: "tokenId", type: "uint256" },
            { name: "account", type: "address" },
          ],
        },
        // Value
        { tokenId: 0, account: this.accounts[1].address }
      );
      // console.log("Signature: ", signature);
      // console.log("Address[0]: ", this.accounts[0].address);
      // console.log("Address[1]: ", this.accounts[1].address);
      await expect(
        this.contract
          .connect(this.accounts[1])
          .claimBountyNFT(this.accounts[1].address, 0, signature)
      )
        .to.emit(this.contract, "TransferSingle")

        .withArgs(
          this.accounts[1].address,
          ethers.constants.AddressZero,
          this.accounts[1].address,
          0,
          1
        );
    });
  });

  describe("Create a single BountyNFT and try to double claim it", function () {
    before(async function () {
      this.contract = await deploy("BountyNFT");
      this.token = { tokenId: 0, account: this.accounts[1].address };
      this.token.signature = await this.accounts[0]._signTypedData(
        // Domain
        {
          name: "BountyNFT",
          version: "1.0.0",
          chainId: this.chainId,
          verifyingContract: this.contract.address,
        },
        // Types
        {
          BountyNFT: [
            { name: "tokenId", type: "uint256" },
            { name: "account", type: "address" },
          ],
        },
        // Value
        { tokenId: 0, account: this.accounts[1].address }
      );
    });

    it("Should create a BountyNFT", async function () {
      const data = {
        id: ethers.BigNumber.from("0"),
        rewardInWei: ethers.utils.parseEther("1"),
        title: "Smart Contracts Audit",
        hunter: this.accounts[0].address,
        status: 0,
        claimedAt: ethers.BigNumber.from("0"),
        uri: "ipfs://QmZ7Xp3F8CUFzgX4Z121RpYicbN4MHjH77qtE46US3vGxQ",
      };
      expect(
        await this.contract.createBountyNFT(
          data.rewardInWei,
          data.title,
          data.uri
        )
      )
        .to.emit(this.contract, "BountyNFTCreated")

        .withArgs(
          data.id,
          data.rewardInWei,
          data.title,
          data.hunter,
          data.status,
          data.claimedAt
        );
    });

    it("claim a BountyNFT - success", async function () {
      await expect(
        this.contract
          .connect(this.accounts[1])
          .claimBountyNFT(
            this.token.account,
            this.token.tokenId,
            this.token.signature
          )
      )
        .to.emit(this.contract, "TransferSingle")

        .withArgs(
          this.token.account,
          ethers.constants.AddressZero,
          this.token.account,
          this.token.tokenId,
          1
        );
    });

    it("claim a BountyNFT - failure", async function () {
      await expect(
        this.contract
          .connect(this.accounts[1])
          .claimBountyNFT(
            this.token.account,
            this.token.tokenId,
            this.token.signature
          )
      ).to.be.revertedWith("BountyNFT already claimed");
    });
  });

  describe("Create a single BountyNFT and try to claim it via unauthorized account or wrong token", function () {
    before(async function () {
      this.contract = await deploy("BountyNFT");
      this.token = { tokenId: 0, account: this.accounts[1].address };
      this.token.signature = await this.accounts[0]._signTypedData(
        // Domain
        {
          name: "BountyNFT",
          version: "1.0.0",
          chainId: this.chainId,
          verifyingContract: this.contract.address,
        },
        // Types
        {
          BountyNFT: [
            { name: "tokenId", type: "uint256" },
            { name: "account", type: "address" },
          ],
        },
        // Value
        { tokenId: 0, account: this.accounts[1].address }
      );
    });

    it("Should create a BountyNFT", async function () {
      const data = {
        id: ethers.BigNumber.from("0"),
        rewardInWei: ethers.utils.parseEther("1"),
        title: "Smart Contracts Audit",
        hunter: this.accounts[0].address,
        status: 0,
        claimedAt: ethers.BigNumber.from("0"),
        uri: "ipfs://QmZ7Xp3F8CUFzgX4Z121RpYicbN4MHjH77qtE46US3vGxQ",
      };
      expect(
        await this.contract.createBountyNFT(
          data.rewardInWei,
          data.title,
          data.uri
        )
      )
        .to.emit(this.contract, "BountyNFTCreated")

        .withArgs(
          data.id,
          data.rewardInWei,
          data.title,
          data.hunter,
          data.status,
          data.claimedAt
        );
    });

    it("claim a BountyNFT via unauthorized account - failure", async function () {
      await expect(
        this.contract
          .connect(this.accounts[1])
          .claimBountyNFT(
            this.accounts[2].address,
            this.token.tokenId,
            this.token.signature
          )
      ).to.be.revertedWith("Invalid signature");
    });

    it("claim a wrong BountyNFT - failure", async function () {
      await expect(
        this.contract
          .connect(this.accounts[1])
          .claimBountyNFT(this.token.account, 1, this.token.signature)
      ).to.be.revertedWith("Invalid signature");
    });
  });

  describe("Create a BountyNFTBatch and claim it", function () {
    before(async function () {
      this.contract = await deploy("BountyNFT");
    });

    it("Should create a BountyNFTBatch", async function () {
      const data = {
        ids: [...Array(3)].map((_, i) => i),
        rewardsInWei: [...Array(3)].map(() => ethers.utils.parseEther("1")),
        titles: [...Array(3)].map(() => this.chance.sentence()),
        hunters: [...Array(3)].map(() => this.accounts[0].address),
        statuses: [...Array(3)].map(() => 0),
        claimedAts: [...Array(3)].map(() => ethers.BigNumber.from("0")),
        uris: [...Array(3)].map(
          () => "ipfs://QmZ7Xp3F8CUFzgX4Z121RpYicbN4MHjH77qtE46US3vGxQ"
        ),
      };
      await expect(
        this.contract.createBountyNFTBatch(
          data.rewardsInWei,
          data.titles,
          data.uris
        )
      )
        .to.emit(this.contract, "BountyNFTBatchCreated")

        .withArgs(
          data.ids,
          data.rewardsInWei,
          data.titles,
          data.hunters,
          data.statuses,
          data.claimedAts
        );
    });
    tokenList.forEach(({ tokenId, account }) => {
      it("Should claim a BountyNFT", async function () {
        const signature = await this.accounts[0]._signTypedData(
          // Domain
          {
            name: "BountyNFT",
            version: "1.0.0",
            chainId: this.chainId,
            verifyingContract: this.contract.address,
          },
          // Types
          {
            BountyNFT: [
              { name: "tokenId", type: "uint256" },
              { name: "account", type: "address" },
            ],
          },
          // Value
          { tokenId, account }
        );

        await expect(
          this.contract
            .connect(this.accounts[1])
            .claimBountyNFT(account, tokenId, signature)
        )
          .to.emit(this.contract, "TransferSingle")

          .withArgs(
            this.accounts[1].address,
            ethers.constants.AddressZero,
            account,
            tokenId,
            1
          );
      });
    });
  });
});
