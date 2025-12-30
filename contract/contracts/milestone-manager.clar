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

(define-read-only (get-milestone-votes (campaign-id uint) (milestone-id uint))
    (map-get? milestone-votes { campaign-id: campaign-id, milestone-id: milestone-id })
)

(define-read-only (get-voter-record (campaign-id uint) (milestone-id uint) (voter principal))
    (map-get? voter-records { 
        campaign-id: campaign-id, 
        milestone-id: milestone-id, 
        voter: voter 
    })
)

(define-read-only (get-milestone-deliverables (campaign-id uint) (milestone-id uint))
    (map-get? milestone-deliverables { campaign-id: campaign-id, milestone-id: milestone-id })
)

(define-read-only (get-voting-power (campaign-id uint) (backer principal))
    (match (map-get? campaign-voting-power { campaign-id: campaign-id, backer: backer })
        power-data (ok (get voting-power power-data))
        (ok u0)
    )
)

(define-read-only (get-milestone-status (campaign-id uint) (milestone-id uint))
    (match (get-milestone campaign-id milestone-id)
        milestone (ok (get status milestone))
        ERR-MILESTONE-NOT-FOUND
    )
)

(define-read-only (get-voting-results (campaign-id uint) (milestone-id uint))
    (match (get-milestone-votes campaign-id milestone-id)
        vote-data 
            (ok {
                yes-votes: (get yes-votes vote-data),
                no-votes: (get no-votes vote-data),
                total-voters: (get total-voters vote-data),
                approval-percentage: (calculate-approval-percentage 
                    (get yes-votes vote-data) 
                    (get total-voting-power vote-data)
                ),
                approved: (get approved vote-data),
                voting-ended: (has-voting-ended campaign-id milestone-id)
            })
        ERR-MILESTONE-NOT-FOUND
    )
)

(define-read-only (has-voted (campaign-id uint) (milestone-id uint) (voter principal))
    (is-some (get-voter-record campaign-id milestone-id voter))
)

(define-read-only (get-campaign-progress (campaign-id uint))
    (match (get-campaign-milestone-config campaign-id)
        config
            (ok {
                total-milestones: (get total-milestones config),
                completed-milestones: (get completed-milestones config),
                percentage-complete: (if (> (get total-milestones config) u0)
                    (/ (* (get completed-milestones config) u100) (get total-milestones config))
                    u0
                ),
                total-allocated: (get total-allocated config),
                total-released: (get total-released config)
            })
        ERR-CAMPAIGN-NOT-FOUND
    )
)

;; Public functions

(define-public (initialize-milestone-campaign (campaign-id uint))
    (begin
        (map-set campaign-milestone-config campaign-id {
            total-milestones: u0,
            completed-milestones: u0,
            total-allocated: u0,
            total-released: u0,
            milestone-enabled: true
        })
        (ok true)
    )
)

(define-public (add-milestone 
    (campaign-id uint)
    (title (string-ascii 100))
    (description (string-utf8 500))
    (amount uint)
    (voting-duration uint)
)
    (let (
        (config (unwrap! (get-campaign-milestone-config campaign-id) ERR-CAMPAIGN-NOT-FOUND))
        (milestone-id (+ (get total-milestones config) u1))
    )
        ;; Validate
        (asserts! (> amount u0) ERR-INVALID-AMOUNT)
        (asserts! (> voting-duration u0) ERR-INVALID-VOTING-PERIOD)
        
        ;; Create milestone
        (map-set milestones 
            { campaign-id: campaign-id, milestone-id: milestone-id }
            {
                title: title,
                description: description,
                amount: amount,
                status: STATUS-PENDING,
                created-at: stacks-block-height,
                voting-deadline: (+ stacks-block-height voting-duration),
                released-at: none,
                creator: tx-sender
            }
        )
        
        ;; Update config
        (map-set campaign-milestone-config campaign-id
            (merge config {
                total-milestones: milestone-id,
                total-allocated: (+ (get total-allocated config) amount)
            })
        )
        
        (ok milestone-id)
    )
)