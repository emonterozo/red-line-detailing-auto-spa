import { Schema, model, models } from "mongoose";

import { IVehicleSize } from "@/lib/db/types";
import { VehicleType, VehicleSize as EVehicleSize } from "@/lib/enums";

const vehicleSizeSchema = new Schema<IVehicleSize>(
  {
    type: {
      type: String,
      enum: VehicleType,
      required: true,
    },
    size: {
      type: String,
      enum: EVehicleSize,
      required: true,
    },
    description: { type: String, required: true },
    sort_order: { type: Number, required: true },
    is_active: { type: Boolean, required: true },
  },
  {
    collection: "vehicle_sizes",
  },
);

const VehicleSize =
  models.VehicleSize || model<IVehicleSize>("VehicleSize", vehicleSizeSchema);

export default VehicleSize;
