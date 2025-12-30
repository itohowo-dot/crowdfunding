import mongoose, { Schema, model, models } from 'mongoose';

// Campaign Model
const CampaignSchema = new Schema({
  campaignId: { type: Number, required: true, unique: true },
  creator: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  goal: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  deadline: { type: Number, required: true },
  status: { type: Number, default: 1 }, // 1: active, 2: successful, 3: failed, 4: cancelled
  milestoneEnabled: { type: Boolean, default: false },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, default: Date.now },
  backerCount: { type: Number, default: 0 },
  category: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String },
}, { timestamps: true });

// Contribution Model
const ContributionSchema = new Schema({
  campaignId: { type: Number, required: true, index: true },
  contributor: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  txId: { type: String, required: true, unique: true },
  blockHeight: { type: Number, required: true },
  rewardTier: { type: Number }, // 0: bronze, 1: silver, 2: gold, 3: platinum
  refunded: { type: Boolean, default: false },
}, { timestamps: true });

// Milestone Model
const MilestoneSchema = new Schema({
  campaignId: { type: Number, required: true, index: true },
  milestoneId: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: Number, default: 0 }, // 0: pending, 1: voting, 2: approved, 3: rejected, 4: released
  createdAt: { type: Number, required: true },
  votingDeadline: { type: Number },
  releasedAt: { type: Number },
  yesVotes: { type: Number, default: 0 },
  noVotes: { type: Number, default: 0 },
  totalVoters: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

// Vote Model
const VoteSchema = new Schema({
  campaignId: { type: Number, required: true, index: true },
  milestoneId: { type: Number, required: true, index: true },
  voter: { type: String, required: true, index: true },
  vote: { type: Boolean, required: true },
  votingPower: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  txId: { type: String, required: true, unique: true },
}, { timestamps: true });

// Refund Model
const RefundSchema = new Schema({
  campaignId: { type: Number, required: true, index: true },
  contributor: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  txId: { type: String, required: true, unique: true },
  blockHeight: { type: Number, required: true },
}, { timestamps: true });

// Event Log Model (for debugging and analytics)
const EventLogSchema = new Schema({
  eventType: { type: String, required: true, index: true },
  campaignId: { type: Number, index: true },
  txId: { type: String, required: true, index: true },
  blockHeight: { type: Number, required: true },
  sender: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  processedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Export models
export const Campaign = models.Campaign || model('Campaign', CampaignSchema);
export const Contribution = models.Contribution || model('Contribution', ContributionSchema);
export const Milestone = models.Milestone || model('Milestone', MilestoneSchema);
export const Vote = models.Vote || model('Vote', VoteSchema);
export const Refund = models.Refund || model('Refund', RefundSchema);
export const EventLog = models.EventLog || model('EventLog', EventLogSchema);
