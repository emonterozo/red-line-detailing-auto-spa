"use server";

import connect from "@/lib/db/mongodb";
import MilestoneClaimed, {
  TMilestoneClaimedDoc,
} from "@/models/MilestoneClaimed";
import Transaction, {
  TTransaction,
  TTransactionDoc,
} from "@/models/Transaction";
import { Types } from "mongoose";

const TRANSACTION_FIELDS: (keyof TTransaction)[] = [
  "customer_id",
  "vehicle_type",
  "vehicle_size",
  "vehicle_model",
  "services",
  "travel_fee",
  "reservation_fee",
  "total_service_amount",
  "additional_cost",
  "discount",
  "points_used",
  "discount_type",
  "notes",
  "plate_number",
];

type TransactionDoc = Pick<
  TTransactionDoc,
  | "_id"
  | "customer_id"
  | "vehicle_type"
  | "vehicle_size"
  | "vehicle_model"
  | "plate_number"
  | "services"
  | "discount_type"
  | "notes"
  | "reservation_fee"
  | "total_service_amount"
  | "additional_cost"
  | "travel_fee"
  | "discount"
  | "points_used"
>;

export type TransactionResponse = Pick<
  TTransaction,
  | "vehicle_type"
  | "vehicle_size"
  | "vehicle_model"
  | "plate_number"
  | "discount_type"
  | "notes"
  | "reservation_fee"
  | "total_service_amount"
  | "additional_cost"
  | "travel_fee"
  | "discount"
  | "points_used"
> & {
  _id: string;
  customer_id: string | null;
  services: string[];
  milestone_reward: {
    _id: string;
    service_id: string;
    discount: number;
    price: number;
  } | null;
};

export const getTransaction = async (
  transaction_id: string,
): Promise<TransactionResponse | null> => {
  await connect();

  const transactionDoc: TransactionDoc = await Transaction.findById(
    transaction_id,
  )
    .select(TRANSACTION_FIELDS.join(" "))
    .lean();

  if (!transactionDoc) return null;

  let milestone_reward = null;
  if (transactionDoc.customer_id) {
    const milestoneClaimed: Pick<
      TMilestoneClaimedDoc,
      "reward_id" | "service_id" | "discount" | "price"
    > = await MilestoneClaimed.findOne({
      transaction_id: new Types.ObjectId(transaction_id),
    })
      .select("reward_id service_id discount price")
      .lean();

    if (milestoneClaimed) {
      milestone_reward = {
        _id: milestoneClaimed.reward_id.toString(),
        service_id: milestoneClaimed.service_id.toString(),
        discount: milestoneClaimed.discount,
        price: milestoneClaimed.price,
      };
    }
  }

  const all_services = transactionDoc.services.map(
    (item) => item._id?.toString() ?? "",
  );

  const services = milestone_reward
    ? all_services.filter((item) => item !== milestone_reward.service_id)
    : all_services;

  const formattedTransaction = {
    ...transactionDoc,
    _id: transactionDoc._id.toString(),
    customer_id: transactionDoc.customer_id?.toString() ?? null,
    services,
    milestone_reward,
  };

  return formattedTransaction;
};
