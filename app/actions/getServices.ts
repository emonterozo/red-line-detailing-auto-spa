"use server";

import connect from "@/lib/db/mongodb";

import Service from "@/models/Service";
import { IService, IServiceDocument } from "@/lib/db/types";
import { VehicleSize, VehicleType } from "@/lib/enums";

type PricingPerSize = {
  _id: string;
  size_id: string;
  type: VehicleType;
  size: VehicleSize;
  description: string;
  price: number;
  
};

export interface IServiceResponse extends Omit<IService, "pricing_per_sizes"> {
  _id: string;
  pricing_per_sizes: PricingPerSize[];
}

export const getServices = async () => {
  await connect();

  const servicesDoc = (await Service.find({
    is_available: true,
  })
    .populate("pricing_per_sizes.size_id")
    .lean()) as unknown as IServiceDocument[];

  const servicesJson: IServiceResponse[] = servicesDoc.map((service) => {
    const formattedPricing = service.pricing_per_sizes.map((size) => {
      return {
        _id: size._id.toString(),
        size_id: (size.size_id as unknown as { _id: string })._id.toString(),
        type: (size.size_id as unknown as { type: string }).type as VehicleType,
        size: (size.size_id as unknown as { size: string }).size as VehicleSize,
        description: (size.size_id as unknown as { description: string })
          .description,
        price: size.price,
      };
    });

    return {
      ...service,
      _id: service._id.toString(),
      pricing_per_sizes: formattedPricing,
    };
  });

  return servicesJson;
};
