"use server";

import { OtpType } from "@/lib/enums";
import { generateOtp } from "@/lib/server/utils";
import Otp from "@/models/Otp";
import { Types } from "mongoose";
import connect from "@/lib/db/mongodb";
import Customer from "@/models/Customer";
import { sendMessage } from "@/lib/sendMessage";

const otpMessageTemplate = (otpCode: string, type: OtpType) => {
  const baseMessage = `Your verification code is ${otpCode}.`;
  const brand = `\n\n- Red Line Detailing & Auto Spa ✨`;

  switch (type) {
    case OtpType.REGISTRATION:
      return (
        `${baseMessage} It will expire in 3 minutes. Use it to complete your registration.` +
        brand
      );

    default:
      return `${baseMessage} It will expire in 3 minutes.` + brand;
  }
};

export const sendOtp = async (
  customer_id: string,
  contact_number: string,
  type: OtpType,
) => {
  await connect();

  const now = Date.now();
  const LIMIT = 5;
  const BLOCK_TIME = 24 * 60 * 60 * 1000;

  const customer = await Customer.findById(customer_id);

  if (
    customer.otp_send_blocked_until &&
    customer.otp_send_blocked_until.getTime() > now
  ) {
    return {
      success: false,
      message: "You’ve reached the maximum number of attempts",
      resend_count: customer.otp_send_count,
      remaining_send: 0,
      retry_after: Math.ceil(
        (customer.otp_send_blocked_until.getTime() - now) / 1000,
      ),
    };
  }

  if (
    !customer.otp_send_window_start ||
    now - customer.otp_send_window_start.getTime() > BLOCK_TIME
  ) {
    customer.otp_send_window_start = new Date();
    customer.otp_send_count = 0;
  }

  if (customer.otp_send_count >= LIMIT) {
    customer.otp_send_blocked_until = new Date(now + BLOCK_TIME);
    await customer.save();

    return {
      success: false,
      message: "You’ve reached the maximum number of attempts.",
      resend_count: customer.otp_send_count,
      remaining_send: 0,
      retry_after: BLOCK_TIME / 1000,
    };
  }

  const existingOtp = await Otp.findOne({
    customer_id: new Types.ObjectId(customer_id),
    type,
  });

  if (existingOtp) {
    const expiresAt = existingOtp.created_at.getTime() + 180 * 1000;

    const isStillValid = now < expiresAt;

    if (isStillValid) {
      const retry_after = Math.max(0, Math.ceil((expiresAt - now) / 1000));

      return {
        success: false,
        message: "You can request a new code after the timer ends.",
        resend_count: customer.otp_send_count,
        remaining_send: LIMIT - customer.otp_send_count,
        retry_after,
      };
    }
  }

  const otpCode = generateOtp();

  await Otp.create({
    customer_id: new Types.ObjectId(customer_id),
    type,
    otp: otpCode,
    created_at: new Date(),
  });

  sendMessage({
    message: otpMessageTemplate(otpCode, type),
    phoneNumbers: [contact_number],
  });

  customer.otp_send_count += 1;

  if (!customer.otp_send_window_start) {
    customer.otp_send_window_start = new Date();
  }

  await customer.save();

  return {
    success: true,
    message: "We’ve sent you a verification code.",
    resend_count: customer.otp_send_count,
    remaining_send: LIMIT - customer.otp_send_count,
    retry_after: 180,
  };
};
