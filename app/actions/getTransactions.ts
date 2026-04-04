"use server";

import connect from "@/lib/db/mongodb";
import { TransactionFrom, VehicleSize, VehicleType } from "@/lib/enums";
import Transaction from "@/models/Transaction";
import { Types } from "mongoose";

export interface ITransactionResponse {
  _id: string;
  customer: string;
  transaction_type: TransactionFrom;
  vehicle_model: string;
  vehicle_size: VehicleSize;
  vehicle_type: VehicleType;
  total_amount: number;
  total_discount: number;
  net_total: number;
  created_at: Date;
}

export interface IPaginatedTransactions {
  data: ITransactionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

  const transactionsDoc = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const transactionsJson = transactionsDoc.map((transaction) => {
    return {
      _id: transaction._id.toString(),
      customer: transaction.user_id ? "Member" : "Guest",
      transaction_type:
        transaction.transaction_from === TransactionFrom.WALK_IN
          ? TransactionFrom.WALK_IN
          : TransactionFrom.BOOKING,
      vehicle_model: transaction.vehicle_model,
      total_amount: transaction.total_amount,
      total_discount: transaction.total_discount,
      vehicle_size: transaction.vehicle_size,
      vehicle_type: transaction.vehicle_type,
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
