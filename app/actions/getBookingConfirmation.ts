"use server";

import connect from "@/lib/db/mongodb";
import { ServiceType } from "@/lib/enums";
import { calculateMilestoneRewardDiscount } from "@/lib/utils";
import Booking, { TBooking, TBookingDoc } from "@/models/Booking";
import MilestoneReward, { TMilestoneRewardDoc } from "@/models/MilestoneReward";
import { TSchedule } from "@/models/Schedule";
import { TServiceDoc } from "@/models/Service";
import { TVehicleSize, TVehicleSizeDoc } from "@/models/VehicleSize";

const BOOKING_CONFIRMATION_FIELDS: (keyof TBooking)[] = [
  "created_at",
  "reference_number",
  "status",
  "name",
  "contact_number",
  "vehicle_model",
  "preferred_date",
  "time_slot",
  "services",
  "add_ons",
  "travel_fee",
  "total_amount",
  "milestone_reward_id",
  "point_used",
  "discount",
];

const VEHICLE_SIZE_FIELDS: (keyof TVehicleSize)[] = ["description", "type"];

export type BookingConfirmationResponse = Pick<
  TBooking,
  | "name"
  | "contact_number"
  | "vehicle_model"
  | "status"
  | "total_amount"
  | "travel_fee"
  | "reference_number"
  | "created_at"
  | "point_used"
  | "discount"
> & {
  _id: string;
  size_id: Pick<TVehicleSize, "type" | "description"> & {
    _id: string;
  };
  services: {
    _id: string;
    type: ServiceType;
    title: string;
    price: number;
    discount: number;
  }[];
  add_ons: {
    _id: string;
    type: ServiceType;
    title: string;
    price: number;
    discount: number;
  }[];
  milestone_reward: {
    _id: string;
    type: ServiceType;
    title: string;
    price: number;
    discount: number;
  }[];
  preferred_date: Pick<TSchedule, "date"> & {
    _id: string;
  };
  time_slot: {
    _id: string;
    time: string;
  };
};

type BookingDoc = Pick<
  TBookingDoc,
  | "_id"
  | "name"
  | "contact_number"
  | "vehicle_model"
  | "services"
  | "add_ons"
  | "preferred_date"
  | "time_slot"
  | "status"
  | "total_amount"
  | "travel_fee"
  | "reference_number"
  | "created_at"
  | "milestone_reward_id"
  | "point_used"
  | "discount"
> & {
  size_id: Pick<TVehicleSizeDoc, "_id" | "type" | "description">;
};

type MilestoneRewardDoc = Pick<
  TMilestoneRewardDoc,
  "_id" | "reward_type" | "discount_percentage" | "discount_amount"
> & {
  reward_service_id: Pick<
    TServiceDoc,
    "_id" | "title" | "type" | "pricing_per_sizes"
  >;
};

export const getBookingConfirmation = async (
  reference: string,
): Promise<BookingConfirmationResponse | null> => {
  await connect();

  const bookingDoc: BookingDoc = await Booking.findOne({
    reference_number: reference,
  })
    .select(BOOKING_CONFIRMATION_FIELDS.join(" "))
    .populate("size_id", VEHICLE_SIZE_FIELDS.join(" "))
    .lean();

  if (!bookingDoc) return null;

  const formattedServices = bookingDoc.services.map((item) => ({
    _id: item._id.toString(),
    title: item.title,
    type: item.type,
    price: item.price,
    discount: item.discount,
  }));

  const formattedAddOns = bookingDoc.add_ons.map((item) => ({
    _id: item._id.toString(),
    title: item.title,
    type: item.type,
    price: item.price,
    discount: item.discount,
  }));

  const milestoneReward = [];
  if (bookingDoc.milestone_reward_id) {
    const milestoneRewardDoc: MilestoneRewardDoc =
      await MilestoneReward.findById(bookingDoc.milestone_reward_id)
        .select("reward_type discount_percentage discount_amount")
        .populate("reward_service_id", "title type pricing_per_sizes")
        .lean();

    const price =
      milestoneRewardDoc.reward_service_id.pricing_per_sizes.find(
        (item) =>
          item.size_id._id.toString() === bookingDoc.size_id._id.toString(),
      )?.price ?? 0;

    const discount = calculateMilestoneRewardDiscount(price, {
      reward_type: milestoneRewardDoc.reward_type,
      discount_amount: milestoneRewardDoc.discount_amount,
      discount_percentage: milestoneRewardDoc.discount_percentage,
    });
    milestoneReward.push({
      _id: milestoneRewardDoc._id.toString(),
      title: milestoneRewardDoc.reward_service_id.title,
      type: milestoneRewardDoc.reward_service_id.type,
      price: price,
      discount: discount,
    });
  }

  const { milestone_reward_id: _milestone_reward_id, ...restBooking } =
    bookingDoc;
  const bookingJson = {
    ...restBooking,
    _id: bookingDoc._id.toString(),
    size_id: {
      ...bookingDoc.size_id,
      _id: bookingDoc.size_id._id.toString(),
    },
    services: formattedServices,
    add_ons: formattedAddOns,
    milestone_reward: milestoneReward,
    preferred_date: {
      ...bookingDoc.preferred_date,
      _id: bookingDoc.preferred_date._id?.toString() ?? "",
    },
    time_slot: {
      ...bookingDoc.time_slot,
      _id: bookingDoc.time_slot._id?.toString() ?? "",
    },
  };

  return bookingJson;
};
