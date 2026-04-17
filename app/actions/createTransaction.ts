"use server";

import connect from "@/lib/db/mongodb";

import { Types, UpdateQuery } from "mongoose";
import Transaction, { TTransaction } from "@/models/Transaction";
import { TService } from "@/models/Service";
import Customer, { TCustomerDoc } from "@/models/Customer";
import VehicleSize, { TVehicleSizeDoc } from "@/models/VehicleSize";
import MilestoneClaimed from "@/models/MilestoneClaimed";
import { getSmsContent, SmsType } from "@/lib/getSmsTemplate";
import { CustomerBadge } from "@/lib/enums";
import { sendMessage } from "@/lib/sendMessage";
import Booking from "@/models/Booking";
import Badge, { TBadgeDoc } from "@/models/Badge";
import Referral from "@/models/Referral";
import { getPromotionDetails } from "./getPromotionDetails";

type ServiceProps = Pick<TService, "title" | "type" | "price"> & {
  _id: string;
  discount: number;
};

type CreateTransactionProps = Omit<
  TTransaction,
  | "services"
  | "customer_id"
  | "booking_id"
  | "created_at"
  | "updated_at"
  | "name"
  | "promotion_id"
> & {
  services: ServiceProps[];
  milestone_reward: {
    _id: string;
    service_id: string;
    title: string;
    required_progress_count: number;
    price: number;
  } | null;
  milestone_discount: number;
  customer_id: string | null;
  booking_id: string | null;
  promotion_id: string | null;
};

const config = {
  referral_points: Number.parseInt(
    process.env.REFERRAL_PROGRAM_BASE_POINTS ?? "50",
  ),
};

export const createTransaction = async (
  transactionData: CreateTransactionProps,
) => {
  await connect();
  let message = "";
  let contactNumber = "";
  let referenceNumber = "";

  if (transactionData.booking_id) {
    const bookingTransaction = await Transaction.findOne({
      booking_id: new Types.ObjectId(transactionData.booking_id),
    });

    if (bookingTransaction)
      return {
        success: false,
        message: "A transaction for this booking has already been created.",
      };
  }

  let services = transactionData.services;

  try {
    if (
      transactionData.promotion_id &&
      transactionData.customer_id &&
      transactionData.promo_code_used
    ) {
      const result = await getPromotionDetails(transactionData.promotion_id, [
        ...services,
      ]);
      if (result.success) {
        services = result.data?.services ?? [];
      }
    }

    const data = {
      customer_id: transactionData.customer_id
        ? new Types.ObjectId(transactionData.customer_id)
        : null,
      booking_id: transactionData.booking_id
        ? new Types.ObjectId(transactionData.booking_id)
        : null,
      promotion_id: transactionData.promotion_id
        ? new Types.ObjectId(transactionData.promotion_id)
        : null,
      promo_code_used: transactionData.promo_code_used,
      transaction_from: transactionData.transaction_from,
      vehicle_type: transactionData.vehicle_type,
      vehicle_size: transactionData.vehicle_size,
      vehicle_model: transactionData.vehicle_model,
      plate_number: transactionData.plate_number,
      services,
      discount_type: transactionData.discount_type,
      notes: transactionData.notes,
      reservation_fee: transactionData.reservation_fee,
      total_service_amount: transactionData.total_service_amount,
      additional_cost: transactionData.additional_cost,
      points: transactionData.points,
      travel_fee: transactionData.travel_fee,
      discount: transactionData.discount,
      points_used: transactionData.points_used,
      net_total: transactionData.net_total,
      gross_total: transactionData.gross_total,
      total_discount: transactionData.total_discount,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newTransaction = new Transaction(data);
    await newTransaction.save();

    if (transactionData.booking_id) {
      const booking = await Booking.findById(transactionData.booking_id)
        .select("reference_number first_name contact_number")
        .lean();
      if (booking) {
        message = getSmsContent(
          {
            name: booking.first_name,
            model: transactionData.vehicle_model,
            type: SmsType.COMPLETED,
            ref: booking.reference_number,
            date: "",
            points: transactionData.points?.service.toString(),
          },
          !transactionData.customer_id,
        );
        contactNumber = booking.contact_number;
        referenceNumber = booking.reference_number;
      }
    }

    let badgePoints = 0;
    if (transactionData.customer_id) {
      const customer: TCustomerDoc = await Customer.findById(
        transactionData.customer_id,
      ).lean();
      const vehicleSize: TVehicleSizeDoc = await VehicleSize.findOne({
        size: transactionData.vehicle_size,
        type: transactionData.vehicle_type,
      }).lean();
      if (customer && vehicleSize) {
        const isAvailedWash = transactionData.services.find((service) =>
          ["Premium Detailer Wash", "Full Decontamination Wash"].includes(
            service.title,
          ),
        );

        const milestone_count = customer.milestone_count.map((count) => {
          if (count.size_id.toString() === vehicleSize._id.toString()) {
            let newProgress = count.progress;
            if (transactionData.milestone_reward) {
              newProgress = Math.max(
                0,
                count.progress -
                  transactionData.milestone_reward.required_progress_count,
              );
            } else if (isAvailedWash) {
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
          customer_id: customer._id,
          service_id: transactionData.milestone_reward?.service_id,
          reward_id: transactionData.milestone_reward?._id,
          transaction_id: newTransaction._id,
          price: transactionData.milestone_reward?.price,
          size_id: vehicleSize._id,
          vehicle_model: transactionData.vehicle_model,
          discount: transactionData.milestone_discount,
          created_at: new Date(),
          updated_at: new Date(),
        };

        let selectedBadge = {};

        if (!customer.badge) {
          const theApexBadge: TBadgeDoc = await Badge.findOneAndUpdate(
            {
              title: CustomerBadge.THE_APEX,
              $expr: { $lt: ["$count", "$limit"] },
            },
            { $inc: { count: 1 } },
          ).lean();

          if (theApexBadge) {
            selectedBadge = {
              badge_id: theApexBadge._id,
              count: theApexBadge.count + 1,
            };
            badgePoints = theApexBadge.points;
          } else {
            const pitCrewBadge: TBadgeDoc = await Badge.findOneAndUpdate(
              { title: CustomerBadge.PIT_CREW },
              { $inc: { count: 1 } },
            ).lean();

            selectedBadge = {
              badge_id: pitCrewBadge._id,
              count: pitCrewBadge.count + 1,
            };
            badgePoints = pitCrewBadge.points;
          }
        }

        let referralPoints = 0;
        if (customer.referred_by) {
          const referral = await Referral.findOne({
            referrer_id: customer.referred_by,
            referee_id: customer._id,
            reward_given: false,
          });
          const referrer = await Customer.findById(customer.referred_by);

          if (referral && referrer.badge) {
            referralPoints = config.referral_points;
            const message = getSmsContent({
              type: SmsType.REFERRAL_REWARD_UNLOCKED,
              name: "",
              friendName: customer.first_name,
              points: config.referral_points.toString(),
              ref: "",
            });

            sendMessage({ message, phoneNumbers: [referrer.contact_number] });

            referral.reward_given = true;
            referral.updated_at = new Date();
            await referral.save();
            referrer.earned_points = referrer.earned_points + referralPoints;
            await referrer.save();
          }
        }

        const servicePoints = transactionData.points?.service ?? 0;
        const update: UpdateQuery<{
          milestone_count: number;
          earned_points: number;
          milestone_claimed: unknown[];
        }> = {
          $set: {
            milestone_count,
            earned_points:
              customer_updated_points +
              servicePoints +
              badgePoints +
              referralPoints,
            ...(customer.is_verify
              ? {}
              : {
                  verified_at: new Date(),
                  is_verify: true,
                  badge: { ...selectedBadge },
                }),
            updated_at: new Date(),
          },
        };

        if (transactionData.milestone_reward) {
          await MilestoneClaimed.create(claimedMilestone);
        }

        await Customer.findByIdAndUpdate(transactionData.customer_id, update);
        await Transaction.findByIdAndUpdate(newTransaction._id, {
          $set: {
            points: {
              total: newTransaction.points.total + badgePoints + referralPoints,
              service: newTransaction.points.service,
              badge: badgePoints,
              referral: referralPoints,
            },
          },
        });
      }

      if (badgePoints > 0) {
        const firstCompletedMessage = getSmsContent(
          {
            name: customer.first_name,
            type:
              badgePoints === 20
                ? SmsType.FIRST_SERVICE_COMPLETE
                : SmsType.FIRST_FIFTEEN_REWARD,
            ref: "",
          },
          !transactionData.customer_id,
        );
        sendMessage({
          message: firstCompletedMessage,
          phoneNumbers: [contactNumber],
        });
      }

      message = getSmsContent(
        {
          name: customer.first_name,
          model: transactionData.vehicle_model,
          type: SmsType.COMPLETED,
          ref: referenceNumber,
          date: "",
          points: transactionData.points?.service.toString(),
        },
        !transactionData.customer_id,
      );
      contactNumber = customer.contact_number;
    }

    if (message !== "" && contactNumber !== "") {
      sendMessage({ message, phoneNumbers: [contactNumber] });
    }

    return {
      success: true,
      message: "Transaction created successfully.",
    };
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err) {
      const mongoError = err as {
        code: number | string;
        keyPattern?: Record<string, number>;
      };

      if (mongoError.code === 11000) {
        return {
          success: false,
          message:
            "A transaction for this booking has already been created. Please check your records.",
        };
      }
    }

    return {
      success: false,
      message:
        "Something went wrong while creating the transaction. Please try again later.",
    };
  }
};
