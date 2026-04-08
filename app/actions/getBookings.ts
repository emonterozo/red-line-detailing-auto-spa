"use server";

import connect from "@/lib/db/mongodb";
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
  "name" | "contact_number" | "vehicle_model" | "status" | "created_at"
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
  user_id?: string,
): Promise<IPaginatedBookings> => {
  await connect();

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (user_id && typeof user_id === "string") {
    query.user_id = new Types.ObjectId(user_id);
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
  >[] = await Booking.find(query)
    .select(BOOKING_FIELDS.join(" "))
    .sort({ createdAt: -1 })
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
