;; Contribution Tracker Smart Contract
;; Enhanced contribution tracking with analytics and reward tiers

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-CAMPAIGN-NOT-FOUND (err u201))
(define-constant ERR-INVALID-AMOUNT (err u202))
(define-constant ERR-NO-CONTRIBUTION (err u203))
(define-constant ERR-ALREADY-REFUNDED (err u204))
(define-constant ERR-REFUND-NOT-AVAILABLE (err u205))
(define-constant ERR-TIER-NOT-FOUND (err u206))
(define-constant ERR-INVALID-TIER (err u207))

;; Contribution tiers for rewards
(define-constant TIER-BRONZE u1)
(define-constant TIER-SILVER u2)
(define-constant TIER-GOLD u3)
(define-constant TIER-PLATINUM u4)

;; Data variables
(define-data-var total-platform-contributions uint u0)
(define-data-var total-platform-backers uint u0)

;; Data maps

;; Detailed contribution records
(define-map contribution-details
    { campaign-id: uint, contributor: principal }
    {
        total-amount: uint,
        contribution-count: uint,
        first-contribution: uint,
        last-contribution: uint,
        refunded: bool,
        reward-tier: uint
    }
)

;; Campaign contribution summary
(define-map campaign-contributions
    uint
    {
        total-raised: uint,
        contributor-count: uint,
        contribution-count: uint,
        average-contribution: uint,
        largest-contribution: uint,
        largest-contributor: (optional principal)
    }
)

;; Individual contribution transactions
(define-map contribution-transactions
    { campaign-id: uint, contributor: principal, tx-index: uint }
    {
        amount: uint,
        timestamp: uint,
        block: uint
    }
)