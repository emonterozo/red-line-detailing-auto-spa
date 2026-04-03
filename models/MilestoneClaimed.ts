import { Schema, model, models } from "mongoose";

import VehicleSize from "./VehicleSize";
import Service from "./Service";
import Customer from "./Customer";
import Transaction from "./Transaction";

const milestoneClaimedSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: Customer.modelName,
      required: true,
    },
    service_id: {
      type: Schema.Types.ObjectId,
      ref: Service.modelName,
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: Transaction.modelName,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    size_id: {
      type: Schema.Types.ObjectId,
      ref: VehicleSize.modelName,
      required: true,
    },
    vehicle_model: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    claimed_at: { type: Date, default: new Date() },
  },
  {
    collection: "milestone_claimed",
  },
);

const MilestoneClaimed =
  models.MilestoneClaimed || model("MilestoneClaimed", milestoneClaimedSchema);

export default MilestoneClaimed;
