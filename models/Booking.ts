import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

import { BookingStatus, ServiceType } from "@/lib/enums";
import VehicleSize, { TVehicleSizeDoc } from "./VehicleSize";
import Customer, { TCustomerDoc } from "./Customer";
import Promotion, { TPromotionDoc } from "./Promotion";
import MilestoneReward from "./MilestoneReward";

export type TBooking = InferSchemaType<typeof bookingSchema>;
export type TBookingDoc = HydratedDocument<TBooking>;

export type BookingWithPopulatedData = Omit<
  TBookingDoc,
  "customer_id" | "size_id" | "promotion_id"
> & {
  customer_id: TCustomerDoc;
  size_id: TVehicleSizeDoc;
  promotion_id: TPromotionDoc;
};

const serviceSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ServiceType, required: true },
  price: { type: Number, default: 0, required: true },
  discount: { type: Number, default: 0, required: true },
});

const bookingSchema = new Schema({
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: Customer.modelName,
    default: null,
  },
  size_id: {
    type: Schema.Types.ObjectId,
    ref: VehicleSize.modelName,
    required: true,
  },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  name: { type: String, required: true },
  contact_number: { type: String, required: true },
  vehicle_model: { type: String, required: true },
  social: { type: String, default: null },
  services: {
    type: [serviceSchema],
    required: true,
  },
  add_ons: {
    type: [serviceSchema],
    default: [],
  },
  milestone_reward_id: {
    type: Schema.Types.ObjectId,
    ref: MilestoneReward.modelName,
    default: null,
  },
  preferred_date: {
    type: new Schema({
      _id: { type: Types.ObjectId },
      date: { type: Date, required: true },
    }),
    required: true,
  },
  time_slot: {
    type: new Schema({
      _id: { type: Types.ObjectId },
      time: { type: String, required: true },
    }),
    required: true,
  },
  address: { type: String, required: true },
  google_address: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: { type: String, enum: BookingStatus, required: true },
  reservation_fee: { type: Number, default: 0, required: true },
  total_amount: { type: Number, default: 0, required: true },
  travel_fee: { type: Number, default: 0, required: true },
  travel_distance: { type: Number, default: 0, required: true },
  discount: { type: Number, default: 0, required: true },
  milestone_discount: { type: Number, default: 0, required: true },
  point_used: { type: Number, default: 0, required: true },
  reference_number: { type: String, required: true, unique: true },
  promotion_id: {
    type: Schema.Types.ObjectId,
    ref: Promotion.modelName,
    default: null,
  },
  promo_code_used: { type: String, default: null },
  notes: { type: String, default: null },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

bookingSchema.index({ location: "2dsphere" });

const Booking = models.Booking || model("Booking", bookingSchema);

export default Booking;
