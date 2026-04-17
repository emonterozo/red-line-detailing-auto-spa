"use server";

import connect from "@/lib/db/mongodb";
import { BookingStatus } from "@/lib/enums";
import Booking, { TBooking, TBookingDoc } from "@/models/Booking";
import { TSchedule } from "@/models/Schedule";
import { Types } from "mongoose";

const BOOKING_FIELDS: (keyof TBooking)[] = [
  "created_at",
  "status",
  "name",
  "contact_number",
  "vehicle_model",
  "preferred_date",
  "time_slot",
  "reference_number",
];

export interface IPaginatedBookings {
  data: BookingTableResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type BookingTableResponse = Pick<
  TBooking,
  | "name"
  | "contact_number"
  | "vehicle_model"
  | "status"
  | "created_at"
  | "reference_number"
> & {
  _id: string;
  preferred_date: Pick<TSchedule, "date"> & {
    _id: string;
  };
  time_slot: {
    _id: string;
    time: string;
  };
};

export const getBookings = async (
  page: number = 1,
  limit: number = 10,
  customer_id?: string,
  status?: BookingStatus[],
): Promise<IPaginatedBookings> => {
  await connect();

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (customer_id && typeof customer_id === "string") {
    query.customer_id = new Types.ObjectId(customer_id);
  }

  if (status && status.length > 0) {
    query.status = { $in: status };
  }

  const bookingsDoc: Pick<
    TBookingDoc,
    | "_id"
    | "name"
    | "contact_number"
    | "vehicle_model"
    | "preferred_date"
    | "time_slot"
    | "status"
    | "created_at"
    | "reference_number"
  >[] = await Booking.find(query)
    .select(BOOKING_FIELDS.join(" "))
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const bookingsJson = bookingsDoc.map((booking) => {
    return {
      ...booking,
      _id: booking._id.toString(),
      preferred_date: {
        ...booking.preferred_date,
        _id: booking.preferred_date._id?.toString() ?? "",
      },
      time_slot: {
        ...booking.time_slot,
        _id: booking.time_slot._id?.toString() ?? "",
      },
    };
  });

  const total = await Booking.countDocuments(query);

  return {
    data: bookingsJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
