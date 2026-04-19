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
        `${baseMessage} It will expire in 1 minute. Use it to complete your registration.` +
        brand
      );

    default:
      return `${baseMessage} It will expire in 1 minute.` + brand;
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

  // ----------------------------
  // 1. HANDLE BLOCK + AUTO RESET
  // ----------------------------
  if (customer.otp_send_blocked_until) {
    const blockedUntil = customer.otp_send_blocked_until.getTime();

    if (blockedUntil > now) {
      const countDown = Math.ceil((blockedUntil - now) / 1000);

      return {
        success: false,
        message: `Too many attempts detected. Access is restricted for ${countDown}`,
        resend_count: customer.otp_send_count,
        remaining_send: 0,
        retry_after: countDown,
      };
    }

    // ✅ EXPIRED → RESET STATE
    customer.otp_send_blocked_until = null;
    customer.otp_send_count = 0;
    customer.otp_send_window_start = new Date();
  }

  // ----------------------------
  // 2. WINDOW RESET LOGIC
  // ----------------------------
  if (
    !customer.otp_send_window_start ||
    now - customer.otp_send_window_start.getTime() > BLOCK_TIME
  ) {
    customer.otp_send_window_start = new Date();
    customer.otp_send_count = 0;
  }

  // ----------------------------
  // 3. RATE LIMIT CHECK
  // ----------------------------
  if (customer.otp_send_count >= LIMIT) {
    customer.otp_send_blocked_until = new Date(now + BLOCK_TIME);

    await customer.save();

    const countDown = BLOCK_TIME / 1000;

    return {
      success: false,
      message: `Too many attempts detected. Access is restricted for ${countDown}`,
      resend_count: customer.otp_send_count,
      remaining_send: 0,
      retry_after: countDown,
    };
  }

  // ----------------------------
  // 4. OTP VALIDATION WINDOW
  // ----------------------------
  const existingOtp = await Otp.findOne({
    customer_id: new Types.ObjectId(customer_id),
    type,
  });

  if (existingOtp) {
    const expiresAt = existingOtp.created_at.getTime() + 60 * 1000;

    if (now < expiresAt) {
      const retry_after = Math.ceil((expiresAt - now) / 1000);

      return {
        success: false,
        message: "You can request a new code after the timer ends.",
        resend_count: customer.otp_send_count,
        remaining_send: LIMIT - customer.otp_send_count,
        retry_after,
      };
    }
  }

  // ----------------------------
  // 5. GENERATE OTP
  // ----------------------------
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

  // ----------------------------
  // 6. UPDATE COUNTERS
  // ----------------------------
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
    retry_after: 60,
  };
};
