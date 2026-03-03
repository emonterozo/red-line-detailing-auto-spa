import { ISchedule, ITimeSlot } from "@/lib/db/types";
import { Schema, model, models } from "mongoose";



const scheduleSchema = new Schema<ISchedule>({
 date: { type: Date, required: true },
 time_slots: {
    type: [
      new Schema<ITimeSlot>({
        time: { type: String, required: true },
        is_available: { type: Boolean, required: true }
      })
    ],
    required: true
  },
});

const Schedule = models.Schedule || model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;