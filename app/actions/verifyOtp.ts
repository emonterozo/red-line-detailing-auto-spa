"use server";

import connect from "@/lib/db/mongodb";
import { OtpType } from "@/lib/enums";
import Customer from "@/models/Customer";
import Otp, { TOtpDoc } from "@/models/Otp";
import { Types } from "mongoose";

type VerifyOtpProps = {
  customer_id: string;
  type: OtpType;
  code: string;
};

export const verifyOtp = async (data: VerifyOtpProps) => {
  await connect();

  try {
    const otpDoc: TOtpDoc = await Otp.findOne({
      customer_id: new Types.ObjectId(data.customer_id),
      type: data.type,
    })
      .sort({ created_at: -1 })
      .lean();

    if (otpDoc) {
      if (otpDoc.otp === data.code) {
        await Customer.findByIdAndUpdate(data.customer_id, {
          $set: { is_number_verify: true, updated_at: new Date() },
        });
        await Otp.deleteMany({
          customer_id: new Types.ObjectId(data.customer_id),
          type: data.type,
        });
        return {
          success: true,
          message: "Your OTP has been verified successfully.",
          customer_id: data.customer_id,
        };
      } else {
        return {
          success: false,
          message:
            "The OTP you entered is invalid. Please check and try again.",
        };
      }
    } else {
      return {
        success: false,
        message: "OTP has expired. Please request a new one.",
      };
    }
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while creating your account. Please try again later.",
    };
  }
};
