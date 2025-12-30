;; Campaign Smart Contract
;; Manages crowdfunding campaigns with all-or-nothing funding model

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-CAMPAIGN-NOT-FOUND (err u101))
(define-constant ERR-CAMPAIGN-ENDED (err u102))
(define-constant ERR-CAMPAIGN-ACTIVE (err u103))
(define-constant ERR-GOAL-NOT-MET (err u104))
(define-constant ERR-GOAL-MET (err u105))
(define-constant ERR-INVALID-AMOUNT (err u106))
(define-constant ERR-INVALID-DEADLINE (err u107))
(define-constant ERR-INVALID-GOAL (err u108))
(define-constant ERR-TRANSFER-FAILED (err u109))
(define-constant ERR-ALREADY-CLAIMED (err u110))
(define-constant ERR-CAMPAIGN-CANCELLED (err u111))
(define-constant ERR-NO-CONTRIBUTION (err u112))

;; Campaign status constants
(define-constant STATUS-ACTIVE u1)
(define-constant STATUS-SUCCESSFUL u2)
(define-constant STATUS-FAILED u3)
(define-constant STATUS-CANCELLED u4)

;; Data variables
(define-data-var campaign-nonce uint u0)

;; Data maps
(define-map campaigns
    uint
    {
        creator: principal,
        title: (string-ascii 100),
        description: (string-utf8 500),
        goal: uint,
        raised: uint,
        deadline: uint,
        status: uint,
        created-at: uint,
        claimed: bool,
        milestone-enabled: bool
    }
)

(define-map campaign-metadata
    uint
    {
        image-url: (string-utf8 256),
        category: (string-ascii 50),
        video-url: (optional (string-utf8 256))
    }
)

(define-map contributions
    { campaign-id: uint, contributor: principal }
    { amount: uint, timestamp: uint }
)

(define-map total-contributions
    uint
    { count: uint, total: uint }
)

;; Private functions

(define-private (is-campaign-active (campaign-id uint))
    (let ((campaign (unwrap! (map-get? campaigns campaign-id) false)))
        (and 
            (is-eq (get status campaign) STATUS-ACTIVE)
            (< stacks-block-height (get deadline campaign))
        )
    )
)

(define-private (is-campaign-ended (campaign-id uint))
    (let ((campaign (unwrap! (map-get? campaigns campaign-id) false)))
        (>= stacks-block-height (get deadline campaign))
    )
)

(define-private (has-goal-met (campaign-id uint))
    (let ((campaign (unwrap! (map-get? campaigns campaign-id) false)))
        (>= (get raised campaign) (get goal campaign))
    )
)

(define-private (update-campaign-status (campaign-id uint))
    (let (
        (campaign (unwrap! (map-get? campaigns campaign-id) false))
    )
        (if (and (is-campaign-ended campaign-id) (is-eq (get status campaign) STATUS-ACTIVE))
            (begin
                (if (has-goal-met campaign-id)
                    (map-set campaigns campaign-id (merge campaign { status: STATUS-SUCCESSFUL }))
                    (map-set campaigns campaign-id (merge campaign { status: STATUS-FAILED }))
                )
                true
            )
            true
        )
    )
)

;; Read-only functions

(define-read-only (get-campaign (campaign-id uint))
    (map-get? campaigns campaign-id)
)

(define-read-only (get-campaign-metadata (campaign-id uint))
    (map-get? campaign-metadata campaign-id)
)