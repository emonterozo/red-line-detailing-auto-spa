import { Schema, Types, model, models } from "mongoose";

import { IBooking } from "@/lib/db/types";
import { BookingStatus } from "@/lib/enums";

const bookingSchema = new Schema<IBooking>({
  name: { type: String, required: true },
  contact_number: { type: String, required: true },
  vehicle_model: { type: String, default: null },
  social: { type: String, default: null },
  services: {
    type: [
      new Schema({
        _id: { type: Types.ObjectId },
        title: { type: String, required: true },
      }),
    ],
    required: true,
  },
  add_ons: {
    type: [
      new Schema({
        _id: { type: Types.ObjectId },
        title: { type: String, required: true },
      }),
    ],
    required: true,
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
  address: { type: String, default: null },
  status: { type: String, enum: BookingStatus, required: true },
  reservation_fee: { type: Number, default: 0, required: true },
  total_amount: { type: Number, default: 0, required: true },
  notes: { type: String, default: null },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Booking = models.Booking || model<IBooking>("Booking", bookingSchema);

export default Booking;
