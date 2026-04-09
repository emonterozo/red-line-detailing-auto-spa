"use server";

import connect from "@/lib/db/mongodb";
import VehicleSize, {
  TVehicleSize,
  TVehicleSizeDoc,
} from "@/models/VehicleSize";

const VEHICLE_SIZE_FIELDS: (keyof TVehicleSize)[] = [
  "size",
  "type",
  "description",
];

export type VehicleSizeResponse = Omit<TVehicleSize, "_id"> & {
  _id: string;
};

export const getVehicleSizes = async (): Promise<VehicleSizeResponse[]> => {
  await connect();

  const vehicleSizesDoc: TVehicleSizeDoc[] = await VehicleSize.find({
    is_active: true,
  })
    .select(VEHICLE_SIZE_FIELDS.join(" "))
    .sort({ sort_order: 1 })
    .lean();

  const vehicleSizesJson = vehicleSizesDoc.map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

  return vehicleSizesJson;
};
