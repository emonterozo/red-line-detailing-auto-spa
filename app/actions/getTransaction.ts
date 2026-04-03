"use server";

import connect from "@/lib/db/mongodb";
import { IBooking, IBookingDocument } from "@/lib/db/types";
import Booking from "@/models/Booking";
import Transaction from "@/models/Transaction";

export interface IBookingResponse extends IBooking {
  _id: string;
}

export const getTransaction = async (
  transaction_id: string,
) => {
  await connect();

  // Find booking by _id
  const transactionDoc = (await Transaction.findById(
    transaction_id,
  ).lean())

  console.log(transactionDoc)

  if (!transactionDoc) return null;

//   // Format nested fields
//   const formattedServices = bookingDoc.services.map((item) => ({
//     ...item,
//     _id: item._id.toString(),
//   }));

//   const formattedAddOns = bookingDoc.add_ons.map((item) => ({
//     ...item,
//     _id: item._id.toString(),
//   }));

//   const bookingJson: IBookingResponse = {
//     ...bookingDoc,
//     _id: bookingDoc._id.toString(),
//     user_id: bookingDoc?.user_id?.toString(),
//     size_id: bookingDoc?.size_id?.toString(),
//     services: formattedServices,
//     add_ons: formattedAddOns,
//     preferred_date: {
//       ...bookingDoc.preferred_date,
//       _id: bookingDoc.preferred_date._id.toString(),
//     },
//     time_slot: {
//       ...bookingDoc.time_slot,
//       _id: bookingDoc.time_slot._id.toString(),
//     },
//   };

//   return bookingJson;
};
