import { Schema, Types, model, models } from "mongoose";

import { IMilestoneReward } from "@/lib/db/types";
import { RewardType } from "@/lib/enums";
import Service from "./Service";

const milestoneRewardSchema = new Schema<IMilestoneReward>(
  {
    service_id: {
      type: Types.ObjectId,
      ref: Service.modelName,
      required: true,
    },
    required_progress_count: { type: Number, required: true },
    reward_type: { type: String, enum: RewardType, required: true },
    discount_percentage: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 },
    reward_service_id: {
      type: Types.ObjectId,
      ref: Service.modelName,
      required: true,
    },
    is_active: { type: Boolean, required: true },
  },
  {
    collection: "milestone_rewards",
  },
);

const MilestoneReward =
  models.MilestoneReward || model<IMilestoneReward>("MilestoneReward", milestoneRewardSchema);

export default MilestoneReward;
