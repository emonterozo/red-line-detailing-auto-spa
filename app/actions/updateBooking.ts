"use server";

import connect from "@/lib/db/mongodb";
import { BookingStatus, ServiceType } from "@/lib/enums";
import { getSmsContent, SmsType } from "@/lib/getSmsTemplate";
import { sendMessage } from "@/lib/sendMessage";
import Booking from "@/models/Booking";
import Schedule from "@/models/Schedule";
import { Types } from "mongoose";
import { CONFIG } from "../config/config";
import Promotion from "@/models/Promotion";
import { getPromotionDetails } from "./getPromotionDetails";
import PromotionUsage from "@/models/PromotionUsage";

type UpdateBookingRequest = {
  sizeId: string;
  services: { _id: string; title: string; type: ServiceType; price: number }[];
  bookingId: string;
  scheduleId: string;
  timeSlotId: string;
  reservationFee: number;
  totalAmount: number;
  travelFee: number;
  travelDistance: number;
  pointsUsed: number;
  discount: number;
  notes: string;
  status: BookingStatus;
  address: string;
  social: string;
  milestone_reward_id: string | null;
  promotion_id: string | null;
};

export const updateBooking = async (request: UpdateBookingRequest) => {
  await connect();

  try {
    let add_ons = request.services.filter(
      (item) => item.type === ServiceType.ADD_ONS,
    );
    let services = request.services.filter(
      (item) => item.type === ServiceType.SERVICE,
    );

    if (request.promotion_id) {
      const result = await getPromotionDetails(request.promotion_id, [
        ...services,
        ...add_ons,
      ]);
      if (result.success) {
        add_ons =
          result.data?.services.filter(
            (item) => item.type === ServiceType.ADD_ONS,
          ) ?? [];
        services =
          result.data?.services.filter(
            (item) => item.type === ServiceType.SERVICE,
          ) ?? [];
      }
    }

    const result = await Booking.findOneAndUpdate(
      {
        _id: new Types.ObjectId(request.bookingId),
      },
      {
        $set: {
          size_id: new Types.ObjectId(request.sizeId),
          milestone_reward_id: request.milestone_reward_id
            ? new Types.ObjectId(request.milestone_reward_id)
            : null,
          reservation_fee: request.reservationFee,
          travel_fee: request.travelFee,
          total_amount: request.totalAmount,
          travel_distance: request.travelDistance,
          notes: request.notes,
          status: request.status,
          address: request.address,
          social: request.social,
          point_used: request.pointsUsed,
          discount: request.discount,
          services,
          add_ons,
          updated_at: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    const isAvailable = [
      BookingStatus.REFUNDED,
      BookingStatus.REJECTED,
      BookingStatus.CANCELLED,
    ].includes(request.status);

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

      if (result.promotion_id && isAvailable) {
        const promotionUsage = await PromotionUsage.findOneAndDelete({
          booking_id: new Types.ObjectId(request.bookingId),
          promotion_id: result.promotion_id,
        });
        if (promotionUsage) {
          await Promotion.findByIdAndUpdate(result.promotion_id, {
            $inc: {
              current_usage_count: -1,
            },
            $set: {
              updated_at: new Date(),
            },
          });
        }
      }
    }

    let message = "";
    const totalBill = result.total_amount + result.travel_fee;
    const depositValue = Math.max(
      0,
      totalBill * CONFIG.DOWN_PAYMENT_MULTIPLIER,
    );
    const amount = Math.floor(depositValue).toLocaleString();
    switch (request.status) {
      case BookingStatus.FOR_CHECKING:
        message = getSmsContent({
          name: result.first_name,
          model: result.vehicle_model,
          type: SmsType.FOR_CHECKING,
          ref: result.reference_number,
          date: new Date(result.preferred_date.date).toDateString(),
        });
        break;
      case BookingStatus.PENDING_PAYMENT:
        message = getSmsContent({
          name: result.first_name,
          model: result.vehicle_model,
          type: SmsType.PENDING_PAYMENT,
          ref: result.reference_number,
          date: result.preferred_date.date.toDateString(),
          amount: `₱${amount}`,
        });
        break;
      case BookingStatus.RESERVED:
        message = getSmsContent({
          name: result.first_name,
          model: result.vehicle_model,
          type: SmsType.RESERVED,
          ref: result.reference_number,
          date: result.preferred_date.date.toDateString(),
          time: result.time_slot.time,
        });
        break;
      case BookingStatus.CANCELLED:
        message = getSmsContent(
          {
            name: result.first_name,
            type: SmsType.CANCELLED,
            ref: result.reference_number,
            date: result.preferred_date.date.toDateString(),
          },
          true,
        );
        break;
      case BookingStatus.REJECTED:
        message = getSmsContent(
          {
            name: result.first_name,
            type: SmsType.REJECTED,
            ref: result.reference_number,
            date: result.preferred_date.date.toDateString(),
          },
          true,
        );
        break;
      case BookingStatus.REFUNDED:
        message = getSmsContent(
          {
            name: result.first_name,
            type: SmsType.REFUNDED,
            ref: result.reference_number,
            date: result.preferred_date.date.toDateString(),
            amount: `₱${result.reservation_fee.toLocaleString()}`,
          },
          true,
        );
        break;
      default:
        break;
    }

    if (message !== "") {
      sendMessage({
        message: message,
        phoneNumbers: [result.contact_number],
      });
    }

    return {
      success: true,
      message: "Booking updated successfully.",
    };
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while updating the booking. Please try again later.",
    };
  }
};
