import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";
import Customer, { TCustomerDoc } from "./Customer";
import Promotion, { TPromotionDoc } from "./Promotion";

export type TCustomerPromotionUsage = InferSchemaType<
  typeof customerPromotionUsageSchema
>;
export type TCustomerPromotionUsageDoc =
  HydratedDocument<TCustomerPromotionUsage>;

export type CustomerWithPopulatedData = Omit<
  TCustomerPromotionUsageDoc,
  "customer_id" | "promotion_id"
> & {
  customer_id: TCustomerDoc;
  promotion_id: TPromotionDoc;
};

const customerPromotionUsageSchema = new Schema({
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
  claimed_count: { type: Number, default: 0 },
  points_earned: { type: Number, default: 0 },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const UserPromotionUsage =
  models.UserPromotionUsage ||
  model("UserPromotionUsage", customerPromotionUsageSchema);

export default UserPromotionUsage;
