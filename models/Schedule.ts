import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

export type TSchedule = InferSchemaType<typeof scheduleSchema>;
export type TScheduleDoc = HydratedDocument<TSchedule>;



const scheduleSchema = new Schema({
  date: { type: Date, required: true, unique: true },
  time_slots: {
    type: [
      new Schema({
        time: { type: String, required: true },
        is_available: { type: Boolean, required: true },
      }),
    ],
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Schedule = models.Schedule || model("Schedule", scheduleSchema);

export default Schedule;
