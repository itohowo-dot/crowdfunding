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

;; Contributor global stats
(define-map contributor-stats
    principal
    {
        total-contributed: uint,
        campaigns-backed: uint,
        successful-campaigns: uint,
        refunds-received: uint
    }
)

;; Reward tiers for campaigns
(define-map campaign-reward-tiers
    { campaign-id: uint, tier: uint }
    {
        min-amount: uint,
        max-backers: uint,
        current-backers: uint,
        reward-description: (string-utf8 256)
    }
)

;; Refund tracking
(define-map refund-claims
    { campaign-id: uint, contributor: principal }
    {
        amount: uint,
        claimed-at: uint,
        processed: bool
    }
)

;; Private functions

(define-private (calculate-tier (amount uint) (campaign-id uint))
    (if (>= amount u10000000000) ;; 10,000 STX
        TIER-PLATINUM
        (if (>= amount u1000000000) ;; 1,000 STX
            TIER-GOLD
            (if (>= amount u100000000) ;; 100 STX
                TIER-SILVER
                TIER-BRONZE
            )
        )
    )
)

(define-private (update-contributor-global-stats (contributor principal) (amount uint))
    (let (
        (stats (default-to 
            { total-contributed: u0, campaigns-backed: u0, successful-campaigns: u0, refunds-received: u0 }
            (map-get? contributor-stats contributor)
        ))
    )
        (map-set contributor-stats contributor
            (merge stats {
                total-contributed: (+ (get total-contributed stats) amount)
            })
        )
    )
)