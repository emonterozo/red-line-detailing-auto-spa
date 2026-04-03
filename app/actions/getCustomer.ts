"use server";

import connect from "@/lib/db/mongodb";
import { MilestoneCount } from "@/lib/db/types";
import Customer from "@/models/Customer";

export interface ICustomerResponse {
  _id: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  social: string;
  address: string;
  verify_at: Date;
  created_at: Date;
  is_verify: boolean;
  earned_points: number;
  milestone_count: MilestoneCount[];
}

export const getCustomer = async (
  id: string,
): Promise<ICustomerResponse | null> => {
  await connect();

  const customer = (await Customer.findById(id)
    .populate("milestone_count.size_id")
    .lean())

  if (!customer) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const milestone_count = customer.milestone_count.map((item: any) => ({
    _id: item._id.toString(),
    size_id: item.size_id._id.toString(),
    vehicle_type: item.size_id.type,
    vehicle_size: item.size_id.size,
    progress: item.progress,
  }));
  

  return {
    _id: customer._id.toString(),
    first_name: customer.first_name,
    last_name: customer.last_name,
    contact_number: customer.contact_number,
    email: customer.email,
    social: customer.social,
    address: customer.address,
    verify_at: customer.verify_at,
    created_at: customer.created_at,
    is_verify: customer.is_verify,
    earned_points: customer.earned_points,
    milestone_count
  };
};
