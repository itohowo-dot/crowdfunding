import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator = accounts.get("wallet_1")!;
const backer1 = accounts.get("wallet_2")!;
const backer2 = accounts.get("wallet_3")!;
const backer3 = accounts.get("wallet_4")!;

describe("Campaign Contract Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  describe("Campaign Creation", () => {
    it("should create a campaign successfully", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Awesome DeFi Project"),
          Cl.stringUtf8("Building the future of decentralized finance"),
          Cl.uint(1000_000000), // 1000 STX goal
          Cl.uint(1440), // ~10 days
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      expect(response.result).toBeOk(Cl.uint(1));
    });

    it("should fail to create campaign with zero goal", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Bad Campaign"),
          Cl.stringUtf8("This should fail"),
          Cl.uint(0), // Invalid goal
          Cl.uint(1440),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(108)); // ERR-INVALID-GOAL
    });

    it("should fail to create campaign with zero duration", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Bad Campaign"),
          Cl.stringUtf8("This should fail"),
          Cl.uint(1000_000000),
          Cl.uint(0), // Invalid duration
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(107)); // ERR-INVALID-DEADLINE
    });

    it("should create multiple campaigns and increment nonce", () => {
      const response1 = simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Project 1"),
          Cl.stringUtf8("First project"),
          Cl.uint(1000_000000),
          Cl.uint(1440),
          Cl.stringUtf8("https://example.com/image1.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      const response2 = simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Project 2"),
          Cl.stringUtf8("Second project"),
          Cl.uint(2000_000000),
          Cl.uint(2880),
          Cl.stringUtf8("https://example.com/image2.jpg"),
          Cl.stringAscii("Art"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      expect(response1.result).toBeOk(Cl.uint(1));
      expect(response2.result).toBeOk(Cl.uint(2));
    });

    it("should create campaign with milestone enabled", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Milestone Project"),
          Cl.stringUtf8("Project with milestones"),
          Cl.uint(5000_000000),
          Cl.uint(1440),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.some(Cl.stringUtf8("https://youtube.com/watch?v=123")),
          Cl.bool(true),
        ],
        creator
      );

      expect(response.result).toBeOk(Cl.uint(1));

      const campaign = simnet.callReadOnlyFn(
        "campaign",
        "get-campaign",
        [Cl.uint(1)],
        creator
      );

      expect(campaign.result).toBeSome();
    });
  });

  describe("Campaign Contributions", () => {
    beforeEach(() => {
      // Create a test campaign
      simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Test Campaign"),
          Cl.stringUtf8("Test description"),
          Cl.uint(1000_000000), // 1000 STX goal
          Cl.uint(1440),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );
    });

    it("should accept contribution to active campaign", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(100_000000)], // 100 STX
        backer1
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail contribution with zero amount", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(0)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(106)); // ERR-INVALID-AMOUNT
    });

    it("should track multiple contributions correctly", () => {
      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(200_000000)],
        backer1
      );

      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(300_000000)],
        backer2
      );

      const campaign = simnet.callReadOnlyFn(
        "campaign",
        "get-campaign",
        [Cl.uint(1)],
        creator
      );

      expect(campaign.result).toBeSome();
    });

    it("should allow same backer to contribute multiple times", () => {
      const response1 = simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(100_000000)],
        backer1
      );

      const response2 = simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(150_000000)],
        backer1
      );

      expect(response1.result).toBeOk(Cl.bool(true));
      expect(response2.result).toBeOk(Cl.bool(true));
    });

    it("should fail contribution to non-existent campaign", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(999), Cl.uint(100_000000)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(101)); // ERR-CAMPAIGN-NOT-FOUND
    });
  });

  describe("Campaign Fund Claiming", () => {
    beforeEach(() => {
      // Create campaign
      simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Fund Claim Test"),
          Cl.stringUtf8("Test description"),
          Cl.uint(500_000000), // 500 STX goal
          Cl.uint(100), // Short duration for testing
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      // Meet the goal
      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(500_000000)],
        backer1
      );
    });

    it("should allow creator to claim funds after successful campaign", () => {
      // Advance blocks past deadline
      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "campaign",
        "claim-funds",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail to claim funds before deadline", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "claim-funds",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(103)); // ERR-CAMPAIGN-ACTIVE
    });

    it("should fail to claim funds if goal not met", () => {
      // Create new campaign
      simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Unfunded Campaign"),
          Cl.stringUtf8("Will not meet goal"),
          Cl.uint(1000_000000),
          Cl.uint(100),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      // Contribute less than goal
      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(2), Cl.uint(100_000000)],
        backer1
      );

      // Advance past deadline
      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "campaign",
        "claim-funds",
        [Cl.uint(2)],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(104)); // ERR-GOAL-NOT-MET
    });

    it("should fail if non-creator tries to claim", () => {
      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "campaign",
        "claim-funds",
        [Cl.uint(1)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should prevent double claiming", () => {
      simnet.mineEmptyBlocks(101);

      simnet.callPublicFn("campaign", "claim-funds", [Cl.uint(1)], creator);

      const response = simnet.callPublicFn(
        "campaign",
        "claim-funds",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(110)); // ERR-ALREADY-CLAIMED
    });
  });

  describe("Campaign Refunds", () => {
    beforeEach(() => {
      // Create campaign
      simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Refund Test"),
          Cl.stringUtf8("Will fail to meet goal"),
          Cl.uint(1000_000000),
          Cl.uint(100),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      // Contribute but don't meet goal
      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(200_000000)],
        backer1
      );

      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(150_000000)],
        backer2
      );
    });

    it("should allow refund after failed campaign", () => {
      // Advance past deadline
      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "campaign",
        "refund",
        [Cl.uint(1)],
        backer1
      );

      expect(response.result).toBeOk(Cl.uint(200_000000));
    });

    it("should fail refund before deadline", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "refund",
        [Cl.uint(1)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(103)); // ERR-CAMPAIGN-ACTIVE
    });

    it("should fail refund if goal was met", () => {
      // Create new campaign
      simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Successful Campaign"),
          Cl.stringUtf8("Will meet goal"),
          Cl.uint(500_000000),
          Cl.uint(100),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(2), Cl.uint(500_000000)],
        backer1
      );

      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "campaign",
        "refund",
        [Cl.uint(2)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(105)); // ERR-GOAL-MET
    });

    it("should fail refund if user did not contribute", () => {
      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "campaign",
        "refund",
        [Cl.uint(1)],
        backer3
      );

      expect(response.result).toBeErr(Cl.uint(112)); // ERR-NO-CONTRIBUTION
    });
  });

  describe("Campaign Management", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Management Test"),
          Cl.stringUtf8("Test campaign management"),
          Cl.uint(1000_000000),
          Cl.uint(1440),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );
    });

    it("should allow creator to cancel campaign", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "cancel-campaign",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail if non-creator tries to cancel", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "cancel-campaign",
        [Cl.uint(1)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should allow creator to extend deadline", () => {
      const response = simnet.callPublicFn(
        "campaign",
        "extend-deadline",
        [Cl.uint(1), Cl.uint(720)], // Extend by 720 blocks
        creator
      );

      expect(response.result).toBeOk(Cl.uint(1440 + 720 + simnet.blockHeight));
    });
  });

  describe("Read-Only Functions", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "campaign",
        "create-campaign",
        [
          Cl.stringAscii("Read Test"),
          Cl.stringUtf8("Testing read functions"),
          Cl.uint(1000_000000),
          Cl.uint(1440),
          Cl.stringUtf8("https://example.com/image.jpg"),
          Cl.stringAscii("Technology"),
          Cl.none(),
          Cl.bool(false),
        ],
        creator
      );

      simnet.callPublicFn(
        "campaign",
        "contribute",
        [Cl.uint(1), Cl.uint(400_000000)],
        backer1
      );
    });

    it("should get campaign details", () => {
      const response = simnet.callReadOnlyFn(
        "campaign",
        "get-campaign",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeSome();
    });

    it("should get funding progress", () => {
      const response = simnet.callReadOnlyFn(
        "campaign",
        "get-funding-progress",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk();
    });

    it("should check if user is campaign creator", () => {
      const response1 = simnet.callReadOnlyFn(
        "campaign",
        "is-campaign-creator",
        [Cl.uint(1), Cl.principal(creator)],
        creator
      );

      const response2 = simnet.callReadOnlyFn(
        "campaign",
        "is-campaign-creator",
        [Cl.uint(1), Cl.principal(backer1)],
        creator
      );

      expect(response1.result).toBeBool(true);
      expect(response2.result).toBeBool(false);
    });

    it("should get time remaining", () => {
      const response = simnet.callReadOnlyFn(
        "campaign",
        "get-time-remaining",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk();
    });
  });
});
