import { PromotionType } from "@/lib/enums";
import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";
import Service from "./Service";

const promotionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  type: {
    type: String,
    enum: Object.values(PromotionType),
    required: true,
  },
  value: { type: Number, required: true },
  min_purchase_amount: { type: Number, default: 0 },
  service_ids: [{ type: Schema.Types.ObjectId, ref: Service.modelName }],
  promo_code: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
  usage_limit: {
    total: { type: Number, default: null },
    per_user: { type: Number, default: 1 },
  },
  current_usage_count: { type: Number, default: 0 },
  stackable: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export type TPromotion = InferSchemaType<typeof promotionSchema>;
export type TPromotionDoc = HydratedDocument<TPromotion>;

const Promotion = models.Promotion || model("Promotion", promotionSchema);
export default Promotion;
