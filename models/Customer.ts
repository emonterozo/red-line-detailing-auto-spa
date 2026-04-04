import { Schema, Types, model, models } from "mongoose";

import VehicleSize from "./VehicleSize";
import { boolean } from "zod";

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

const customerSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact_number: { type: String, required: true },
  social: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  is_verify: { type: Boolean, default: false },
  earned_points: { type: Number, default: 0 },
  milestone_count: {
    type: [milestoneCountSchema],
    required: true,
  },
  verified_at: { type: Date, default: new Date() },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Customer = models.Customer || model("Customer", customerSchema);

export default Customer;
