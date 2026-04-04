"use server";

import connect from "@/lib/db/mongodb";
import MilestoneClaimed from "@/models/MilestoneClaimed";
import { Types } from "mongoose";

export interface IMilestonesResponse {
  _id: string;
  service: string;
  vehicle_model: string;
  vehicle_size: string;
  vehicle_type: string;
  price: number;
  discount: number;
  claimed_at: Date;
}

export interface IPaginatedMilestones {
  data: IMilestonesResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getCustomerMilestones = async (
  user_id: string,
  page: number = 1,
  limit: number = 2,
): Promise<IPaginatedMilestones> => {
  await connect();

  // Calculate how many documents to skip
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (user_id && typeof user_id === "string") {
    query.user_id = new Types.ObjectId(user_id);
  }

  // Fetch paginated inquiries
  const claimedMilestonesDoc = await MilestoneClaimed.find(query)
    .populate("service_id")
    .populate("size_id")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    

  // Convert _id to string
  const milestonesJson: IMilestonesResponse[] = claimedMilestonesDoc.map(
    (item) => ({
      _id: item._id.toString(),
      service: item.service_id.title,
      vehicle_size: item.size_id.size,
      vehicle_type: item.size_id.type,
      vehicle_model: item.vehicle_model,
      price: item.price,
      discount: item.discount,
      claimed_at: item.claimed_at,
    }),
  );

  // Get total count for pagination info
  const total = await MilestoneClaimed.countDocuments(query);

  return {
    data: milestonesJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
