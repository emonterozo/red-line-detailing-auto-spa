"use server";

import connect from "@/lib/db/mongodb";
import { BookingStatus, ServiceType } from "@/lib/enums";
import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";
import { Types } from "mongoose";

type UpdateBookingRequest = {
  sizeId: string;
  bookingId: string;
  scheduleId: string;
  timeSlotId: string;
  reservationFee: number;
  travelFee: number;
  travelDistance: number;
  totalAmount: number;
  notes: string;
  status: BookingStatus;
  address: string;
  social: string;
  services: { _id: string; title: string; type: ServiceType }[];
};

export const updateBooking = async (request: UpdateBookingRequest) => {
  await connect();

  try {
    console.log(request.services);

    const add_ons = request.services.filter(
      (item) => item.type === ServiceType.ADD_ONS,
    );
    const services = request.services.filter(
      (item) => item.type === ServiceType.SERVICE,
    );

    const result = await Booking.findOneAndUpdate(
      {
        _id: new Types.ObjectId(request.bookingId),
      },
      {
        $set: {
          size_id: new Types.ObjectId(request.sizeId),
          reservation_fee: request.reservationFee,
          travel_fee: request.travelFee,
          total_amount: request.totalAmount,
          travel_distance: request.travelDistance,
          notes: request.notes,
          status: request.status,
          address: request.address,
          social: request.social,
          services,
          add_ons,
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
        "Something went wrong while updating the booking. Please try again later.",
    };
  }
};
