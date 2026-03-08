import { Types } from "mongoose";
import { BookingStatus, InquiryStatus } from "../enums";

export interface IPricingPerSize {
  size: string;
  vehicle: string;
  price: number;
}

export interface IService {
  title: string;
  description: string;
  type: string;
  pricing_per_sizes: IPricingPerSize[];
  price: number;
  pricing_options: string | null;
  is_available: boolean
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
  notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface IBookingDocument extends Omit<IBooking, "time_slots"> {
  _id: Types.ObjectId;
  __v?: number;
}