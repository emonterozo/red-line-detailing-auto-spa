import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

import { RewardType, VehicleType } from "@/lib/enums";
import Service, { TServiceDoc } from "./Service";

export type TMilestoneReward = InferSchemaType<typeof milestoneRewardSchema>;
export type TMilestoneRewardDoc = HydratedDocument<TMilestoneReward>;

export type MilestoneRewardWithPopulatedData = Omit<
  TMilestoneRewardDoc,
  "service_id" | "reward_service_id"
> & {
  service_id: TServiceDoc;
  reward_service_id: TServiceDoc;
};

const milestoneRewardSchema = new Schema(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: Service.modelName,
      required: true,
    },
    vehicle_type: { type: String, enum: VehicleType, required: true },
    required_progress_count: { type: Number, required: true },
    reward_type: { type: String, enum: RewardType, required: true },
    discount_percentage: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 },
    reward_service_id: {
      type: Schema.Types.ObjectId,
      ref: Service.modelName,
      required: true,
    },
    is_active: { type: Boolean, default: true, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: "milestone_rewards",
  },
);

const MilestoneReward =
  models.MilestoneReward || model("MilestoneReward", milestoneRewardSchema);

export default MilestoneReward;
