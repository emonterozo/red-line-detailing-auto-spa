"use server";

import connect from "@/lib/db/mongodb";
import { ServiceType } from "@/lib/enums";
import Booking, { TBooking, TBookingDoc } from "@/models/Booking";
import { TSchedule } from "@/models/Schedule";
import { TVehicleSize, TVehicleSizeDoc } from "@/models/VehicleSize";

const BOOKING_CONFIRMATION_FIELDS: (keyof TBooking)[] = [
  "created_at",
  "reference_number",
  "status",
  "name",
  "contact_number",
  "vehicle_model",
  "preferred_date",
  "time_slot",
  "services",
  "add_ons",
  "travel_fee",
  "total_amount",
];

const VEHICLE_SIZE_FIELDS: (keyof TVehicleSize)[] = [
 "description",
 "type"
];

export type BookingConfirmationResponse = Pick<
  TBooking,
  | "name"
  | "contact_number"
  | "vehicle_model"
  | "status"
  | "total_amount"
  | "travel_fee"
  | "reference_number"
  | "created_at"
> & {
  _id: string;
  size_id: Pick<TVehicleSize, "type" | "description"> & {
    _id: string;
  };
  services: {
    _id: string;
    type: ServiceType;
    title: string;
    price: number;
  }[];
  add_ons: {
     _id: string;
    type: ServiceType;
    title: string;
    price: number;
  }[];
  preferred_date: Pick<TSchedule, "date"> & {
    _id: string;
  };
  time_slot: {
    _id: string;
    time: string;
  };
};

type BookingDoc = Pick<
  TBookingDoc,
  | "_id"
  | "name"
  | "contact_number"
  | "vehicle_model"
  | "services"
  | "add_ons"
  | "preferred_date"
  | "time_slot"
  | "status"
  | "total_amount"
  | "travel_fee"
  | "reference_number"
  | "created_at"
> & {
  size_id: Pick<TVehicleSizeDoc, "_id" | "type" | "description">;
};

export const getBookingConfirmation = async (
  reference: string,
): Promise<BookingConfirmationResponse | null> => {
  await connect();

  const bookingDoc: BookingDoc = await Booking.findOne({
    reference_number: reference,
  })
    .select(BOOKING_CONFIRMATION_FIELDS.join(" "))
    .populate("size_id", VEHICLE_SIZE_FIELDS.join(" "))
    .lean();

  if (!bookingDoc) return null;

  const formattedServices = bookingDoc.services.map((item) => ({
    _id: item._id.toString(),
    title: item.title,
    type: item.type,
    price: item.price,
  }));

  const formattedAddOns = bookingDoc.add_ons.map((item) => ({
    _id: item._id.toString(),
    title: item.title,
    type: item.type,
    price: item.price,
  }));

  const bookingJson = {
    ...bookingDoc,
    _id: bookingDoc._id.toString(),
    size_id: {
      ...bookingDoc.size_id,
      _id: bookingDoc.size_id._id.toString(),
    },
    services: formattedServices,
    add_ons: formattedAddOns,
    preferred_date: {
      ...bookingDoc.preferred_date,
      _id: bookingDoc.preferred_date._id?.toString() ?? "",
    },
    time_slot: {
      ...bookingDoc.time_slot,
      _id: bookingDoc.time_slot._id?.toString() ?? "",
    },
  };

  return bookingJson;
};
