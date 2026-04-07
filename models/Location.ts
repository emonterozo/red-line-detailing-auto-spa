import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

export type TLocation = InferSchemaType<typeof locationSchema>;
export type TLocationDoc = HydratedDocument<TLocation>;

const locationSchema = new Schema({
  ip: { type: String, required: true },
  location: {
    type: {
      type: String, 
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  address: { type: String, required: true },
  distance: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

locationSchema.index({ location: "2dsphere" });

const Location = models.Location || model("Location", locationSchema);

export default Location;
