/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import connect from "@/lib/db/mongodb";
import { IVehicleSize } from "@/lib/db/types";
import {
  VehicleType,
  VehicleSize as EVehicleSize,
  RewardType,
} from "@/lib/enums";
import Booking from "@/models/Booking";
import Customer from "@/models/Customer";
import MilestoneClaimed from "@/models/MilestoneClaimed";
import MilestoneReward from "@/models/MilestoneReward";
import Service from "@/models/Service";
import Transaction from "@/models/Transaction";
import VehicleSize from "@/models/VehicleSize";

export interface ITransactionDetailsResponse {
  customer: Customer[];
  vehicle_sizes: VehicleSizeProps[];
  vehicle_model: string;
  plate_number: string;
  services: ServiceProps[];
  travel_fee: number;
  total_amount: number;
  total_discount: number;
  milestone_reward: MilestoneReward[];
  discount_type: string;
  reservation_fee: number;
  notes: string;
  points_used: number;
}

export interface ServiceProps {
  _id: string;
  title: string;
  description: string;
  type: string;
  pricing_options: string | null;
  pricing_per_sizes: PricingPerSize[];
  price: number;
  is_available: boolean;
  notes: string;
}

export interface PricingPerSize {
  _id: string;
  type: string;
  size: string;
  description: string;
  price: number;
}

export interface Customer {
  _id: string;
  name: string;
  earned_points: number;
  milestone_count: MilestoneCount[];
}

export interface MilestoneCount {
  _id: string;
  vehicle: Vehicle;
  progress: number;
}

export interface Vehicle {
  _id: string;
  size: EVehicleSize;
  type: VehicleType;
}

export interface VehicleSizeProps extends IVehicleSize {
  _id: string;
}

export interface MilestoneReward {
  _id: string;
  vehicle_type: string;
  service_id: string;
  service: string;
  required_progress_count: number;
  discount_percentage: number;
  discount_amount: number;
  reward_type: RewardType;
}

export const getTransaction = async (
  transaction_id: string,
): Promise<ITransactionDetailsResponse | null> => {
  await connect();

  // Find booking by _id
  const transactionDoc = await Transaction.findById(transaction_id)
    .populate("user_id")
    .lean();

  if (!transactionDoc) return null;

  const availed_services = transactionDoc.services.map((item: any) => item._id);

  const servicesDoc = await Service.find({
    _id: { $in: availed_services },
  }).lean();

  const services = servicesDoc.map((service) => {
    const pricing_per_sizes = service.pricing_per_sizes.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      size_id: item.size_id.toString(),
    }));

    return {
      ...service,
      _id: service._id.toString(),
      pricing_per_sizes,
    };
  });

  const vehicleSizesDoc = await VehicleSize.find({
    size: transactionDoc.vehicle_size,
    type: transactionDoc.vehicle_type,
  }).lean();

  const vehicle_sizes = vehicleSizesDoc.map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

  const booking = await Booking.findById(transactionDoc.booking_id);

  const customer = [];
  const milestone_reward = [];
  if (transactionDoc.user_id) {
    const { _id, name, earned_points } = transactionDoc.user_id;

    const customerData = await Customer.findById(_id).populate(
      "milestone_count.size_id",
    );

    const milestone_count = customerData.milestone_count.map((item: any) => ({
      _id: item._id.toString(),
      vehicle: {
        _id: item.size_id._id.toString(),
        size: item.size_id.size,
        type: item.size_id.type,
      },
      progress: item.progress,
    }));

    customer.push({
      _id: transactionDoc._id.toString(),
      name,
      earned_points,
      milestone_count,
    });

    const claimed = await MilestoneClaimed.findOne({
      transaction_id: transactionDoc._id,
    });

    if (claimed) {
      const reward = await MilestoneReward.findById(claimed.reward_id).populate(
        "reward_service_id",
      );

      if (reward) {
        milestone_reward.push({
          _id: reward?._id.toString(),
          vehicle_type: reward?.vehicle_type,
          service_id: reward?.reward_service_id._id.toString(),
          service: reward?.reward_service_id.title,
          required_progress_count: reward.required_progress_count,
          discount_percentage: reward.discount_percentage,
          discount_amount: reward.discount_amount,
          reward_type: reward.reward_type,
        });
      }
    }
  }

  // Format nested fields
  const formattedTransaction = {
    customer: customer,
    vehicle_sizes,
    vehicle_model: transactionDoc.vehicle_model,
    services: services,
    travel_fee: transactionDoc.travel_fee,
    total_amount: transactionDoc.total_amount,
    total_discount: transactionDoc.total_discount,
    milestone_reward,
    discount_type: transactionDoc.discount_type,
    notes: transactionDoc.notes,
    reservation_fee: booking?.reservation_fee ?? 0,
    points_used: transactionDoc.points_used,
    plate_number: transactionDoc.plate_number,
  };

  return formattedTransaction;
};
