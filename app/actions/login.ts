"use server";

import connect from "@/lib/db/mongodb";
import Customer, { TCustomer, TCustomerDoc } from "@/models/Customer";
import { comparePassword } from "@/lib/server/utils";
import { OtpType } from "@/lib/enums";
import { sendOtp } from "./sendOtp";
import { formatCountdown } from "@/lib/utils";

type LoginProps = Pick<TCustomer, "contact_number" | "password">;

const now = Date.now();

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
        let retry_after = 0;
        if (!customer.is_number_verify && customer.otp_send_blocked_until) {
          
          const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
          console.log(oneHourLater)

          const countDown = formatCountdown(
            Math.ceil((customer.otp_send_blocked_until.getTime() - now) / 1000),
          );

          return {
            success: false,
            message: `Too many attempts detected. Access is restricted for ${countDown}.`,
          };
        } else if (!customer.is_number_verify) {
          const result = await sendOtp(
            customer._id.toString(),
            customerData.contact_number,
            OtpType.REGISTRATION,
          );
          retry_after = result.retry_after;
        }
        return {
          success: true,
          message:
            "You’ve successfully logged in. Welcome back to your premium experience!",
          customer: {
            customer_id: customer._id.toString(),
            is_number_verify: customer.is_number_verify,
          },
          retry_after: retry_after,
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
