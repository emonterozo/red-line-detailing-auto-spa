import { HydratedDocument, InferSchemaType, Schema, model, models } from "mongoose";
import Customer, { TCustomerDoc } from "./Customer";
import Promotion from "./Promotion";
import Booking, { TBookingDoc } from "./Booking";
import Transaction, { TTransactionDoc } from "./Transaction";
import Service from "./Service";
import { TVehicleSizeDoc } from "./VehicleSize";

export type TPromotionHistory = InferSchemaType<typeof promotionHistorySchema>;
export type TPromotionHistoryDoc = HydratedDocument<TPromotionHistory>;

export type PromotionWithPopulatedData = Omit<
  TPromotionHistoryDoc,
  "customer_id" | "size_id" | "promotion_id" | "booking_id" | "transaction_id"
> & {
  customer_id: TCustomerDoc;
  size_id: TVehicleSizeDoc;
  promotion_id: TPromotionHistoryDoc;
  booking_id: TBookingDoc;
  transaction_id: TTransactionDoc
};




const promotionHistorySchema = new Schema({
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: Customer.modelName,
    required: true,
  },
  promotion_id: {
    type: Schema.Types.ObjectId,
    ref: Promotion.modelName,
    required: true,
  },

  // Link to booking/transaction
  booking_id: { type: Schema.Types.ObjectId, ref: Booking.modelName }, // optional for walk-in
  transaction_id: {
    type: Schema.Types.ObjectId,
    ref: Transaction.modelName,
    required: true,
  },

  // Services affected by the promotion (optional if promo is service-specific)
  service_ids: [{ type: Schema.Types.ObjectId, ref: Service.modelName }],

  // Promotion results
  points_earned: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  promo_code_used: { type: String, default: null },

  // Optional notes
  note: { type: String, default: null },

  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const PromotionHistory =
  models.PromotionHistory || model("PromotionHistory", promotionHistorySchema);

export default PromotionHistory;
