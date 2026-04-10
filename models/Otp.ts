import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

import Customer from "./Customer";
import { OtpType } from "@/lib/enums";

export type TOtp = InferSchemaType<typeof otpSchema>;
export type TOtpDoc = HydratedDocument<TOtp>;

const otpSchema = new Schema({
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: Customer.modelName,
    required: true,
  },
  otp: { type: String, required: true },
  type: { type: String, enum: OtpType, required: true },
  created_at: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

const Otp = models.Otp || model("Otp", otpSchema);

export default Otp;
