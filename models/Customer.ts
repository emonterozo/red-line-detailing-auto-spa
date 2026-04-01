import { Schema, Types, model, models } from "mongoose";

import VehicleSize from "./VehicleSize";
import Service from "./Service";

const milestoneCountSchema = new Schema({
  _id: { type: Types.ObjectId },
  size_id: {
    type: Schema.Types.ObjectId,
    ref: VehicleSize.modelName,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
});

const milestoneClaimedSchema = new Schema({
  _id: { type: Types.ObjectId },
  service_id: {
    type: Schema.Types.ObjectId,
    ref: Service.modelName,
    required: true,
  },
  size_id: {
    type: Schema.Types.ObjectId,
    ref: VehicleSize.modelName,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  claimed_at: {
    type: Date,
    required: true,
  },
});

const customerSchema = new Schema({
  name: { type: String, required: true },
  contact_number: { type: String, required: true },
  social: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  is_temp_password_change: { type: String, default: false },
  earned_points: { type: Number, default: 0 },
  milestone_count: {
    type: [milestoneCountSchema],
    required: true,
  },
  milestone_claimed: {
    type: [milestoneClaimedSchema],
    required: true,
  },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Customer = models.Customer || model("Customer", customerSchema);

export default Customer;
