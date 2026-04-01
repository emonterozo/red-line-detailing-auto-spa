import { Types } from "mongoose";
import {
  BookingStatus,
  InquiryStatus,
  RewardType,
  TransactionFrom,
  VehicleSize,
  VehicleType,
} from "../enums";

export interface IVehicleSize {
  type: VehicleType;
  size: VehicleSize;
  description: string;
}

export interface IPricingPerSize {
  size_id: Types.ObjectId | IVehicleSize;
  price: number;
}

export interface IService {
  title: string;
  description: string;
  type: string;
  pricing_per_sizes: IPricingPerSize[];
  price: number;
  pricing_options: string | null;
  is_available: boolean;
  notes: string;
}

export interface IServiceDocument extends Omit<IService, "pricing_per_sizes"> {
  _id: Types.ObjectId;
  pricing_per_sizes: (IPricingPerSize & { _id: Types.ObjectId })[];
  __v?: number;
}

export interface IInquiry {
  name: string;
  contact_number: string;
  email: string;
  message: string;
  status: InquiryStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IInquiryDocument extends IInquiry {
  _id: Types.ObjectId;
  __v?: number;
}

export interface ITimeSlot {
  time: string;
  is_available: boolean;
}

export interface ISchedule {
  date: Date;
  time_slots: ITimeSlot[];
}

export interface IScheduleDocument extends Omit<ISchedule, "time_slots"> {
  _id: Types.ObjectId;
  time_slots: (ITimeSlot & { _id: Types.ObjectId })[];
  __v?: number;
}

export interface IBooking {
  user_id?: string;
  size_id?: string;
  name: string;
  contact_number: string;
  vehicle_model: string;
  social: string;
  services: { _id: string; title: string }[];
  add_ons: { _id: string; title: string }[];
  preferred_date: { _id: string; date: Date };
  time_slot: { _id: string; time: string };
  address: string;
  status: BookingStatus;
  reservation_fee: number;
  total_amount: number;
  travel_fee: number;
  notes: string;
  is_create_account: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IBookingDocument extends Omit<IBooking, "time_slots"> {
  _id: Types.ObjectId;
  __v?: number;
}

export interface IMilestoneReward {
  vehicle_type: VehicleType;
  service_id: Types.ObjectId | string;
  required_progress_count: number;
  reward_type: RewardType;
  discount_percentage: number;
  discount_amount: number;
  reward_service_id: Types.ObjectId | string;
  is_active: boolean;
}

export interface ITransaction {
  user_id: string | null;
  booking_id: string | null;
  transaction_from: TransactionFrom;
  vehicle_type: VehicleType;
  vehicle_size: VehicleSize;
  vehicle_model: string;
  services: { _id: string; title: string }[];
  travel_fee: number;
  total_amount: number;
  total_discount: number;
  milestone_reward: {
    _id: string;
    title: string;
    price: number;
    required_progress_count: number;
  } | null;
  milestone_discount: number;
}
