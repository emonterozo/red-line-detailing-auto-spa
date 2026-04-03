"use server";

import connect from "@/lib/db/mongodb";
import { IBooking, IBookingDocument } from "@/lib/db/types";
import Booking from "@/models/Booking";
import { Types } from "mongoose";

export interface IBookingResponse extends IBooking {
  _id: string;
}

export interface IPaginatedBookings {
  data: IBookingResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getBookings = async (
  page: number = 1,
  limit: number = 10,
  user_id?: string
): Promise<IPaginatedBookings> => {
  await connect();

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (user_id && typeof user_id === "string") {
    query.user_id = new Types.ObjectId(user_id);
  }

  const bookingsDoc = (await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()) as unknown as IBookingDocument[];

  const bookingsJson: IBookingResponse[] = bookingsDoc.map((booking) => {
    const formattedServices = booking.services.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));
    const formattedAddOns = booking.add_ons.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }));

    return {
      ...booking,
      user_id: booking?.user_id?.toString(),
      _id: booking._id.toString(),
      size_id: booking.size_id?.toString(),
      services: formattedServices,
      add_ons: formattedAddOns,
      preferred_date: {
        ...booking.preferred_date,
        _id: booking.preferred_date._id.toString(),
      },
      time_slot: {
        ...booking.time_slot,
        _id: booking.time_slot._id.toString(),
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