import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";

export type TVisit = InferSchemaType<typeof visitSchema>;
export type TVisitDoc = HydratedDocument<TVisit>;

const visitSchema = new Schema(
  {
    ip: { type: String, required: true },
    date: { type: Date, required: true },
  },
);


visitSchema.index({ ip: 1, date: 1 }, { unique: true });

export const Visit =
  mongoose.models.Visit || mongoose.model("Visit", visitSchema);