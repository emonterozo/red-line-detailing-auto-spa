import { Schema, model, models } from "mongoose";

import { IPricingPerSize, IService } from "@/lib/db/types";
import { ServiceType } from "@/lib/enums";
import VehicleSize from "./VehicleSize";


const pricingPerSizeSchema = new Schema<IPricingPerSize>({
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
const serviceSchema = new Schema<IService>({
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
});

const Service = models.Service || model<IService>("Service", serviceSchema);

export default Service;
