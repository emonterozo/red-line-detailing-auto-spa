import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

import { InquiryStatus } from "@/lib/enums";

export type TInquiry = InferSchemaType<typeof inquirySchema>;
export type TInquiryDoc = HydratedDocument<TInquiry>;

const inquirySchema = new Schema({
  name: { type: String, required: true },
  contact_number: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: InquiryStatus,
    default: InquiryStatus.NEW,
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Inquiry = models.Inquiry || model("Inquiry", inquirySchema);

export default Inquiry;
