"use server";

import connect from "@/lib/db/mongodb";
import { BookingStatus } from "@/lib/enums";
import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";
import { Types } from "mongoose";

type UpdateBookingRequest = {
  bookingId: string;
  scheduleId: string;
  timeSlotId: string;
  reservationFee: number;
  totalAmount: number;
  notes: string;
  status: string;
};

export const updateBooking = async (request: UpdateBookingRequest) => {
  await connect();

  try {
    const result = await Booking.findOneAndUpdate(
      {
        _id: new Types.ObjectId(request.bookingId),
      },
      {
        $set: {
          reservation_fee: request.reservationFee,
          total_amount: request.totalAmount,
          notes: request.notes,
          status: request.status,
          updated_at: new Date(),
        },
      },
    );

    const isAvailable = [
      BookingStatus.REFUNDED,
      BookingStatus.REJECTED,
      BookingStatus.CANCELLED,
    ].includes(request.status as BookingStatus);

    if (result) {
      await Schedule.findOneAndUpdate(
        {
          _id: new Types.ObjectId(request.scheduleId),
          "time_slots._id": new Types.ObjectId(request.timeSlotId),
        },
        {
          $set: {
            "time_slots.$.is_available": isAvailable,
          },
        },
      );
    }

    return {
      success: true,
      message: "Update successfully",
    };
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while creating the inquiry. Please try again later.",
    };
  }
};
