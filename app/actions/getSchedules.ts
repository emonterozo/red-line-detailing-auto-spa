"use server";

import connect from "@/lib/db/mongodb";

import Schedule from "@/models/Schedule";
import { ISchedule, ITimeSlot } from "@/lib/db/types";

export interface ISchedulesResponse extends Omit<ISchedule, "time_slots"> {
  _id: string;
  time_slots: (ITimeSlot & { _id: string })[];
}

export const getSchedules = async () => {
  await connect();

  const schedulesDoc = (await Schedule.find(
    {},
  ).lean()) as unknown as ISchedulesResponse[];

  const schedulesJson: ISchedulesResponse[] = schedulesDoc.map((schedule) => {
    const formattedTimeSlots = schedule.time_slots.map((slot) => ({
      ...slot,
      _id: slot._id.toString(),
    }));

    return {
      ...schedule,
      _id: schedule._id.toString(),
      time_slots: formattedTimeSlots,
    };
  });

  return schedulesJson;
};
