"use server";

import connect from "@/lib/db/mongodb";
import Customer, { TCustomer } from "@/models/Customer";
import { Types } from "mongoose";

type UpdateCustomerProfile = Partial<
  Pick<
    TCustomer,
    | "first_name"
    | "last_name"
    | "address"
    | "google_address"
    | "email"
    | "social"
    | "travel_distance"
  > & {
    longitude: number;
    latitude: number;
  }
>;

interface CustomerUpdatePayload extends UpdateCustomerProfile {
  updated_at: Date;
  address_updated_at?: Date;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export const updateCustomerProfile = async (
  id: string,
  data: UpdateCustomerProfile,
) => {
  await connect();

  try {
    const updatePayload: CustomerUpdatePayload = {
      ...data,
      updated_at: new Date(),
    };

    if (
      data.address ||
      (data.latitude !== undefined && data.longitude !== undefined)
    ) {
      updatePayload.address_updated_at = new Date();

      if (data.latitude !== undefined && data.longitude !== undefined) {
        updatePayload.location = {
          type: "Point",
          coordinates: [data.longitude, data.latitude],
        };

        delete updatePayload.latitude;
        delete updatePayload.longitude;
      }
    }

    const result = await Customer.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: updatePayload },
    );

    if (!result) {
      return { success: false, message: "Customer not found." };
    }

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Update Error:", error);
    return {
      success: false,
      message: "Something went wrong while updating the profile.",
    };
  }
};
