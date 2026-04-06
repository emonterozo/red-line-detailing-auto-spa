import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

import {
  VehicleType,
  VehicleSize,
  TransactionFrom,
  DiscountType,
} from "@/lib/enums";
import Customer, { TCustomerDoc } from "./Customer";
import Booking, { TBookingDoc } from "./Booking";
import Promotion, { TPromotionDoc } from "./Promotion";

export type TTransaction = InferSchemaType<typeof transactionSchema>;
export type TTransactionDoc = HydratedDocument<TTransaction>;

export type TransactionWithPopulatedData = Omit<
  TTransactionDoc,
  "customer_id" | "booking_id" | "promotion_id"
> & {
  customer_id: TCustomerDoc;
  booking_id: TBookingDoc;
  promotion_id: TPromotionDoc;
};

const transactionSchema = new Schema({
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: Customer.modelName,
    default: null,
  },
  booking_id: {
    type: Schema.Types.ObjectId,
    ref: Booking.modelName,
    default: null,
  },
  transaction_from: {
    type: String,
    enum: TransactionFrom,
    required: true,
  },
  vehicle_type: {
    type: String,
    enum: VehicleType,
    required: true,
  },
  vehicle_size: {
    type: String,
    enum: VehicleSize,
    required: true,
  },
  vehicle_model: { type: String, required: true },
  services: {
    type: [
      new Schema({
        _id: { type: Types.ObjectId },
        title: { type: String, required: true },
        price: { type: Number, required: true },
      }),
    ],
    required: true,
  },
  travel_fee: { type: Number, default: 0, required: true },
  total_amount: { type: Number, default: 0, required: true },
  total_discount: { type: Number, default: 0, required: true },
  net_total: { type: Number, default: 0, required: true },
  total_amount_paid: { type: Number, default: 0, required: true },
  points_used: { type: Number, default: 0, required: true },
  points_earned: { type: Number, default: 0, required: true },
  discount_type: {
    type: String,
    enum: [...Object.values(DiscountType), ""],
    default: "",
  },
  notes: { type: String, default: null },
  plate_number: { type: String, default: null },
  referral_code_used: { type: String },
  promotion_id: { type: Schema.Types.ObjectId, ref: Promotion.modelName },
  promo_code_used: { type: String, default: null },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Transaction =
  models.Transaction || model("Transaction", transactionSchema);

export default Transaction;
