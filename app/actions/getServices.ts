"use server";

import connect from "@/lib/db/mongodb";

import Service, { ServiceWithPopulatedData, TService } from "@/models/Service";
import { TVehicleSize } from "@/models/VehicleSize";

const SERVICE_FIELDS: (keyof TService)[] = [
  "title",
  "description",
  "pricing_options",
  "pricing_per_sizes",
  "price",
  "notes",
  "type"
];

const VEHICLE_SIZE_FIELDS: (keyof TVehicleSize)[] = [
  "type",
  "size",
  "description",
];

export type ServiceResponse = Omit<TService, "_id" | "pricing_per_sizes"> & {
  _id: string;
  pricing_per_sizes: (Pick<TVehicleSize, "type" | "size" | "description"> & {
    _id: string;
    size_id: string;
    price: number;
  })[];
};

export const getServices = async (): Promise<ServiceResponse[]> => {
  await connect();

  const servicesDoc: ServiceWithPopulatedData[] = await Service.find({
    is_available: true,
  })
    .select(SERVICE_FIELDS.join(" "))
    .populate("pricing_per_sizes.size_id", VEHICLE_SIZE_FIELDS.join(" "))
    .sort({ sort_order: 1 })
    .lean();

  const servicesJson = servicesDoc.map((service) => {
    const formattedPricing = service.pricing_per_sizes.map((size) => {
      return {
        _id: size._id.toString(),
        size_id: size.size_id._id.toString(),
        type: size.size_id.type,
        size: size.size_id.size,
        description: size.size_id.description,
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
