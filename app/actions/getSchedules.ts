"use server";

import connect from "@/lib/db/mongodb";

import Schedule, { TSchedule, TScheduleDoc } from "@/models/Schedule";

type ScheduleSelectFields =
  | keyof TSchedule
  | "time_slots._id"
  | "time_slots.time"
  | "time_slots.is_available";

const SCHEDULE_FIELDS: ScheduleSelectFields[] = [
  "date",
  "time_slots._id",
  "time_slots.time",
  "time_slots.is_available",
];

export type ScheduleResponse = Omit<
  TSchedule,
  "_id" | "time_slots" | "created_at" | "updated_at"
> & {
  _id: string;
  time_slots: {
    _id: string;
    is_available: boolean;
    time: string;
  }[];
};

export const getSchedules = async (): Promise<ScheduleResponse[]> => {
  await connect();

  const schedulesDoc: TScheduleDoc[] = await Schedule.find({})
    .select(SCHEDULE_FIELDS.join(" "))
    .lean();

  const schedulesJson = schedulesDoc.map((schedule) => {
    const formattedTimeSlots = schedule.time_slots.map((slot) => ({
      _id: slot._id.toString(),
      time: slot.time,
      is_available: slot.is_available,
    }));

    return {
      _id: schedule._id.toString(),
      date: schedule.date,
      time_slots: formattedTimeSlots,
    };
  });

  return schedulesJson;
};
