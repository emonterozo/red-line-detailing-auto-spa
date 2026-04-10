"use server";

import connect from "@/lib/db/mongodb";
import Customer, { TCustomer, TCustomerDoc } from "@/models/Customer";
import { comparePassword, generateOtp } from "@/lib/server/utils";
import { OtpType } from "@/lib/enums";
import Otp from "@/models/Otp";

type LoginProps = Pick<TCustomer, "contact_number" | "password">;

export const login = async (customerData: LoginProps) => {
  await connect();

  try {
    const customer: TCustomerDoc = await Customer.findOne({
      contact_number: customerData.contact_number,
    }).lean();
    if (customer) {
      const isPasswordCorrect = await comparePassword(
        customerData.password,
        customer.password,
      );
      if (isPasswordCorrect) {
        if (!customer.is_number_verify) {
          const code = generateOtp();
          await Otp.deleteMany({
            customer_id: customer._id,
            type: OtpType.REGISTRATION,
          });
          const otp = new Otp({
            customer_id: customer._id,
            otp: code,
            type: OtpType.REGISTRATION,
          });
          otp.save();
        }
        return {
          success: true,
          message:
            "You’ve successfully logged in. Welcome back to your premium experience!",
          customer: {
            customer_id: customer._id.toString(),
            is_number_verify: customer.is_number_verify,
          },
        };
      }
    }

    return {
      success: false,
      message:
        "Incorrect details. Please check your information and try again.",
    };
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while creating your account. Please try again later.",
    };
  }
};
