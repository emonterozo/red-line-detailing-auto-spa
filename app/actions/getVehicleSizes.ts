"use server";

import connect from "@/lib/db/mongodb";
import { IVehicleSize } from "@/lib/db/types";
import VehicleSize from "@/models/VehicleSize";

export interface IVehicleSizesResponse extends IVehicleSize {
  _id: string;
}



export const getVehicleSizes = async () => {
  await connect();

  const vehicleSizesDoc = await VehicleSize.find().lean()
  const vehicleSizesJson = vehicleSizesDoc.map(item => ({
    ...item,
    _id: item._id.toString()
  })) as IVehicleSizesResponse[]
  
  return vehicleSizesJson
};
