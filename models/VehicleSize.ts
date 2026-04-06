import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";
import { VehicleType, VehicleSize as EVehicleSize } from "@/lib/enums";

export type TVehicleSize = InferSchemaType<typeof vehicleSizeSchema>;
export type TVehicleSizeDoc = HydratedDocument<TVehicleSize>;

const vehicleSizeSchema = new Schema(
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
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: "vehicle_sizes",
  },
);

const VehicleSize =
  models.VehicleSize || model("VehicleSize", vehicleSizeSchema);

export default VehicleSize;
