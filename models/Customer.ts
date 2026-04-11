import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

import VehicleSize, { TVehicleSizeDoc } from "./VehicleSize";
import Badge from "./Badge";

export type TCustomer = InferSchemaType<typeof customerSchema>;
export type TCustomerDoc = HydratedDocument<TCustomer>;

export type CustomerWithPopulatedData = Omit<
  TCustomerDoc,
  "milestone_count" | "referred_by"
> & {
  milestone_count: {
    size_id: TVehicleSizeDoc;
    progress: number;
    _id: Types.ObjectId;
  }[];
  referred_by: TCustomerDoc | null;
};

const milestoneCountSchema = new Schema({
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
  email: { type: String, default: null },
  contact_number: { type: String, required: true, unique: true },
  social: { type: String, default: null },
  address: { type: String, default: null },
  google_address: { type: String, default: null },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
    },
  },
  travel_distance: { type: Number, default: 0 },
  address_updated_at: { type: Date, default: null },
  password: { type: String, required: true },
  is_number_verify: { type: Boolean, default: false },
  is_verify: { type: Boolean, default: false },
  verified_at: { type: Date, default: null },
  earned_points: { type: Number, default: 0 },
  milestone_count: {
    type: [milestoneCountSchema],
    required: true,
  },
  badge: {
    type: new Schema({
      badge_id: {
        type: Schema.Types.ObjectId,
        ref: Badge.modelName,
        default: null,
      },
      count: {
        type: Number,
        default: null,
      },
    }),
    default: null,
  },
  birth_day: { type: Date, default: null },
  referral_code: { type: String, required: true, unique: true },
  referred_by: { type: Schema.Types.ObjectId, ref: "Customer", default: null },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Customer = models.Customer || model("Customer", customerSchema);

export default Customer;
