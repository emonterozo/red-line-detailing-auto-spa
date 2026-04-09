import { PromotionType } from "@/lib/enums";
import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";
import Service, { TServiceDoc } from "./Service";

export type TPromotion = InferSchemaType<typeof promotionSchema>;
export type TPromotionDoc = HydratedDocument<TPromotion>;

export type PromotionWithPopulatedData = Omit<TPromotionDoc, "service_ids"> & {
  service_ids: TServiceDoc[];
};

const promotionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: PromotionType, required: true },

  // Points-based promotions
  multiplier: { type: Number }, // e.g., 2 for double points
  fixed_points: { type: Number }, // give fixed points

  // Discount-based promotions
  discount_amount: { type: Number }, // fixed discount amount
  discount_percent: { type: Number }, // percentage discount

  // Service tie-in
  service_ids: [{ type: Schema.Types.ObjectId, ref: Service.modelName }], // optional, if only for certain services

  // Promo code (optional)
  promo_code: { type: String, unique: true, sparse: true },

  // Validity period
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },

  // Limits
  max_points_per_user: { type: Number, default: null }, // cap points a user can earn from this promo
  max_points_per_booking: { type: Number }, // cap points per booking
  maximum_claimed: { type: Number }, // total number of times promo can be claimed
  claimed_count: { type: Number, default: 0 }, // how many times it’s been used
  per_user_claim_limit: { type: Number }, // limit per user for promo code usage

  stackable: { type: Boolean, default: false }, // can it be combined with other promotions?
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Promotion = models.Promotion || model("Promotion", promotionSchema);

export default Promotion;
