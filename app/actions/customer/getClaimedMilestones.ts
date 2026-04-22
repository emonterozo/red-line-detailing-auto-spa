"use server";

import connect from "@/lib/db/mongodb";
import MilestoneClaimed, {
  TMilestoneClaimed,
  TMilestoneClaimedDoc,
} from "@/models/MilestoneClaimed";
import { TService, TServiceDoc } from "@/models/Service";
import { Types } from "mongoose";

export type ClaimedMilestoneResponse = Pick<
  TMilestoneClaimed,
  "vehicle_model" | "discount" | "created_at"
> & {
  _id: string;
  service_id: Pick<TService, "title"> & {
    _id: string;
  };
};

export interface IPaginatedMilestones {
  data: ClaimedMilestoneResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ClaimedMilestoneDoc = Pick<
  TMilestoneClaimedDoc,
  "_id" | "vehicle_model" | "discount" | "created_at"
> & {
  service_id: Pick<TServiceDoc, "_id" | "title">;
};

export const getClaimedMilestones = async (
  customer_id: string,
  page: number = 1,
  limit: number = 2,
): Promise<IPaginatedMilestones> => {
  await connect();

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (customer_id && typeof customer_id === "string") {
    query.customer_id = new Types.ObjectId(customer_id);
  }

  const claimedMilestonesDoc: ClaimedMilestoneDoc[] =
    await MilestoneClaimed.find(query)
      .select("vehicle_model discount created_at")
      .populate("service_id", "title")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

  const milestonesJson: ClaimedMilestoneResponse[] = claimedMilestonesDoc.map(
    (item) => ({
      ...item,
      _id: item._id.toString(),
      service_id: {
        ...item.service_id,
        _id: item.service_id._id.toString(),
      },
    }),
  );

  const total = await MilestoneClaimed.countDocuments(query);

  return {
    data: milestonesJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
