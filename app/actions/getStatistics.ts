"use server";

import connect from "@/lib/db/mongodb";
import { BookingStatus, InquiryStatus } from "@/lib/enums";
import Booking from "@/models/Booking";
import Inquiry from "@/models/Inquiry";
import { Visit } from "@/models/Visit";

export type StatisticsResponse = {
  visit: {
    total: number;
    today: number;
  };
  inquiry: InquiryStats;
  booking: BookingStats;
};

export type InquiryStats = {
  total: number;
} & Record<InquiryStatus, number>;

export type BookingStats = {
  total: number;
} & Record<BookingStatus, number>;

export const getStatistics = async (): Promise<StatisticsResponse> => {
  await connect();

  const inquiry = await Inquiry.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const inquiryResult = Object.values(InquiryStatus).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {
      total: 0,
    } as InquiryStats,
  );

  for (const item of inquiry) {
    const status = item._id as InquiryStatus;

    if (status in inquiryResult) {
      inquiryResult[status] = item.count;
      inquiryResult.total += item.count;
    }
  }

  const booking = await Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const bookingResult = Object.values(BookingStatus).reduce(
    (acc, status) => {
      acc[status] = 0;
      return acc;
    },
    {
      total: 0,
    } as BookingStats,
  );

  for (const item of booking) {
    const status = item._id as BookingStatus;

    if (status in bookingResult) {
      bookingResult[status] = item.count;
      bookingResult.total += item.count;
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // start of tomorrow

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

  return {
    visit: { total, today: count },
    inquiry: inquiryResult,
    booking: bookingResult,
  };
};
