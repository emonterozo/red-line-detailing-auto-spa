"use server";

import connect from "@/lib/db/mongodb";
import nodemailer from "nodemailer";

import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";
import { Types } from "mongoose";
import { bookingTemple } from "../template/booking";
import { BookingStatus, ServiceType } from "@/lib/enums";
import { getSmsContent } from "@/lib/getSmsTemplate";
import { sendMessage } from "@/lib/sendMessage";

interface CreateBookingProps {
  user_id?: string;
  size_id?: string;
  name: string;
  contact_number: string;
  vehicle_model: string;
  social: string;
  services: { _id: string; title: string; type: ServiceType; price: number }[];
  add_ons: { _id: string; title: string; type: ServiceType; price: number }[];
  preferred_date: { _id: string; date: Date };
  time_slot: { _id: string; time: string };
  address: string;
  google_address: string;
  latitude: number;
  longitude: number;
  status: BookingStatus;
  reservation_fee: number;
  total_amount: number;
  travel_fee: number;
  travel_distance: number;
  reference_number: string;
  notes: string;
}

export const createBooking = async (bookingData: CreateBookingProps) => {
  const userId = null;
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
        const newBooking = new Booking({
          user_id: userId,
          ...bookingData,
          location: {
            type: "Point",
            coordinates: [bookingData.longitude, bookingData.latitude],
          },
        });
        await newBooking.save();

        await Schedule.findOneAndUpdate(
          {
            _id: new Types.ObjectId(bookingData.preferred_date._id),
            "time_slots._id": new Types.ObjectId(bookingData.time_slot._id),
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

        const subject = `Booking Created on Website – Ref: #${bookingData.reference_number}`;

        await transporter.sendMail({
          from: `Red Line Detailing <${process.env.EMAIL_USER}>`,
          to: [process.env.EMAIL_USER, process.env.PERSONAL_EMAIL].join(","),
          subject: subject,
          html: html,
        });

        const message = getSmsContent({
          name: bookingData.name,
          model: bookingData.vehicle_model,
          type: BookingStatus.FOR_CHECKING,
          ref: bookingData.reference_number,
          date: new Date(bookingData.preferred_date.date).toDateString()
        });

        sendMessage({
          message,
          phoneNumbers: [bookingData.contact_number]
        })

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
        "Something went wrong while creating the booking. Please try again later.",
    };
  }
};
