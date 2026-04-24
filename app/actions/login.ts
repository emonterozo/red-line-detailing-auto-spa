"use server";

import Customer, { TCustomer } from "@/models/Customer";
import { OtpType } from "@/lib/enums";
import { sendOtp } from "./sendOtp";
import { formatCountdown } from "@/lib/utils";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

type LoginProps = Pick<TCustomer, "contact_number" | "password">;

export const login = async (customerData: LoginProps) => {
  const contact_number = customerData.contact_number;
  const password = customerData.password;

  try {
    await signIn("credentials", {
      contact_number,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      const errorType = error.cause?.err?.message || error.type;

      switch (errorType) {
        case "INVALID_CREDENTIALS":
        case "CredentialsSignin":
          return {
            success: false,
            message:
              "Incorrect details. Please check your information and try again.",
          };
        case "TOO_MANY_ATTEMPTS": {
          const customer = await Customer.findOne({
            contact_number: contact_number,
          }).lean();

          const now = Date.now();
          const countDown = Math.ceil(
            (customer.otp_send_blocked_until.getTime() - now) / 1000,
          );

          return {
            success: false,
            message: `Too many attempts detected. Access is restricted for ${formatCountdown(countDown)}`,
            retry_after: countDown,
          };
        }
        case "SERVER_ERROR":
          return {
            success: false,
            message: "Our systems are having trouble. Please try again later.",
          };
        case "CUSTOMER_NOT_VERIFY": {
          const customer = await Customer.findOne({
            contact_number: contact_number,
          }).lean();

          const result = await sendOtp(
            customer._id.toString(),
            contact_number,
            OtpType.REGISTRATION,
          );
          return {
            success: false,
            message:
              "You’ve successfully logged in. Welcome back to your premium experience!",
            customer: {
              customer_id: customer._id.toString(),
              is_verify: customer.is_verify,
            },
            retry_after: result.retry_after,
          };
        }

        default:
          return {
            success: false,
            message: "An unexpected authentication error occurred.",
          };
      }
    }
  }
};
