"use server";

import connect from "@/lib/db/mongodb";

import MilestoneReward, {
  TMilestoneReward,
  TMilestoneRewardDoc,
} from "@/models/MilestoneReward";
import { TService, TServiceDoc } from "@/models/Service";

const MILESTONE_REWARD_FIELDS: (keyof TMilestoneReward)[] = [
  "required_progress_count",
  "reward_type",
  "discount_percentage",
  "discount_amount",
  "vehicle_type",
];

export type MilestoneRewardsResponse = Omit<
  TMilestoneReward,
  | "_id"
  | "service_id"
  | "reward_service_id"
  | "is_active"
  | "created_at"
  | "updated_at"
> & {
  _id: string;
  service_id: Pick<TService, "title"> & {
    _id: string;
  };
  reward_service_id: Pick<TService, "title"> & {
    _id: string;
  };
};

type MilestoneRewardsDoc = Pick<
  TMilestoneRewardDoc,
  | "_id"
  | "required_progress_count"
  | "reward_type"
  | "discount_percentage"
  | "discount_amount"
  | "vehicle_type"
> & {
  service_id: Pick<TServiceDoc, "_id" | "title">;
  reward_service_id: Pick<TServiceDoc, "_id" | "title">;
};

export const getMilestoneRewards = async (): Promise<
  MilestoneRewardsResponse[]
> => {
  await connect();

  const milestoneRewardsDoc: MilestoneRewardsDoc[] = await MilestoneReward.find(
    {
      is_active: true,
    },
  )
    .select(MILESTONE_REWARD_FIELDS.join(" "))
    .populate("service_id", "title")
    .populate("reward_service_id", "title")
    .lean();

  const milestoneRewardsJson = milestoneRewardsDoc.map((milestoneReward) => {
    return {
      ...milestoneReward,
      _id: milestoneReward._id.toString(),
      service_id: {
        ...milestoneReward.service_id,
        _id: milestoneReward.service_id._id.toString(),
      },
      reward_service_id: {
        ...milestoneReward.reward_service_id,
        _id: milestoneReward.reward_service_id._id.toString(),
      },
    };
  });
  return milestoneRewardsJson;
};
