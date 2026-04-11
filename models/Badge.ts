import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";
import { CustomerBadge } from "@/lib/enums";

export type TBadge = InferSchemaType<typeof badgeSchema>;
export type TBadgeDoc = HydratedDocument<TBadge>;

const badgeSchema = new Schema({
  title: { type: String, enum: CustomerBadge, required: true },
  count: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
});

const Badge = models.Badge || model("Badge", badgeSchema);

export default Badge;
