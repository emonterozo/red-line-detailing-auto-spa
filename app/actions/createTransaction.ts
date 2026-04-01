"use server";

import connect from "@/lib/db/mongodb";
import { ITransaction } from "@/lib/db/types";

import { Types } from "mongoose";
import Transaction from "@/models/Transaction";
import Customer from "@/models/Customer";
import VehicleSize from "@/models/VehicleSize";

export const createTransaction = async (transactionData: ITransaction) => {
  await connect();

  try {
    let total_amount = transactionData.total_amount;
    let total_discount = transactionData.total_discount;
    let milestone_required_progress_count = 0;
    const services = transactionData.services.map((service) => {
      return {
        _id: new Types.ObjectId(service._id),
        title: service.title,
      };
    });

    if (transactionData.milestone_reward) {
      services.push({
        _id: new Types.ObjectId(transactionData.milestone_reward._id),
        title: transactionData.milestone_reward.title,
      });
      total_amount += transactionData.milestone_reward.price;
      total_discount += transactionData.milestone_discount;
      milestone_required_progress_count =
        transactionData.milestone_reward.required_progress_count;
    }

    const total_amount_paid = total_amount - total_discount;
    const points_earned = Math.floor(total_amount_paid / 100) * 2;

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
      services,
      travel_fee: transactionData.travel_fee,
      total_amount,
      total_discount,
      points_used: transactionData.total_discount,
      total_amount_paid,
      points_earned,
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
        const isAvailedPremiumWash = services.find(service => service.title === 'Premium Detailer Wash')
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const milestone_count = customer.milestone_count.map((count: any) => {
          if (count.size_id.toString() === vehicleSize._id.toString()) {
            let newProgress = count.progress;
            if (milestone_required_progress_count > 0) {
              newProgress = Math.max(
                0,
                count.progress - milestone_required_progress_count
              )
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
          customer.earned_points - transactionData.total_discount,
        );
        await Customer.findByIdAndUpdate(transactionData.user_id, {
          $set: {
            milestone_count,
            earned_points: customer_updated_points + points_earned,
          },
        });
      }
    }

    return {
      success: true,
      message: "Transaction created successfully.",
    };
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while creating the transaction. Please try again later.",
    };
  }
};
