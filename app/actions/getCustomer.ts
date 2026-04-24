"use server";

import connect from "@/lib/db/mongodb";
import { CustomerBadge, VehicleSize, VehicleType } from "@/lib/enums";
import Customer, { TCustomer } from "@/models/Customer";
import { TTransactionDoc } from "@/models/Transaction";
import { TVehicleSizeDoc } from "@/models/VehicleSize";
import { Types } from "mongoose";

const CUSTOMER_FIELDS: (keyof TCustomer)[] = [
  "first_name",
  "last_name",
  "email",
  "contact_number",
  "social",
  "address",
  "google_address",
  "location",
  "address_updated_at",
  "is_verify",
  "verified_at",
  "earned_points",
  "birth_day",
  "referral_code",
  "created_at",
  "travel_distance",
  "milestone_count",
  "badge",
];

export type CustomerDetailsResponse = Omit<
  TCustomer,
  | "name"

  | "password"
  | "milestone_count"
  | "updated_at"
  | "is_verify"
  | 'otp_send_count'
> & {
  _id: string;
  milestone_count: {
    _id: string;
    size_id: string;
    vehicle_type: VehicleType;
    vehicle_size: VehicleSize;
    progress: number;
    sort_order: number;
  }[];
  badge: {
    title: CustomerBadge;
    count: number;
    limit: number;
    points: number;
  } | null;
};

type CustomerDoc = Omit<
  TCustomer,
  | "name"
  | "password"
  | "milestone_count"
  | "updated_at"
  | "badge"
> & {
  _id: TTransactionDoc["_id"];
  milestone_count: {
    _id: Types.ObjectId;
    progress: number;
    size_id: Pick<TVehicleSizeDoc, "_id" | "size" | "type" | "sort_order">;
  }[];
  badge: {
    badge_id: {
      _id: Types.ObjectId;
      title: CustomerBadge;
      limit: number;
      points: number;
    };
    count: number;
    _id: Types.ObjectId;
  } | null;
};

export const getCustomer = async (
  id: string,
): Promise<CustomerDetailsResponse | null> => {
  await connect();

  const customerDoc: CustomerDoc = await Customer.findById(id)
    .select(CUSTOMER_FIELDS.join(" "))
    .populate("milestone_count.size_id", "size type sort_order")
    .populate("badge.badge_id", "title limit points")
    .lean();

  if (!customerDoc) return null;

  const milestone_count = customerDoc.milestone_count.map((item) => ({
    _id: item._id.toString(),
    size_id: item.size_id._id.toString(),
    vehicle_type: item.size_id.type,
    vehicle_size: item.size_id.size,
    progress: item.progress,
    sort_order: item.size_id.sort_order,
  }));

  return {
    _id: customerDoc._id.toString(),
    first_name: customerDoc.first_name,
    last_name: customerDoc.last_name,
    contact_number: customerDoc.contact_number,
    email: customerDoc.email,
    social: customerDoc.social,
    address: customerDoc.address,
    google_address: customerDoc.google_address,
    location: customerDoc.location,
    address_updated_at: customerDoc.address_updated_at,
    verified_at: customerDoc.verified_at,
    created_at: customerDoc.created_at,
    is_email_verify: customerDoc.is_email_verify,
    birth_day: customerDoc.birth_day,
    referral_code: customerDoc.referral_code,
    earned_points: customerDoc.earned_points,
    travel_distance: customerDoc.travel_distance,
    milestone_count,
    badge: customerDoc.badge
      ? {
          title: customerDoc.badge.badge_id.title,
          limit: customerDoc.badge.badge_id.limit,
          count: customerDoc.badge.count,
          points: customerDoc.badge.badge_id.points,
        }
      : null,
  };
};
