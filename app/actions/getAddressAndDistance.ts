"use server";

import Location, { TLocationDoc } from "@/models/Location";
import { headers } from "next/headers";
import CryptoJS from "crypto-js";

interface LocationResult {
  address: string;
  distance: number;
}

export const getAddressAndDistance = async (
  lat: number,
  lng: number,
): Promise<LocationResult> => {
  const shopLat = 14.800225120981793;
  const shopLng = 121.00679822506005;
  const API_KEY = process.env.MAP_API_KEY;

  const headersList = await headers();

  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const hashedIp = CryptoJS.SHA256(ip).toString(CryptoJS.enc.Hex);

  const locationDoc: TLocationDoc = await Location.findOne().lean({
    ip: hashedIp,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: 50,
      },
    },
  });

  if (locationDoc) {
    return {
      address: locationDoc.address,
      distance: locationDoc.distance,
    };
  }

  // 2️⃣ Call Google Geocoding
  const geoRes = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`,
  );
  const geoData = await geoRes.json();
  const address = geoData.results[0]?.formatted_address ?? "Unknown location";

  // 3️⃣ Call Distance Matrix
  const distRes = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${shopLat},${shopLng}&destinations=${lat},${lng}&key=${API_KEY}`,
  );
  const distData = await distRes.json();

  const distanceMeters = distData.rows[0].elements[0].distance.value;
  const distanceKm = +(distanceMeters / 1000).toFixed(2);

  // 4️⃣ Store in MongoDB
  await Location.insertOne({
    ip: hashedIp,
    location: { type: "Point", coordinates: [lng, lat] },
    address,
    distance: distanceKm,
  });

  return { address, distance: distanceKm };
};
