"use server";

import connect from "@/lib/db/mongodb";
import { IBooking, IBookingDocument } from "@/lib/db/types";
import Booking from "@/models/Booking";

export interface IBookingResponse extends IBooking {
  _id: string;
}

export const getBooking = async (
  bookingId: string,
): Promise<IBookingResponse | null> => {
  await connect();

  // Find booking by _id
  const bookingDoc = (await Booking.findById(
    bookingId,
  ).lean()) as unknown as IBookingDocument | null;

  if (!bookingDoc) return null;

  // Format nested fields
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
