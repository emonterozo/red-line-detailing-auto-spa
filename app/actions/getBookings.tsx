"use server";

import connect from "@/lib/db/mongodb";
import { IBooking, IBookingDocument } from "@/lib/db/types";
import Booking from "@/models/Booking";

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
  limit: number = 10
): Promise<IPaginatedBookings> => {
  await connect();

  const skip = (page - 1) * limit;

  const bookingsDoc = (await Booking.find({})
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
      _id: booking._id.toString(),
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

  const total = await Booking.countDocuments();

  return {
    data: bookingsJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};