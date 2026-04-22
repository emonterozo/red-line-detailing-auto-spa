"use server";

import connect from "@/lib/db/mongodb";
import Transaction, {
  TTransaction,
  TTransactionDoc,
} from "@/models/Transaction";
import { Types } from "mongoose";

const TRANSACTION_TABLE_FIELDS: (keyof TTransaction)[] = [
  "vehicle_model",
  "net_total",
  "created_at",
];

export interface IPaginatedTransactions {
  data: CustomerTransactionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CustomerTransactionResponse = Pick<
  TTransaction,
  "vehicle_model" | "net_total" | "created_at"
> & {
  _id: string;
};

export const getTransactions = async (
  page: number = 1,
  limit: number = 10,
  customer_id?: string,
): Promise<IPaginatedTransactions> => {
  await connect();

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (customer_id && typeof customer_id === "string") {
    query.customer_id = new Types.ObjectId(customer_id);
  }

  const transactionsDoc: Pick<
    TTransactionDoc,
    "_id" | "vehicle_model" | "net_total" | "created_at"
  >[] = await Transaction.find(query)
    .select(TRANSACTION_TABLE_FIELDS.join(" "))
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const transactionsJson = transactionsDoc.map((transaction) => {
    return {
      _id: transaction._id.toString(),
      vehicle_model: transaction.vehicle_model,
      net_total: transaction.net_total,
      created_at: transaction.created_at,
    };
  });

  const total = await Transaction.countDocuments(query);

  return {
    data: transactionsJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
