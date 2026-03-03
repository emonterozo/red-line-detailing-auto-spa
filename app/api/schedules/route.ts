import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connect from "@/lib/db/mongodb";
import Schedule from "@/models/Schedule";
import { ITimeSlot } from "@/lib/db/types";

interface IScheduleRequest {
  date: string;
  time_slots: {
    time: string;
    is_available: boolean;
  }[];
}

interface IScheduleResponse {
  _id: string;
  date: string;
  time_slots: {
    _id: string;
    time: string;
    is_available: boolean;
  }[];
}

export async function POST(req: Request) {
  try {
    await connect();

    const body: IScheduleRequest[] = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Expected an array of schedules" },
        { status: 400 },
      );
    }

    const normalizedBody = body.map((schedule) => ({
      ...schedule,
      date: (() => {
        const d = new Date(schedule.date);
        d.setHours(23, 59, 59, 59);
        return d;
      })(),
    }));

    const schedules = await Schedule.insertMany(normalizedBody);

    const formatted: IScheduleResponse[] = schedules.map((schedule) => ({
      _id: schedule._id.toString(),
      date: schedule.date.toISOString(),
      time_slots: schedule.time_slots.map(
        (slot: ITimeSlot & { _id: Types.ObjectId }) => ({
          _id: slot._id.toString(),
          time: slot.time,
          is_available: slot.is_available,
        }),
      ),
    }));

    return NextResponse.json(
      { success: true, schedules: formatted },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
