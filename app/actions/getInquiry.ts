"use server";

import connect from "@/lib/db/mongodb";
import { IInquiry, IInquiryDocument } from "@/lib/db/types";
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

export const getInquiry = async (inquiryId: string) => {
  await connect();

  const bookingDoc = (await Inquiry.findById(
    inquiryId,
  ).lean()) as unknown as IInquiryDocument | null;

  if (!bookingDoc) return null;

  return { ...bookingDoc, _id: bookingDoc._id.toString() };
};
