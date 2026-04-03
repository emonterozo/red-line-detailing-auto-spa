"use server";

import connect from "@/lib/db/mongodb";
import Customer from "@/models/Customer";

export interface ICustomerResponse {
  _id: string;
  name: string;
  contact_number: string;
  email: string;
  created_at: Date;
  is_verify: boolean
}

export interface IPaginatedCustomers {
  data: ICustomerResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getCustomerList = async (
  page: number = 1,
  limit: number = 2,
): Promise<IPaginatedCustomers> => {
  await connect();

  // Calculate how many documents to skip
  const skip = (page - 1) * limit;

  // Fetch paginated inquiries
  const customerDoc = (await Customer.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()) as unknown as ICustomerResponse[];

  // Convert _id to string
  const customersJson: ICustomerResponse[] = customerDoc.map((customer) => ({
    _id: customer._id.toString(),
    name: customer.name,
    contact_number: customer.contact_number,
    email: customer.email,
    is_verify: customer.is_verify,
    created_at: customer.created_at,
  }));

  // Get total count for pagination info
  const total = await Customer.countDocuments();

  return {
    data: customersJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
