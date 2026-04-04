"use server";

import connect from "@/lib/db/mongodb";
import { IBooking } from "@/lib/db/types";
import { VehicleSize, VehicleType } from "@/lib/enums";
import Booking from "@/models/Booking";
import { Types } from "mongoose";

export interface IBookingDocument extends Omit<
  IBooking,
  "time_slots" | "size_id"
> {
  _id: Types.ObjectId;
  __v?: number;
  size_id: {
    _id: string;
    size: VehicleSize;
    type: VehicleType;
    description: string;
    sort_order: number;
    is_active: boolean;
  };
}

export interface IBookingResponse extends Omit<IBooking, "size_id"> {
  _id: string;
  size_id: string;
  size: {
    _id: string;
    size: VehicleSize;
    type: VehicleType;
    description: string;
    sort_order: number;
    is_active: boolean;
  };
}

export const getBooking = async (
  bookingIdOrRef: string,
): Promise<IBookingResponse | null> => {
  await connect();

  let bookingDoc: IBookingDocument | null = null;

  // Check if the input is a valid MongoDB ObjectId
  if (Types.ObjectId.isValid(bookingIdOrRef)) {
    bookingDoc = await Booking.findById(bookingIdOrRef)
      .populate("size_id")
      .lean();
  }

  // If not found by _id, try by reference_number
  bookingDoc ??= await Booking.findOne({
    reference_number: bookingIdOrRef,
  })
    .populate("size_id")
    .lean();

  if (!bookingDoc) return null;

  const formattedServices = bookingDoc.services.map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

  const formattedAddOns = bookingDoc.add_ons.map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

  const bookingJson: IBookingResponse = {
    ...bookingDoc,
    _id: bookingDoc._id.toString(),
    user_id: bookingDoc?.user_id?.toString(),
    size_id: bookingDoc?.size_id?._id.toString(),
    size: {
      ...bookingDoc?.size_id,
      _id: bookingDoc?.size_id?._id.toString(),
    },
    services: formattedServices,
    add_ons: formattedAddOns,
    preferred_date: {
      ...bookingDoc.preferred_date,
      _id: bookingDoc.preferred_date._id.toString(),
    },
    time_slot: {
      ...bookingDoc.time_slot,
      _id: bookingDoc.time_slot._id.toString(),
    },
  };

  return bookingJson;
};
