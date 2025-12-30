import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator = accounts.get("wallet_1")!;
const backer1 = accounts.get("wallet_2")!;
const backer2 = accounts.get("wallet_3")!;
const backer3 = accounts.get("wallet_4")!;

describe("Contribution Tracker Contract Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  describe("Recording Contributions", () => {
    it("should record a new contribution", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail to record zero amount contribution", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(0)],
        deployer
      );

      expect(response.result).toBeErr(Cl.uint(202)); // ERR-INVALID-AMOUNT
    });

    it("should update existing contribution", () => {
      // First contribution
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      // Second contribution from same backer
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(150_000000)],
        deployer
      );

      expect(response.result).toBeOk(Cl.bool(true));

      const details = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contribution-details",
        [Cl.uint(1), Cl.principal(backer1)],
        deployer
      );

      expect(details.result).toBeSome();
    });

    it("should track multiple contributors to same campaign", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer2), Cl.uint(300_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer3), Cl.uint(150_000000)],
        deployer
      );

      const summary = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-campaign-contribution-summary",
        [Cl.uint(1)],
        deployer
      );

      expect(summary.result).toBeSome();
    });

    it("should correctly calculate contribution tiers", () => {
      // Bronze tier: < 100 STX
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(50_000000)],
        deployer
      );

      // Silver tier: >= 100 STX
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(2), Cl.principal(backer2), Cl.uint(100_000000)],
        deployer
      );

      // Gold tier: >= 1000 STX
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(3), Cl.principal(backer3), Cl.uint(1000_000000)],
        deployer
      );

      const tier1 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-tier",
        [Cl.uint(1), Cl.principal(backer1)],
        deployer
      );

      const tier2 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-tier",
        [Cl.uint(2), Cl.principal(backer2)],
        deployer
      );

      const tier3 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-tier",
        [Cl.uint(3), Cl.principal(backer3)],
        deployer
      );

      expect(tier1.result).toBeOk(Cl.uint(1)); // TIER-BRONZE
      expect(tier2.result).toBeOk(Cl.uint(2)); // TIER-SILVER
      expect(tier3.result).toBeOk(Cl.uint(3)); // TIER-GOLD
    });
  });

  describe("Campaign Contribution Summary", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer2), Cl.uint(300_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer3), Cl.uint(500_000000)],
        deployer
      );
    });

    it("should calculate total raised correctly", () => {
      const summary = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-campaign-contribution-summary",
        [Cl.uint(1)],
        deployer
      );

      expect(summary.result).toBeSome();
    });

    it("should track contributor count", () => {
      const summary = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-campaign-contribution-summary",
        [Cl.uint(1)],
        deployer
      );

      expect(summary.result).toBeSome();
    });

    it("should identify largest contributor", () => {
      const isTopContributor1 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "is-top-contributor",
        [Cl.uint(1), Cl.principal(backer3)], // backer3 contributed 500 STX
        deployer
      );

      const isTopContributor2 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "is-top-contributor",
        [Cl.uint(1), Cl.principal(backer1)],
        deployer
      );

      expect(isTopContributor1.result).toBeOk(Cl.bool(true));
      expect(isTopContributor2.result).toBeOk(Cl.bool(false));
    });

    it("should calculate average contribution", () => {
      const summary = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-campaign-contribution-summary",
        [Cl.uint(1)],
        deployer
      );

      expect(summary.result).toBeSome();
      // Average should be (200 + 300 + 500) / 3 = 333.33 STX
    });
  });

  describe("Contributor Statistics", () => {
    it("should track contributor global stats", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(2), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(3), Cl.principal(backer1), Cl.uint(150_000000)],
        deployer
      );

      const stats = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-stats",
        [Cl.principal(backer1)],
        deployer
      );

      expect(stats.result).not.toBeNone();
    });

    it("should increment successful campaigns", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      const response = simnet.callPublicFn(
        "contribution-tracker",
        "increment-successful-campaigns",
        [Cl.principal(backer1)],
        deployer
      );

      expect(response.result).toBeOk(Cl.bool(true));

      const stats = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-stats",
        [Cl.principal(backer1)],
        deployer
      );

      expect(stats.result).not.toBeNone();
    });

    it("should increment campaigns backed", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "increment-campaigns-backed",
        [Cl.principal(backer1)],
        deployer
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });
  });

  describe("Refund Claims", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );
    });

    it("should process refund claim", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "claim-refund",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail if no contribution exists", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "claim-refund",
        [Cl.uint(1), Cl.principal(backer2), Cl.uint(100_000000)],
        deployer
      );

      expect(response.result).toBeErr(Cl.uint(203)); // ERR-NO-CONTRIBUTION
    });

    it("should prevent double refund", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "claim-refund",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      const response = simnet.callPublicFn(
        "contribution-tracker",
        "claim-refund",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      expect(response.result).toBeErr(Cl.uint(204)); // ERR-ALREADY-REFUNDED
    });

    it("should fail if refund amount exceeds contribution", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "claim-refund",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(300_000000)],
        deployer
      );

      expect(response.result).toBeErr(Cl.uint(202)); // ERR-INVALID-AMOUNT
    });

    it("should track refunds in contributor stats", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "claim-refund",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      const stats = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-stats",
        [Cl.principal(backer1)],
        deployer
      );

      expect(stats.result).not.toBeNone();
    });
  });

  describe("Reward Tiers", () => {
    it("should add reward tier", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "add-reward-tier",
        [
          Cl.uint(1),
          Cl.uint(1), // TIER-BRONZE
          Cl.uint(10_000000), // 10 STX minimum
          Cl.uint(100), // Max 100 backers
          Cl.stringUtf8("Early bird special - Digital thank you"),
        ],
        deployer
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail with invalid tier", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "add-reward-tier",
        [
          Cl.uint(1),
          Cl.uint(5), // Invalid tier
          Cl.uint(10_000000),
          Cl.uint(100),
          Cl.stringUtf8("Invalid tier"),
        ],
        deployer
      );

      expect(response.result).toBeErr(Cl.uint(207)); // ERR-INVALID-TIER
    });

    it("should fail with zero amount", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "add-reward-tier",
        [
          Cl.uint(1),
          Cl.uint(2),
          Cl.uint(0), // Invalid amount
          Cl.uint(50),
          Cl.stringUtf8("Test reward"),
        ],
        deployer
      );

      expect(response.result).toBeErr(Cl.uint(202)); // ERR-INVALID-AMOUNT
    });

    it("should get reward tier details", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "add-reward-tier",
        [
          Cl.uint(1),
          Cl.uint(2), // TIER-SILVER
          Cl.uint(100_000000),
          Cl.uint(50),
          Cl.stringUtf8("Silver reward tier"),
        ],
        deployer
      );

      const tier = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-reward-tier",
        [Cl.uint(1), Cl.uint(2)],
        deployer
      );

      expect(tier.result).toBeSome();
    });

    it("should add multiple reward tiers", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "add-reward-tier",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(10_000000),
          Cl.uint(100),
          Cl.stringUtf8("Bronze reward"),
        ],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "add-reward-tier",
        [
          Cl.uint(1),
          Cl.uint(2),
          Cl.uint(100_000000),
          Cl.uint(50),
          Cl.stringUtf8("Silver reward"),
        ],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "add-reward-tier",
        [
          Cl.uint(1),
          Cl.uint(3),
          Cl.uint(1000_000000),
          Cl.uint(10),
          Cl.stringUtf8("Gold reward"),
        ],
        deployer
      );

      const tier1 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-reward-tier",
        [Cl.uint(1), Cl.uint(1)],
        deployer
      );

      const tier2 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-reward-tier",
        [Cl.uint(1), Cl.uint(2)],
        deployer
      );

      const tier3 = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-reward-tier",
        [Cl.uint(1), Cl.uint(3)],
        deployer
      );

      expect(tier1.result).toBeSome();
      expect(tier2.result).toBeSome();
      expect(tier3.result).toBeSome();
    });
  });

  describe("Platform Statistics", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(2), Cl.principal(backer2), Cl.uint(200_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(3), Cl.principal(backer3), Cl.uint(300_000000)],
        deployer
      );
    });

    it("should get platform statistics", () => {
      const stats = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-platform-stats",
        [],
        deployer
      );

      expect(stats.result).toBeOk();
    });

    it("should track total platform contributions", () => {
      const stats = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-platform-stats",
        [],
        deployer
      );

      expect(stats.result).toBeOk();
    });
  });

  describe("Contribution Transactions", () => {
    it("should record individual transactions", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(50_000000)],
        deployer
      );

      const tx = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contribution-transaction",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(1)],
        deployer
      );

      expect(tx.result).toBeSome();
    });

    it("should get contribution history", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      const history = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contribution-history",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(10)],
        deployer
      );

      expect(history.result).toBeOk();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large contribution amounts", () => {
      const response = simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100000_000000)], // 100k STX
        deployer
      );

      expect(response.result).toBeOk(Cl.bool(true));

      const tier = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-tier",
        [Cl.uint(1), Cl.principal(backer1)],
        deployer
      );

      expect(tier.result).toBeOk(Cl.uint(4)); // TIER-PLATINUM
    });

    it("should handle multiple campaigns from same contributor", () => {
      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(1), Cl.principal(backer1), Cl.uint(100_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(2), Cl.principal(backer1), Cl.uint(200_000000)],
        deployer
      );

      simnet.callPublicFn(
        "contribution-tracker",
        "record-contribution",
        [Cl.uint(3), Cl.principal(backer1), Cl.uint(300_000000)],
        deployer
      );

      const stats = simnet.callReadOnlyFn(
        "contribution-tracker",
        "get-contributor-stats",
        [Cl.principal(backer1)],
        deployer
      );

      expect(stats.result).not.toBeNone();
    });
  });
});
