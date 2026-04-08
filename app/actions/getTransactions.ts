"use server";

import connect from "@/lib/db/mongodb";
import Transaction, {
  TTransaction,
  TTransactionDoc,
} from "@/models/Transaction";
import { Types } from "mongoose";

const TRANSACTION_TABLE_FIELDS: (keyof TTransaction)[] = [
  "customer_id",
  "transaction_from",
  "vehicle_type",
  "vehicle_size",
  "vehicle_model",
  "total_service_amount",
  "total_discount",
  "net_total",
  "created_at",
];

export interface IPaginatedTransactions {
  data: TransactionTableResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TransactionTableResponse = Pick<
  TTransaction,
  | "transaction_from"
  | "vehicle_type"
  | "vehicle_size"
  | "vehicle_model"
  | "total_service_amount"
  | "total_discount"
  | "net_total"
  | "created_at"
> & {
  _id: string;
  customer: string;
};

export const getTransactions = async (
  page: number = 1,
  limit: number = 10,
  user_id?: string,
): Promise<IPaginatedTransactions> => {
  await connect();

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (user_id && typeof user_id === "string") {
    query.user_id = new Types.ObjectId(user_id);
  }

  const transactionsDoc: Pick<
    TTransactionDoc,
    | "_id"
    | "customer_id"
    | "transaction_from"
    | "vehicle_type"
    | "vehicle_size"
    | "vehicle_model"
    | "total_service_amount"
    | "total_discount"
    | "net_total"
    | "created_at"
  >[] = await Transaction.find(query)
    .select(TRANSACTION_TABLE_FIELDS.join(" "))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const transactionsJson = transactionsDoc.map((transaction) => {
    return {
      _id: transaction._id.toString(),
      customer: transaction.customer_id ? "Member" : "Guest",
      transaction_from: transaction.transaction_from,
      vehicle_model: transaction.vehicle_model,
      vehicle_size: transaction.vehicle_size,
      vehicle_type: transaction.vehicle_type,
      total_service_amount: transaction.total_service_amount,
      total_discount: transaction.total_discount,
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
