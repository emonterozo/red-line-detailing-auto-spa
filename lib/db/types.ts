import { Types } from "mongoose";
import { InquiryStatus, VehicleSize, VehicleType } from "../enums";

export interface ITimeSlot {
  time: string;
  is_available: boolean;
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

export interface MilestoneCount {
  _id: string;
  size_id: string;
  vehicle_type: VehicleType;
  vehicle_size: VehicleSize;
  progress: number;
  sort_order: number;
}
