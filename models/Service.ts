import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

import { ServiceType } from "@/lib/enums";
import VehicleSize, { TVehicleSizeDoc } from "./VehicleSize";

export type TService = InferSchemaType<typeof serviceSchema>;
export type TServiceDoc = HydratedDocument<TService>;

export type ServiceWithPopulatedData = Omit<
  TServiceDoc,
  "pricing_per_sizes"
> & {
  pricing_per_sizes: {
    size_id: TVehicleSizeDoc;
    price: number;
    _id: Types.ObjectId;
  }[];
};

const pricingPerSizeSchema = new Schema({
  size_id: {
    type: Schema.Types.ObjectId,
    ref: VehicleSize.modelName,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});
const serviceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ServiceType, required: true },
  pricing_options: { type: String, default: null },
  price: { type: Number, default: 0, required: true },
  pricing_per_sizes: {
    type: [pricingPerSizeSchema],
    required: true,
  },
  is_available: { type: Boolean, required: true },
  notes: { type: String, required: true },
  sort_order: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Service = models.Service || model("Service", serviceSchema);

export default Service;
