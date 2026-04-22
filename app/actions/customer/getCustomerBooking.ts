"use server";

import connect from "@/lib/db/mongodb";
import { BookingStatus } from "@/lib/enums";
import Booking, { TBooking } from "@/models/Booking";
import { Types } from "mongoose";

const BOOKING_FIELDS = [
  "vehicle_model",
  "preferred_date",
  "time_slot",
  "status",
  "reference_number",
] as const satisfies readonly (keyof TBooking)[];

type SelectedKeys = (typeof BOOKING_FIELDS)[number];

export type CustomerBookingResponse = Pick<TBooking, SelectedKeys> & {
  _id: string;
};

export const getCustomerBooking = async (
  customer_id: string,
): Promise<CustomerBookingResponse | null> => {
  await connect();

  const bookingsDoc = await Booking.findOne({
    customer_id: new Types.ObjectId(customer_id),
    status: {
      $in: [
        BookingStatus.FOR_CHECKING,
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.RESERVED,
      ],
    },
  })
    .select(BOOKING_FIELDS.join(" "))
    .lean();

  const booking = JSON.parse(
    JSON.stringify(bookingsDoc),
  ) as CustomerBookingResponse | null;

  return booking;
};
