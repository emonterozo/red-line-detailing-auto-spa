import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
  models,
} from "mongoose";

import VehicleSize, { TVehicleSizeDoc } from "./VehicleSize";
import Service, { TServiceDoc } from "./Service";
import Customer, { TCustomerDoc } from "./Customer";
import Transaction, { TTransactionDoc } from "./Transaction";
import MilestoneReward, { TMilestoneRewardDoc } from "./MilestoneReward";

export type TMilestoneClaimed = InferSchemaType<typeof milestoneClaimedSchema>;
export type TMilestoneClaimedDoc = HydratedDocument<TMilestoneClaimed>;

export type MilestoneRewardWithPopulatedData = Omit<
  TMilestoneClaimedDoc,
  "customer_id" | "service_id" | "reward_id" | "transaction_id" | "size_id"
> & {
  customer_id: TCustomerDoc;
  service_id: TServiceDoc;
  size_id: TVehicleSizeDoc;
  reward_id: TMilestoneRewardDoc;
  transaction_id: TTransactionDoc;
};

const milestoneClaimedSchema = new Schema(
  {
    customer_id: {
      type: Schema.Types.ObjectId,
      ref: Customer.modelName,
      required: true,
    },
    service_id: {
      type: Schema.Types.ObjectId,
      ref: Service.modelName,
      required: true,
    },
    reward_id: {
      type: Schema.Types.ObjectId,
      ref: MilestoneReward.modelName,
      required: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: Transaction.modelName,
      required: true,
    },
    size_id: {
      type: Schema.Types.ObjectId,
      ref: VehicleSize.modelName,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    vehicle_model: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: new Date() },
  },
  {
    collection: "milestone_claimed",
  },
);

const MilestoneClaimed =
  models.MilestoneClaimed || model("MilestoneClaimed", milestoneClaimedSchema);

export default MilestoneClaimed;
