import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";
import Promotion from "./Promotion";
import Customer from "./Customer";
import Booking from "./Booking";

const promotionUsageSchema = new Schema(
  {
    promotion_id: {
      type: Schema.Types.ObjectId,
      ref: Promotion.modelName,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: Customer.modelName,
      required: true,
    },
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: Booking.modelName,
      required: true,
    },
    discount_applied: { type: Number },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: "promotion_usage",
  },
);

export type TPromotionUsage = InferSchemaType<typeof promotionUsageSchema>;
export type TPromotionUsageDoc = HydratedDocument<TPromotionUsage>;

const PromotionUsage =
  models.PromotionUsage || model("PromotionUsage", promotionUsageSchema);
export default PromotionUsage;
