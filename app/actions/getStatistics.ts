"use server";

import connect from "@/lib/db/mongodb";
import {
  BookingStatus,
  DiscountType,
  InquiryStatus,
  TransactionFrom,
} from "@/lib/enums";
import Booking from "@/models/Booking";
import Customer from "@/models/Customer";
import Inquiry from "@/models/Inquiry";
import Transaction from "@/models/Transaction";
import { Visit } from "@/models/Visit";

export type StatisticsResponse = {
  visit: {
    total: number;
    today: number;
  };
  customer: {
    total: number;
    new_this_month: number;
  };
  inquiry: {
    total: number;
    new_inquiry: number;
    completed: number;
  };
  booking: {
    total: number;
    reserved: number;
    completed: number;
  };
  transaction: {
    total: number;
    walk_ins: number;
    bookings: number;
  };
  revenue: {
    total_gross_amount: number;
    total_net_amount: number;
    avg_ticket_gross: number;
  };
  discount: {
    total: number;
    promotions: number;
    manual: number;
  };
};

const getWebsiteVisits = async (today: Date, tomorrow: Date) => {
  const result = await Visit.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        today: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$date", today] },
                  { $lt: ["$date", tomorrow] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);
  let total = 0;
  let count = 0;

  if (result[0]) {
    total = result[0].total;
    count = result[0].today;
  }

  return { total, today: count };
};

const getCustomers = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setMilliseconds(-1);

  const result = await Customer.aggregate([
    {
      $match: {
        created_at: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $count: "total_customers",
    },
  ]);

  const total = await Customer.countDocuments();

  return {
    total,
    new_this_month: result.length > 0 ? result[0].total_customers : 0,
  };
};

const getInquiry = async () => {
  const total = await Inquiry.countDocuments();
  const new_inquiry = await Inquiry.countDocuments({
    status: InquiryStatus.NEW,
  });
  const completed = await Inquiry.countDocuments({
    status: InquiryStatus.COMPLETED,
  });

  return { total, new_inquiry, completed };
};

const getBooking = async () => {
  const total = await Booking.countDocuments();
  const reserved = await Booking.countDocuments({
    status: BookingStatus.RESERVED,
  });
  const completed = await Booking.countDocuments({
    status: BookingStatus.COMPLETED,
  });

  return { total, reserved, completed };
};

const getTransaction = async () => {
  const total = await Transaction.countDocuments();
  const walk_ins = await Transaction.countDocuments({
    transaction_from: TransactionFrom.WALK_IN,
  });
  const bookings = await Transaction.countDocuments({
    transaction_from: TransactionFrom.BOOKING,
  });

  return { total, walk_ins, bookings };
};

const getDiscountGiven = async () => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: "$discount_type",
        total: { $sum: "$total_discount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const discount = {
    total: 0,
    promotions: 0,
    manual: 0,
  };

  if (result.length > 0) {
    discount.promotions =
      result.find((item) => item._id === DiscountType.PROMOTIONS)?.total ?? 0;
    discount.manual =
      result.find((item) => item._id === DiscountType.MANUAL)?.total ?? 0;
  }

  return {
    ...discount,
    total: discount.promotions + discount.manual,
  };
};

const getRevenue = async () => {
  const result = await Transaction.aggregate([
    {
      $addFields: {
        net_amount: { $subtract: ["$total_amount", "$total_discount"] },
      },
    },
    {
      $group: {
        _id: null,
        total_gross_amount: { $sum: "$total_amount" },
        total_net_amount: { $sum: "$net_amount" },
        total_transactions: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        total_gross_amount: 1,
        total_net_amount: 1,
        avg_ticket_gross: {
          $divide: ["$total_gross_amount", "$total_transactions"],
        },
        avg_ticket_net: {
          $divide: ["$total_net_amount", "$total_transactions"],
        },
      },
    },
  ]);

  return {
    total_gross_amount: result.length > 0 ? result[0].total_gross_amount : 0,
    total_net_amount: result.length > 0 ? result[0].total_net_amount : 0,
    avg_ticket_gross: result.length > 0 ? result[0].avg_ticket_gross : 0,
  };
};

export const getStatistics = async (): Promise<StatisticsResponse> => {
  await connect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const visit = await getWebsiteVisits(today, tomorrow);
  const customer = await getCustomers();
  const inquiry = await getInquiry();
  const booking = await getBooking();
  const transaction = await getTransaction();
  const revenue = await getRevenue();
  const discount = await getDiscountGiven();

  return {
    visit,
    customer,
    inquiry,
    booking,
    transaction,
    revenue,
    discount,
  };
};
