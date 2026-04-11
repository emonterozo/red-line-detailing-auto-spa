"use server";

import connect from "@/lib/db/mongodb";
import Customer, { TCustomer } from "@/models/Customer";
import { generateReferralCode, hashPassword } from "@/lib/server/utils";
import VehicleSize, { TVehicleSizeDoc } from "@/models/VehicleSize";
import { OtpType } from "@/lib/enums";
import Referral from "@/models/Referral";
import { sendOtp } from "./sendOtp";

type CreateCustomerProps = Pick<
  TCustomer,
  "first_name" | "last_name" | "contact_number" | "password"
> & {
  referral_code?: string;
};

export const createCustomer = async (customerData: CreateCustomerProps) => {
  await connect();

  try {
    const vehicleSizeDoc: TVehicleSizeDoc[] = await VehicleSize.find().lean();
    const milestone_count = vehicleSizeDoc.map((item) => ({
      size_id: item._id,
      progress: 0,
    }));

    let referred_by = null;
    if (customerData.referral_code) {
      const referrer = await Customer.findOne({
        referral_code: customerData.referral_code,
      }).lean();

      if (referrer) {
        referred_by = referrer._id;
      }
    }

    const password = await hashPassword(customerData.password);
    const code = generateReferralCode(customerData.first_name);
    const customer = new Customer({
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      name: `${customerData.first_name} ${customerData.last_name}`,
      contact_number: customerData.contact_number,
      password: password,
      milestone_count: milestone_count,
      referral_code: code,
      referred_by: referred_by,
    });
    await customer.save();

    const result = await sendOtp(
      customer._id.toString(),
      customerData.contact_number,
      OtpType.REGISTRATION,
    );

    if (referred_by) {
      const referral = new Referral({
        referrer_id: referred_by,
        referee_id: customer._id,
        referral_code: customerData.referral_code,
        reward_given: false,
      });
      await referral.save();
    }

    return {
      success: true,
      message:
        "Your account has been created successfully. Welcome to your premium experience!",
      customer_id: customer._id.toString(),
      retry_after: result.retry_after,
    };
  } catch (err: unknown) {
    let message =
      "Something went wrong while creating your account. Please try again later.";

    if (err && typeof err === "object" && "code" in err) {
      interface MongoDuplicateError {
        code: number | string;
        keyPattern?: Record<string, number>;
        keyValue?: Record<string, string>;
      }

      const mongoError = err as MongoDuplicateError;

      if (mongoError.code === 11000 || mongoError.code === "11000") {
        const field = mongoError.keyPattern
          ? Object.keys(mongoError.keyPattern)[0]
          : "";

        if (field === "contact_number") {
          message =
            "This contact number is already in use. Please use a different number.";
        }

        return {
          success: false,
          message,
        };
      }
    }

    return {
      success: false,
      message,
    };
  }
};
