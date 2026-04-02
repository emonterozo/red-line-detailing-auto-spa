"use server";

import connect from "@/lib/db/mongodb";
import { VehicleSize, VehicleType } from "@/lib/enums";

import Customer from "@/models/Customer";

export interface IMilestoneCount {
  _id: string;
  vehicle: {
    _id: string;
    size: VehicleSize;
    type: VehicleType;
  };
  progress: number;
}

export interface ICustomerResponse {
  _id: string;
  name: string;
  earned_points: number;
  milestone_count: IMilestoneCount[];
}

export const getCustomers = async (name?: string) => {
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

  const customerDoc = await Customer.find(query)
    .limit(5)
    .populate("milestone_count.size_id")
    .lean();

  const customerJson = customerDoc.map((customer) => ({
    _id: customer._id.toString(),
    name: customer.name,
    earned_points: customer.earned_points,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    milestone_count: customer.milestone_count.map((count: any) => ({
      _id: count._id.toString(),
      vehicle: {
        _id: count.size_id._id.toString(),
        size: count.size_id.size,
        type: count.size_id.type,
      },
      progress: count.progress,
    })),
  })) as ICustomerResponse[];

  return customerJson;
};
