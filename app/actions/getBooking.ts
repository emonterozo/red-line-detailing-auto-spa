"use server";

import connect from "@/lib/db/mongodb";
import { ServiceType, VehicleSize, VehicleType } from "@/lib/enums";
import Booking, { TBooking, TBookingDoc } from "@/models/Booking";
import Customer, { TCustomer, TCustomerDoc } from "@/models/Customer";
import MilestoneReward, {
  TMilestoneReward,
  TMilestoneRewardDoc,
} from "@/models/MilestoneReward";
import { TSchedule } from "@/models/Schedule";
import { TVehicleSize } from "@/models/VehicleSize";
import { Types } from "mongoose";

const BOOKING_FIELDS: (keyof TBooking)[] = [
  "customer_id",
  "size_id",
  "name",
  "contact_number",
  "vehicle_model",
  "social",
  "services",
  "add_ons",
  "preferred_date",
  "time_slot",
  "address",
  "google_address",
  "location",
  "status",
  "reservation_fee",
  "total_amount",
  "travel_fee",
  "travel_distance",
  "discount",
  "point_used",
  "reference_number",
  "promotion_id",
  "promo_code_used",
  "notes",
  "milestone_reward_id",
];

const CUSTOMER_FIELDS: (keyof TCustomer)[] = [
  "earned_points",
  "milestone_count",
];

const MILESTONE_VEHICLE_SIZE_FIELDS: (keyof TVehicleSize)[] = [
  "size",
  "type",
  "sort_order",
];

export type BookingCustomerResponse = Pick<TCustomer, "earned_points"> & {
  _id: string;
  milestone_count: {
    _id: string;
    size_id: Pick<TVehicleSize, "size" | "type" | "sort_order"> & {
      _id: string;
    };
    progress: number;
  }[];
};

export type BookingResponse = Pick<
  TBooking,
  | "name"
  | "contact_number"
  | "vehicle_model"
  | "social"
  | "address"
  | "google_address"
  | "location"
  | "status"
  | "reservation_fee"
  | "total_amount"
  | "travel_fee"
  | "travel_distance"
  | "discount"
  | "point_used"
  | "reference_number"
  | "promo_code_used"
  | "notes"
> & {
  _id: string;
  customer: BookingCustomerResponse | null;
  size_id: string;
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
  preferred_date: Pick<TSchedule, "date"> & {
    _id: string;
  };
  time_slot: {
    _id: string;
    time: string;
  };
  milestone_reward: BookingMilestoneRewardResponse | null;
};

type BookingDoc = Pick<
  TBookingDoc,
  | "_id"
  | "size_id"
  | "customer_id"
  | "name"
  | "contact_number"
  | "vehicle_model"
  | "social"
  | "services"
  | "add_ons"
  | "preferred_date"
  | "time_slot"
  | "address"
  | "google_address"
  | "location"
  | "status"
  | "reservation_fee"
  | "total_amount"
  | "travel_fee"
  | "travel_distance"
  | "discount"
  | "point_used"
  | "reference_number"
  | "notes"
  | "milestone_reward_id"
>;

type CustomerDoc = Pick<TCustomerDoc, "_id" | "earned_points"> & {
  milestone_count: {
    _id: Types.ObjectId;
    size_id: {
      _id: Types.ObjectId;
      size: VehicleSize;
      type: VehicleType;
      sort_order: number;
    };
    progress: number;
  }[];
};

export type BookingMilestoneRewardResponse = Pick<
  TMilestoneReward,
  "reward_type" | "discount_percentage" | "discount_amount" | "vehicle_type"
> & {
  _id: string;
  reward_service_id: string;
};

export const getBooking = async (
  bookingId: string,
): Promise<BookingResponse | null> => {
  await connect();

  const bookingDoc: BookingDoc | null = await Booking.findById(bookingId)
    .select(BOOKING_FIELDS.join(" "))
    .lean();

  if (!bookingDoc) return null;

  let customer: BookingCustomerResponse | null = null;

  if (bookingDoc.customer_id) {
    const customerDoc: CustomerDoc = await Customer.findById(
      bookingDoc.customer_id,
    )
      .select(CUSTOMER_FIELDS.join(" "))
      .populate(
        "milestone_count.size_id",
        MILESTONE_VEHICLE_SIZE_FIELDS.join(" "),
      )
      .lean();

    const milestoneJson = customerDoc?.milestone_count
      .toSorted((a, b) => a.size_id.sort_order - b.size_id.sort_order)
      .map((item) => ({
        ...item,
        _id: item._id.toString(),
        size_id: {
          ...item.size_id,
          _id: item._id.toString(),
        },
      }));

    customer = {
      ...customerDoc,
      _id: customerDoc?._id.toString(),
      milestone_count: milestoneJson,
    };
  }

  let milestone_reward: BookingMilestoneRewardResponse | null = null;
  if (bookingDoc.milestone_reward_id) {
    const milestoneRewardDoc: Pick<
      TMilestoneRewardDoc,
      | "_id"
      | "reward_type"
      | "discount_percentage"
      | "discount_amount"
      | "reward_service_id"
      | "vehicle_type"
    > = await MilestoneReward.findById(bookingDoc.milestone_reward_id)
      .select(
        "reward_type discount_percentage discount_amount reward_service_id vehicle_type",
      )
      .lean();

    milestone_reward = {
      ...milestoneRewardDoc,
      _id: milestoneRewardDoc._id.toString(),
      reward_service_id: milestoneRewardDoc.reward_service_id._id.toString(),
    };
  }

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

  const {
    customer_id: _customer_id,
    milestone_reward_id: _milestone_reward_id,
    ...restBooking
  } = bookingDoc;

  const bookingJson = {
    ...restBooking,
    _id: bookingDoc._id.toString(),
    customer,
    size_id: bookingDoc.size_id.toString(),
    services: formattedServices,
    add_ons: formattedAddOns,
    preferred_date: {
      ...bookingDoc.preferred_date,
      _id: bookingDoc.preferred_date._id?.toString() ?? "",
    },
    time_slot: {
      ...bookingDoc.time_slot,
      _id: bookingDoc.time_slot._id?.toString() ?? "",
    },
    milestone_reward,
  };

  return bookingJson;
};
