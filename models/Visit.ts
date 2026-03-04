import mongoose, { Schema } from "mongoose";

const VisitSchema = new Schema(
  {
    ip: { type: String, required: true },
    date: { type: Date, required: true },
  },
);


VisitSchema.index({ ip: 1, date: 1 }, { unique: true });

export const Visit =
  mongoose.models.Visit || mongoose.model("Visit", VisitSchema);