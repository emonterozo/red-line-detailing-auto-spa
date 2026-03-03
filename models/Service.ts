import { Schema, model, models } from "mongoose";

import { IPricingPerSize, IService } from "@/lib/db/types";
import { ServiceType } from "@/lib/enums";

const serviceSchema = new Schema<IService>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ServiceType, required: true },
  pricing_options: { type: String, default: null, },
  price: { type: Number, default: 0, required: true },
  pricing_per_sizes: {
    type: [
      new Schema<IPricingPerSize>({
        size: { type: String, required: true },
        vehicle: { type: String, required: true },
        price: { type: Number, required: true }
      })
    ],
    required: true
  },
});

const Service = models.Service || model<IService>('Service', serviceSchema);

export default Service;