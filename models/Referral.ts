import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";
import Customer, { TCustomerDoc } from "./Customer";

export type TReferral = InferSchemaType<typeof referralSchema>;
export type TReferralDoc = HydratedDocument<TReferral>;

export type ReferralWithPopulatedData = Omit<
  TReferralDoc,
  "referrer_id" | "referee_id"
> & {
  referrer_id: TCustomerDoc;
  referee_id: TCustomerDoc;
};

const referralSchema = new Schema({
  referrer_id: {
    type: Schema.Types.ObjectId,
    ref: Customer.modelName,
    required: true,
  },
  referee_id: {
    type: Schema.Types.ObjectId,
    ref: Customer.modelName,
    required: true,
  },
  referral_code: { type: String, required: true },
  reward_given: { type: Boolean, required: true },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

const Referral = models.Referral || model("Referral", referralSchema);

export default Referral;
