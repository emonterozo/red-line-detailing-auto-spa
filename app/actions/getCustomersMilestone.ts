"use server";

import connect from "@/lib/db/mongodb";
import { VehicleSize, VehicleType } from "@/lib/enums";

import Customer, { TCustomer, TCustomerDoc } from "@/models/Customer";
import { TVehicleSize } from "@/models/VehicleSize";
import { Types } from "mongoose";

const CUSTOMER_FIELDS: (keyof TCustomer)[] = [
  "name",
  "earned_points",
  "milestone_count",
];

const MILESTONE_VEHICLE_SIZE_FIELDS: (keyof TVehicleSize)[] = [
  "size",
  "type",
  "sort_order",
];

export type CustomerMilestoneResponse = Pick<
  TCustomer,
  "name" | "earned_points"
> & {
  _id: string;
  milestone_count: {
    _id: string;
    size_id: Pick<TVehicleSize, "size" | "type" | "sort_order"> & {
      _id: string;
    };
    progress: number;
  }[];
};

type CustomerDoc = Pick<TCustomerDoc, "_id" | "earned_points" | "name"> & {
  milestone_count: {
    _id: Types.ObjectId;
    size_id: {
      _id: Types.ObjectId;
      size: VehicleSize;
      type: VehicleType;
      sort_order: number;
    };
    progress: number;
  }[];
};

export const getCustomersMilestone = async (
  name?: string,
): Promise<CustomerMilestoneResponse[]> => {
  await connect();

  let query: Record<string, unknown> = {};

  if (name) {
    const parts = name.trim().split(/\s+/);
    query = {
      $and: parts.map((part) => ({
        name: { $regex: part, $options: "i" },
      })),
    };
  }

  const customerDoc: CustomerDoc[] = await Customer.find(query)
    .limit(5)
    .select(CUSTOMER_FIELDS.join(" "))
    .populate(
      "milestone_count.size_id",
      MILESTONE_VEHICLE_SIZE_FIELDS.join(" "),
    )
    .lean();

  const customerJson = customerDoc.map((customer) => ({
    _id: customer._id.toString(),
    name: customer.name,
    earned_points: customer.earned_points,
    milestone_count: [...customer.milestone_count]
      .sort((a, b) => a.size_id.sort_order - b.size_id.sort_order)
      .map((count) => ({
        _id: count._id.toString(),
        size_id: {
          _id: count.size_id._id.toString(),
          size: count.size_id.size,
          type: count.size_id.type,
          sort_order: count.size_id.sort_order
        },
        progress: count.progress,
      })),
  }));

  return customerJson;
};
