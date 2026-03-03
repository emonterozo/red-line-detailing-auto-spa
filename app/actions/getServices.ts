"use server";

import connect from "@/lib/db/mongodb";

import Service from "@/models/Service";
import { IPricingPerSize, IService, IServiceDocument } from "@/lib/db/types";

export interface IServiceResponse extends Omit<IService, "pricing_per_sizes"> {
  _id: string;
  pricing_per_sizes: (IPricingPerSize & { _id: string })[];
}

export const getServices = async () => {
  await connect();

  const servicesDoc = (await Service.find(
    {},
  ).lean()) as unknown as IServiceDocument[];

  const servicesJson: IServiceResponse[] = servicesDoc.map((service) => {
    const formattedPricing = service.pricing_per_sizes.map((size) => ({
      ...size,
      _id: size._id.toString(),
    }));

    return {
      ...service,
      _id: service._id.toString(),
      pricing_per_sizes: formattedPricing,
    };
  });

  return servicesJson;
};
