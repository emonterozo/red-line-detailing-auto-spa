"use server";

import connect from "@/lib/db/mongodb";
import { IBooking } from "@/lib/db/types";
import { VehicleSize, VehicleType } from "@/lib/enums";
import Booking, {
  BookingWithPopulatedData,
  TBooking,
  TBookingDoc,
} from "@/models/Booking";
import { TVehicleSize } from "@/models/VehicleSize";
import { Types } from "mongoose";

export type BookingResponse = Omit<TBooking, "_id" | "size_id"> & {
  _id: string;
  size_id: Pick<TVehicleSize, "size" | "type" | "description"> & {
    _id: string;
  };
};

export const getBooking = async (
  bookingIdOrRef: string,
): Promise<BookingResponse | null> => {
  await connect();

  let bookingDoc: BookingWithPopulatedData | null = null;

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

  console.log(bookingDoc)

  const bookingJson = {
    ...bookingDoc,
    _id: bookingDoc._id.toString(),
    customer_id: bookingDoc.customer_id,
    size_id: bookingDoc.size_id._id.toString(),
    size: {
      ...bookingDoc.size_id,
      _id: bookingDoc.size_id._id.toString(),
    },
    services: formattedServices,
    add_ons: formattedAddOns,
    preferred_date: {
      ...bookingDoc.preferred_date,
      _id: bookingDoc.preferred_date._id?.toString(),
    },
    time_slot: {
      ...bookingDoc.time_slot,
      _id: bookingDoc.time_slot._id?.toString(),
    },
  };

  console.log(bookingJson)

  return bookingJson;
};
