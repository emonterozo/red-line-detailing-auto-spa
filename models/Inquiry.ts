import { Schema, model, models } from "mongoose";

import { IInquiry } from "@/lib/db/types";
import { InquiryStatus } from "@/lib/enums";

const serviceSchema = new Schema<IInquiry>({
  name: { type: String, required: true },
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

const Inquiry = models.Inquiry || model<IInquiry>("Inquiry", serviceSchema);

export default Inquiry;
