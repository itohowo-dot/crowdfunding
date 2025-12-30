;; Milestone Manager Smart Contract
;; Manages milestone-based fund releases with backer governance voting

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-CAMPAIGN-NOT-FOUND (err u301))
(define-constant ERR-MILESTONE-NOT-FOUND (err u302))
(define-constant ERR-INVALID-AMOUNT (err u303))
(define-constant ERR-INVALID-MILESTONE (err u304))
(define-constant ERR-MILESTONE-ALREADY-RELEASED (err u305))
(define-constant ERR-MILESTONE-NOT-APPROVED (err u306))
(define-constant ERR-VOTING-ENDED (err u307))
(define-constant ERR-ALREADY-VOTED (err u308))
(define-constant ERR-NOT-BACKER (err u309))
(define-constant ERR-INSUFFICIENT-FUNDS (err u310))
(define-constant ERR-INVALID-VOTING-PERIOD (err u311))
(define-constant ERR-VOTING-ACTIVE (err u312))
(define-constant ERR-CAMPAIGN-NOT-SUCCESSFUL (err u313))
(define-constant ERR-TRANSFER-FAILED (err u314))

;; Milestone status constants
(define-constant STATUS-PENDING u1)
(define-constant STATUS-VOTING u2)
(define-constant STATUS-APPROVED u3)
(define-constant STATUS-REJECTED u4)
(define-constant STATUS-RELEASED u5)
(define-constant STATUS-CANCELLED u6)

;; Voting constants
(define-constant VOTE-YES u1)
(define-constant VOTE-NO u2)
(define-constant MIN-APPROVAL-PERCENTAGE u51) ;; 51% approval required

;; Data variables
(define-data-var milestone-nonce uint u0)

;; Data maps

;; Campaign milestone configuration
(define-map campaign-milestone-config
    uint
    {
        total-milestones: uint,
        completed-milestones: uint,
        total-allocated: uint,
        total-released: uint,
        milestone-enabled: bool
    }
)

;; Milestone details
(define-map milestones
    { campaign-id: uint, milestone-id: uint }
    {
        title: (string-ascii 100),
        description: (string-utf8 500),
        amount: uint,
        status: uint,
        created-at: uint,
        voting-deadline: uint,
        released-at: (optional uint),
        creator: principal
    }
)

;; Voting records
(define-map milestone-votes
    { campaign-id: uint, milestone-id: uint }
    {
        yes-votes: uint,
        no-votes: uint,
        total-voters: uint,
        total-voting-power: uint,
        voting-start: uint,
        voting-end: uint,
        approved: bool
    }
)

;; Individual voter records
(define-map voter-records
    { campaign-id: uint, milestone-id: uint, voter: principal }
    {
        vote: uint,
        voting-power: uint,
        voted-at: uint
    }
)

;; Milestone deliverables/proof
(define-map milestone-deliverables
    { campaign-id: uint, milestone-id: uint }
    {
        proof-url: (string-utf8 256),
        submitted-at: uint,
        notes: (string-utf8 500)
    }
)

;; Campaign voting power tracking
(define-map campaign-voting-power
    { campaign-id: uint, backer: principal }
    {
        contribution-amount: uint,
        voting-power: uint
    }
)

;; Private functions

(define-private (calculate-voting-power (contribution-amount uint))
    ;; Simple linear voting power based on contribution
    ;; Could be enhanced with quadratic voting or other mechanisms
    contribution-amount
)

(define-private (has-voting-ended (campaign-id uint) (milestone-id uint))
    (match (map-get? milestone-votes { campaign-id: campaign-id, milestone-id: milestone-id })
        vote-data (>= stacks-block-height (get voting-end vote-data))
        true
    )
)

(define-private (calculate-approval-percentage (yes-votes uint) (total-voting-power uint))
    (if (is-eq total-voting-power u0)
        u0
        (/ (* yes-votes u100) total-voting-power)
    )
)

(define-private (is-milestone-approved (campaign-id uint) (milestone-id uint))
    (match (map-get? milestone-votes { campaign-id: campaign-id, milestone-id: milestone-id })
        vote-data 
            (let (
                (approval-pct (calculate-approval-percentage 
                    (get yes-votes vote-data) 
                    (get total-voting-power vote-data)
                ))
            )
                (>= approval-pct MIN-APPROVAL-PERCENTAGE)
            )
        false
    )
)

;; Read-only functions

(define-read-only (get-campaign-milestone-config (campaign-id uint))
    (map-get? campaign-milestone-config campaign-id)
)

(define-read-only (get-milestone (campaign-id uint) (milestone-id uint))
    (map-get? milestones { campaign-id: campaign-id, milestone-id: milestone-id })
)