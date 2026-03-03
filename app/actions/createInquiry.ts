"use server";

import connect from "@/lib/db/mongodb";
import { IInquiry, IInquiryDocument } from "@/lib/db/types";

import Inquiry from "@/models/Inquiry";

export const createInquiry = async (inquiryData: IInquiry) => {
  await connect();

  try {
    const newInquiry = new Inquiry(inquiryData);

    await newInquiry.save();

    const inquiry: IInquiryDocument = {
      ...newInquiry.toObject(),
      _id: newInquiry._id.toString(),
      created_at: newInquiry.created_at.toISOString(),
      updated_at: newInquiry.updated_at.toISOString(),
    };

    return { success: true, message: 'We received your inquiry! We’ll get back to you soon. Thank you for reaching out.', inquiry };
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while creating the inquiry. Please try again later.",
    };
  }
};
