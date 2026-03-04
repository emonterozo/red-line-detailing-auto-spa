"use server";

import connect from "@/lib/db/mongodb";
import { IInquiry } from "@/lib/db/types";
import Inquiry from "@/models/Inquiry";

export interface IInquiriesResponse extends IInquiry {
  _id: string;
}

export interface IPaginatedInquiries {
  data: IInquiriesResponse[];
  total: number;      
  page: number;        
  limit: number;       
  totalPages: number;  
}

export const getInquiries = async (
  page: number = 1,
  limit: number = 2
): Promise<IPaginatedInquiries> => {
  await connect();

  // Calculate how many documents to skip
  const skip = (page - 1) * limit;

  // Fetch paginated inquiries
  const inquiriesDoc = (await Inquiry.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()) as unknown as IInquiriesResponse[];

  // Convert _id to string
  const inquiriesJson: IInquiriesResponse[] = inquiriesDoc.map((inquiry) => ({
    ...inquiry,
    _id: inquiry._id.toString(),
  }));

  // Get total count for pagination info
  const total = await Inquiry.countDocuments();

  return {
    data: inquiriesJson,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};