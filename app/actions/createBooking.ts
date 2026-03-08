"use server";

import connect from "@/lib/db/mongodb";
import { IBooking } from "@/lib/db/types";
import nodemailer from "nodemailer";

import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";
import { Types } from "mongoose";
import { bookingTemple } from "../template/booking";

export const createBooking = async (bookingData: IBooking) => {
  await connect();

  const formattedDate = bookingData.preferred_date.date.toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "2-digit",
    },
  );

  try {
    const date = await Schedule.findOne(
      {
        _id: new Types.ObjectId(bookingData.preferred_date._id),
        "time_slots.is_available": true,
      },
      { "time_slots.$": 1 },
    );

    if (!date) {
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
        const newBooking = new Booking(bookingData);
        await newBooking.save();

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

        const servicesString = bookingData.services
          .map((item) => item.title)
          .join(", ");
        const addOnsString = bookingData.add_ons
          .map((item) => item.title)
          .join(", ");

        const html = await bookingTemple(
          bookingData.name,
          bookingData.contact_number,
          bookingData.vehicle_model,
          bookingData.social,
          formattedDate,
          bookingData.time_slot.time,
          `The client has selected the following signature services: ${servicesString}`,
          `The client has selected the following add-ons services: ${addOnsString === "" ? "N/A" : addOnsString}`,
        );

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const subject = `${new Types.ObjectId().toString()}, Booking from Website`;

        await transporter.sendMail({
          from: `Booking from <${process.env.EMAIL_USER}>`,
          to: [process.env.EMAIL_USER, process.env.PERSONAL_EMAIL].join(","),
          subject: subject,
          html: html,
        });

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
