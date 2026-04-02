"use server";

import connect from "@/lib/db/mongodb";
import { ITransaction } from "@/lib/db/types";

import { Types, UpdateQuery } from "mongoose";
import Transaction from "@/models/Transaction";
import Customer from "@/models/Customer";
import VehicleSize from "@/models/VehicleSize";

export const createTransaction = async (transactionData: ITransaction) => {
  await connect();

  try {
    const data = {
      user_id: transactionData.user_id
        ? new Types.ObjectId(transactionData.user_id)
        : null,
      booking_id: transactionData.booking_id
        ? new Types.ObjectId(transactionData.booking_id)
        : null,
      transaction_from: transactionData.transaction_from,
      vehicle_type: transactionData.vehicle_type,
      vehicle_size: transactionData.vehicle_size,
      vehicle_model: transactionData.vehicle_model,
      services: transactionData.services,
      travel_fee: transactionData.travel_fee,
      total_amount: transactionData.total_amount,
      total_discount: transactionData.total_discount,
      points_used: transactionData.points_used,
      total_amount_paid: transactionData.total_amount_paid,
      points_earned: transactionData.points_earned,
    };

    const newTransaction = new Transaction(data);
    await newTransaction.save();

    if (transactionData.user_id) {
      const customer = await Customer.findById(transactionData.user_id);
      const vehicleSize = await VehicleSize.findOne({
        size: transactionData.vehicle_size,
        type: transactionData.vehicle_type,
      });
      if (customer && vehicleSize) {
        const isAvailedPremiumWash = transactionData.services.find(
          (service) => service.title === "Premium Detailer Wash",
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const milestone_count = customer.milestone_count.map((count: any) => {
          if (count.size_id.toString() === vehicleSize._id.toString()) {
            let newProgress = count.progress;
            if (transactionData.milestone_reward) {
              newProgress = Math.max(
                0,
                count.progress -
                  transactionData.milestone_reward.required_progress_count,
              );
            } else if (isAvailedPremiumWash) {
              newProgress = newProgress + 1;
            }
            return {
              _id: count._id,
              size_id: count.size_id,
              progress: newProgress,
            };
          }
          return count;
        });

        const customer_updated_points = Math.max(
          0,
          customer.earned_points - transactionData.points_used,
        );
        const claimedMilestone = {
          service_id: transactionData.milestone_reward?._id,
          price: transactionData.milestone_reward?.price,
          size_id: vehicleSize._id,
          vehicle_model: transactionData.vehicle_model,
          discount: transactionData.milestone_discount,
        };
        const update: UpdateQuery<{
          milestone_count: number;
          earned_points: number;
          milestone_claimed: unknown[];
        }> = {
          $set: {
            milestone_count,
            earned_points:
              customer_updated_points + transactionData.points_earned,
          },
        };

        if (transactionData.milestone_reward) {
          update.$push = {
            milestone_claimed: claimedMilestone,
          };
        }

        await Customer.findByIdAndUpdate(transactionData.user_id, update);
      }
    }

    return {
      success: true,
      message: "Transaction created successfully.",
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message:
        "Something went wrong while creating the transaction. Please try again later.",
    };
  }
};
