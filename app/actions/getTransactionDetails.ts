"use server";

import connect from "@/lib/db/mongodb";
import Transaction, {
  TTransaction,
  TTransactionDoc,
} from "@/models/Transaction";
const TRANSACTION_FIELDS: (keyof TTransaction)[] = [
  "vehicle_model",
  "services",
  "travel_fee",
  "gross_total",
  "total_discount",
  "net_total",
  "points_used",
  "points",
  "created_at",
];

type TransactionDoc = Pick<
  TTransactionDoc,
  | "_id"
  | "vehicle_model"
  | "services"
  | "points"
  | "travel_fee"
  | "points_used"
  | "net_total"
  | "gross_total"
  | "total_discount"
  | "created_at"
>;

export type TransactionResponse = Pick<
  TTransaction,
  | "vehicle_model"
  | "points"
  | "travel_fee"
  | "points_used"
  | "net_total"
  | "gross_total"
  | "total_discount"
  | "created_at"
> & {
  _id: string;
  services: { _id: string; title: string; price: number; discount: number }[];
};

export const getTransactionDetails = async (
  transaction_id: string,
): Promise<TransactionResponse | null> => {
  await connect();

  const transactionDoc: TransactionDoc = await Transaction.findById(
    transaction_id,
  )
    .select(TRANSACTION_FIELDS.join(" "))
    .lean();

  if (!transactionDoc) return null;

  const services = transactionDoc.services.map((item) => ({
    _id: item._id?.toString() as string,
    title: item.title,
    price: item.price,
    discount: item.discount,
  }));

  return {
    ...transactionDoc,
    _id: transactionDoc._id.toString(),
    services,
  };
};
