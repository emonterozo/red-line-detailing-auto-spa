"use server";

import connect from "@/lib/db/mongodb";
import { IMilestoneReward } from "@/lib/db/types";

import MilestoneReward from "@/models/MilestoneReward";

export interface IMilestoneRewardResponse extends Pick<
  IMilestoneReward,
  "required_progress_count" | "discount_percentage" | "discount_amount" | "reward_type" | "vehicle_type"
> {
  _id: string;
  service_id: string;
  service: string;
}

export const getMilestoneRewards = async () => {
  await connect();

  const milestoneRewardsDoc = await MilestoneReward.find({
    is_active: true,
  })
    .populate("service_id")
    .populate("reward_service_id")
    .lean();

  const milestoneRewardsJson = milestoneRewardsDoc.map((milestoneReward) => {
    return {
      _id: milestoneReward._id.toString(),
      vehicle_type: milestoneReward.vehicle_type,
      service_id: milestoneReward.reward_service_id._id.toString(),
      service: milestoneReward.reward_service_id.title,
      required_progress_count: milestoneReward.required_progress_count,
      discount_percentage: milestoneReward.discount_percentage,
      discount_amount: milestoneReward.discount_amount,
      reward_type: milestoneReward.reward_type,
    };
  });

  return milestoneRewardsJson;
};
