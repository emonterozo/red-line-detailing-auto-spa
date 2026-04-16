"use server";

import connect from "@/lib/db/mongodb";
import Customer, { TCustomer, TCustomerDoc } from "@/models/Customer";

const CUSTOMER_TABLE_FIELDS: (keyof TCustomer)[] = [
  "name",
  "contact_number",
  "email",
  "created_at",
  "is_verify",
];

export type CustomerTableResponse = Pick<
  TCustomer,
  "name" | "contact_number" | "email" | "created_at" | "is_verify"
> & {
  _id: string;
};

export interface IPaginatedCustomers {
  data: CustomerTableResponse[];
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

  const skip = (page - 1) * limit;

  const customerDoc: Pick<
    TCustomerDoc,
    "_id" | "name" | "contact_number" | "email" | "created_at" | "is_verify"
  >[] = await Customer.find({})
    .select(CUSTOMER_TABLE_FIELDS.join(" "))
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const customersJson = customerDoc.map((customer) => ({
    ...customer,
    _id: customer._id.toString(),
  }));

  const total = await Customer.countDocuments();

  return {
    data: customersJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
