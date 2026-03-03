"use server";

import connect from "@/lib/db/mongodb";
import { IBooking } from "@/lib/db/types";

import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";
import { Types } from "mongoose";

export const createBooking = async (bookingData: IBooking) => {
  await connect();

  try {
    const date = await Schedule.findOne(
      {
        _id: new Types.ObjectId(bookingData.preferred_date._id),
        "time_slots.is_available": true,
      },
      { "time_slots.$": 1 },
    );

    if (!date) {
      const formattedDate = bookingData.preferred_date.date.toLocaleDateString(
        "en-US",
        {
          weekday: "short",
          year: "numeric",
          month: "long",
          day: "2-digit",
        },
      );

      return {
        success: false,
        field: "preferred_date",
        message: `Sorry, all time slots on ${formattedDate} are fully booked. Please choose another preferred date.`,
      };
    } else {
      const schedule = await Schedule.findOne(
        {
          _id: new Types.ObjectId(bookingData.preferred_date._id),
          time_slots: {
            $elemMatch: {
              _id: new Types.ObjectId(bookingData.time_slot._id),
              is_available: true,
            },
          },
        },
        { "time_slots.$": 1 },
      );
      if (schedule) {
        const newInquiry = new Booking(bookingData);
        await newInquiry.save();

        await Schedule.findOneAndUpdate(
          {
            _id: new Types.ObjectId(bookingData.preferred_date._id),
            "time_slots._id": new Types.ObjectId(bookingData.time_slot._id),
            "time_slots.is_available": true,
          },
          {
            $set: {
              "time_slots.$.is_available": false,
            },
          },
        );

        return {
          success: true,
          field: null,
          message:
            "Thank you! Your booking has been successfully received. We’ll review it and get back to you immediately after verification. You’ll receive a confirmation once everything is checked.",
        };
      } else {
        return {
          success: false,
          field: "time_slot",
          message: `Sorry, someone has already booked at the ${bookingData.time_slot.time} time slot. Please choose another time slot.`,
        };
      }
    }
  } catch {
    return {
      success: false,
      field: null,
      message:
        "Something went wrong while creating the inquiry. Please try again later.",
    };
  }
};
