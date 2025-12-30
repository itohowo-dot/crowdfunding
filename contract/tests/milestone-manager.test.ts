import { describe, expect, it, beforeEach } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator = accounts.get("wallet_1")!;
const backer1 = accounts.get("wallet_2")!;
const backer2 = accounts.get("wallet_3")!;
const backer3 = accounts.get("wallet_4")!;
const backer4 = accounts.get("wallet_5")!;

describe("Milestone Manager Contract Tests", () => {
  beforeEach(() => {
    simnet.setEpoch("3.0");
  });

  describe("Milestone Campaign Initialization", () => {
    it("should initialize milestone campaign", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should get campaign milestone config", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      const config = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-campaign-milestone-config",
        [Cl.uint(1)],
        creator
      );

      expect(config.result).toBeSome();
    });
  });

  describe("Adding Milestones", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );
    });

    it("should add milestone successfully", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("MVP Development"),
          Cl.stringUtf8("Complete minimum viable product with core features"),
          Cl.uint(200_000000), // 200 STX
          Cl.uint(1440), // Voting duration
        ],
        creator
      );

      expect(response.result).toBeOk(Cl.uint(1));
    });

    it("should fail with zero amount", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Invalid Milestone"),
          Cl.stringUtf8("Should fail"),
          Cl.uint(0),
          Cl.uint(1440),
        ],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(303)); // ERR-INVALID-AMOUNT
    });

    it("should fail with zero voting duration", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Invalid Milestone"),
          Cl.stringUtf8("Should fail"),
          Cl.uint(100_000000),
          Cl.uint(0),
        ],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(311)); // ERR-INVALID-VOTING-PERIOD
    });

    it("should add multiple milestones", () => {
      const response1 = simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Phase 1"),
          Cl.stringUtf8("Initial development"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );

      const response2 = simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Phase 2"),
          Cl.stringUtf8("Beta testing"),
          Cl.uint(300_000000),
          Cl.uint(1440),
        ],
        creator
      );

      const response3 = simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Phase 3"),
          Cl.stringUtf8("Launch"),
          Cl.uint(500_000000),
          Cl.uint(1440),
        ],
        creator
      );

      expect(response1.result).toBeOk(Cl.uint(1));
      expect(response2.result).toBeOk(Cl.uint(2));
      expect(response3.result).toBeOk(Cl.uint(3));
    });

    it("should fail to add milestone to non-existent campaign", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(999),
          Cl.stringAscii("Test"),
          Cl.stringUtf8("Should fail"),
          Cl.uint(100_000000),
          Cl.uint(1440),
        ],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(301)); // ERR-CAMPAIGN-NOT-FOUND
    });
  });

  describe("Starting Milestone Voting", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Test Milestone"),
          Cl.stringUtf8("For voting tests"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );
    });

    it("should start voting successfully", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(720)],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail if non-creator tries to start voting", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(720)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
    });

    it("should fail with invalid voting duration", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(0)],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(311)); // ERR-INVALID-VOTING-PERIOD
    });

    it("should fail for non-existent milestone", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(999), Cl.uint(720)],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(302)); // ERR-MILESTONE-NOT-FOUND
    });
  });

  describe("Voting on Milestones", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Voting Test"),
          Cl.stringUtf8("Test milestone voting"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(720)],
        creator
      );
    });

    it("should accept yes vote", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(1), // VOTE-YES
          Cl.uint(100_000000), // Contribution amount
        ],
        backer1
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should accept no vote", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(2), // VOTE-NO
          Cl.uint(50_000000),
        ],
        backer2
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail if voter has no contribution", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(0)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(309)); // ERR-NOT-BACKER
    });

    it("should prevent double voting", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(100_000000)],
        backer1
      );

      const response = simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(50_000000)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(308)); // ERR-ALREADY-VOTED
    });

    it("should fail with invalid vote value", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(3), Cl.uint(100_000000)], // Invalid vote
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(304)); // ERR-INVALID-MILESTONE
    });

    it("should track multiple votes correctly", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(200_000000)],
        backer1
      );

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(300_000000)],
        backer2
      );

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(2), Cl.uint(100_000000)],
        backer3
      );

      const votes = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-milestone-votes",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(votes.result).toBeSome();
    });

    it("should fail to vote after voting period ends", () => {
      // Advance blocks past voting deadline
      simnet.mineEmptyBlocks(721);

      const response = simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(100_000000)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(307)); // ERR-VOTING-ENDED
    });
  });

  describe("Finalizing Votes", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Finalize Test"),
          Cl.stringUtf8("Test vote finalization"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(100)], // Short voting period
        creator
      );
    });

    it("should approve milestone with majority yes votes", () => {
      // Cast votes (51%+ yes)
      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(300_000000)],
        backer1
      );

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(2), Cl.uint(200_000000)],
        backer2
      );

      // Advance past voting deadline
      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "milestone-manager",
        "finalize-milestone-vote",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should reject milestone with majority no votes", () => {
      // Cast votes (more no than yes)
      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(2), Cl.uint(400_000000)],
        backer1
      );

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(200_000000)],
        backer2
      );

      simnet.mineEmptyBlocks(101);

      const response = simnet.callPublicFn(
        "milestone-manager",
        "finalize-milestone-vote",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(false));
    });

    it("should fail to finalize before voting ends", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "finalize-milestone-vote",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(312)); // ERR-VOTING-ACTIVE
    });
  });

  describe("Milestone Deliverables", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Deliverable Test"),
          Cl.stringUtf8("Test deliverable submission"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );
    });

    it("should submit deliverables successfully", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "submit-milestone-deliverables",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.stringUtf8("https://github.com/project/milestone1"),
          Cl.stringUtf8("Completed MVP with all core features as specified"),
        ],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail if non-creator submits deliverables", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "submit-milestone-deliverables",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.stringUtf8("https://example.com"),
          Cl.stringUtf8("Unauthorized submission"),
        ],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
    });

    it("should get submitted deliverables", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "submit-milestone-deliverables",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.stringUtf8("https://github.com/project/milestone1"),
          Cl.stringUtf8("Deliverable proof"),
        ],
        creator
      );

      const deliverables = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-milestone-deliverables",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(deliverables.result).toBeSome();
    });
  });

  describe("Releasing Milestone Funds", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Release Test"),
          Cl.stringUtf8("Test fund release"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(100)],
        creator
      );

      // Approve milestone
      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(600_000000)],
        backer1
      );

      simnet.mineEmptyBlocks(101);

      simnet.callPublicFn(
        "milestone-manager",
        "finalize-milestone-vote",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );
    });

    it("should release funds for approved milestone", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "release-milestone-funds",
        [Cl.uint(1), Cl.uint(1), Cl.principal(creator)],
        creator
      );

      expect(response.result).toBeOk(Cl.uint(200_000000));
    });

    it("should fail to release unapproved milestone", () => {
      // Add another milestone that won't be approved
      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Unapproved"),
          Cl.stringUtf8("Not approved"),
          Cl.uint(100_000000),
          Cl.uint(1440),
        ],
        creator
      );

      const response = simnet.callPublicFn(
        "milestone-manager",
        "release-milestone-funds",
        [Cl.uint(1), Cl.uint(2), Cl.principal(creator)],
        creator
      );

      expect(response.result).toBeErr(Cl.uint(306)); // ERR-MILESTONE-NOT-APPROVED
    });
  });

  describe("Campaign Progress Tracking", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      // Add 3 milestones
      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Phase 1"),
          Cl.stringUtf8("First phase"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Phase 2"),
          Cl.stringUtf8("Second phase"),
          Cl.uint(300_000000),
          Cl.uint(1440),
        ],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Phase 3"),
          Cl.stringUtf8("Third phase"),
          Cl.uint(500_000000),
          Cl.uint(1440),
        ],
        creator
      );
    });

    it("should get campaign progress", () => {
      const response = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-campaign-progress",
        [Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk();
    });

    it("should update progress as milestones complete", () => {
      // Complete first milestone
      simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(100)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(600_000000)],
        backer1
      );

      simnet.mineEmptyBlocks(101);

      simnet.callPublicFn(
        "milestone-manager",
        "finalize-milestone-vote",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "release-milestone-funds",
        [Cl.uint(1), Cl.uint(1), Cl.principal(creator)],
        creator
      );

      const progress = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-campaign-progress",
        [Cl.uint(1)],
        creator
      );

      expect(progress.result).toBeOk();
    });
  });

  describe("Milestone Updates and Cancellation", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Update Test"),
          Cl.stringUtf8("Original description"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );
    });

    it("should update milestone details", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "update-milestone",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.stringAscii("Updated Title"),
          Cl.stringUtf8("Updated description with more details"),
        ],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail if non-creator tries to update", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "update-milestone",
        [
          Cl.uint(1),
          Cl.uint(1),
          Cl.stringAscii("Unauthorized"),
          Cl.stringUtf8("Should fail"),
        ],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
    });

    it("should cancel pending milestone", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "cancel-milestone",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(response.result).toBeOk(Cl.bool(true));
    });

    it("should fail to cancel if non-creator", () => {
      const response = simnet.callPublicFn(
        "milestone-manager",
        "cancel-milestone",
        [Cl.uint(1), Cl.uint(1)],
        backer1
      );

      expect(response.result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Voting Power Calculations", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Voting Power Test"),
          Cl.stringUtf8("Test voting power"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(720)],
        creator
      );
    });

    it("should calculate voting power based on contribution", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(500_000000)],
        backer1
      );

      const votingPower = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-voting-power",
        [Cl.uint(1), Cl.principal(backer1)],
        creator
      );

      expect(votingPower.result).toBeOk(Cl.uint(500_000000));
    });

    it("should give more voting power to larger contributions", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(1000_000000)],
        backer1
      );

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(100_000000)],
        backer2
      );

      const power1 = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-voting-power",
        [Cl.uint(1), Cl.principal(backer1)],
        creator
      );

      const power2 = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-voting-power",
        [Cl.uint(1), Cl.principal(backer2)],
        creator
      );

      expect(power1.result).toBeOk(Cl.uint(1000_000000));
      expect(power2.result).toBeOk(Cl.uint(100_000000));
    });
  });

  describe("Read-Only Functions", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "milestone-manager",
        "initialize-milestone-campaign",
        [Cl.uint(1)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "add-milestone",
        [
          Cl.uint(1),
          Cl.stringAscii("Read Test"),
          Cl.stringUtf8("Testing read functions"),
          Cl.uint(200_000000),
          Cl.uint(1440),
        ],
        creator
      );
    });

    it("should get milestone details", () => {
      const milestone = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-milestone",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(milestone.result).toBeSome();
    });

    it("should get milestone status", () => {
      const status = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-milestone-status",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(status.result).toBeOk(Cl.uint(1)); // STATUS-PENDING
    });

    it("should check if user has voted", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(720)],
        creator
      );

      const hasVotedBefore = simnet.callReadOnlyFn(
        "milestone-manager",
        "has-voted",
        [Cl.uint(1), Cl.uint(1), Cl.principal(backer1)],
        creator
      );

      expect(hasVotedBefore.result).toBeBool(false);

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(100_000000)],
        backer1
      );

      const hasVotedAfter = simnet.callReadOnlyFn(
        "milestone-manager",
        "has-voted",
        [Cl.uint(1), Cl.uint(1), Cl.principal(backer1)],
        creator
      );

      expect(hasVotedAfter.result).toBeBool(true);
    });

    it("should get voting results", () => {
      simnet.callPublicFn(
        "milestone-manager",
        "start-milestone-voting",
        [Cl.uint(1), Cl.uint(1), Cl.uint(720)],
        creator
      );

      simnet.callPublicFn(
        "milestone-manager",
        "vote-on-milestone",
        [Cl.uint(1), Cl.uint(1), Cl.uint(1), Cl.uint(300_000000)],
        backer1
      );

      const results = simnet.callReadOnlyFn(
        "milestone-manager",
        "get-voting-results",
        [Cl.uint(1), Cl.uint(1)],
        creator
      );

      expect(results.result).toBeOk();
    });
  });
});
