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
  plate_number: { type: String, default: null },
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
  discount_type: {
    type: String,
    enum: [...Object.values(DiscountType), ""],
    default: "",
  },
  notes: { type: String, default: null },
  reservation_fee: { type: Number, default: 0, required: true },
  total_service_amount: { type: Number, default: 0, required: true },
  additional_cost: { type: Number, default: 0, required: true },
  points: {
    total: { type: Number, default: 0 },
    service: { type: Number, default: 0 },
    referral: { type: Number, default: 0 },
    badge: { type: Number, default: 0 },
  },
  travel_fee: { type: Number, default: 0, required: true },
  discount: { type: Number, default: 0, required: true },
  points_used: { type: Number, default: 0, required: true },
  net_total: { type: Number, default: 0, required: true },
  gross_total: { type: Number, default: 0, required: true },
  total_discount: { type: Number, default: 0, required: true },
  promotion_id: {
    type: Schema.Types.ObjectId,
    ref: Promotion.modelName,
    default: null,
  },
  promo_code_used: { type: String, default: null },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Transaction =
  models.Transaction || model("Transaction", transactionSchema);

export default Transaction;
