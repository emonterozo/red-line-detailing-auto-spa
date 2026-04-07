"use server";

import connect from "@/lib/db/mongodb";
import Location, { TLocationDoc } from "@/models/Location";
import { headers } from "next/headers";

export const getLocation = async (lat: number, lng: number) => {
  await connect();

  const headersList = await headers();

  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const locationDoc: TLocationDoc = await Location.findOne().lean({
    ip,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: 50,
      },
    },
  });


  console.log(locationDoc)
};
