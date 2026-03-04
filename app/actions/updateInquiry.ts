"use server";

import connect from "@/lib/db/mongodb";
import { InquiryStatus } from "@/lib/enums";
import Inquiry from "@/models/Inquiry";
import { Types } from "mongoose";

export const updateInquiry = async (id: string, status: InquiryStatus) => {
  await connect();

  try {
    await Inquiry.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
      },
      {
        $set: {
          status: status,
          updated_at: new Date(),
        },
      },
    );

    return {
      success: true,
      message: "Update successfully",
    };
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while creating the inquiry. Please try again later.",
    };
  }
};
