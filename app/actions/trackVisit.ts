/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { headers } from "next/headers";
import connect from "@/lib/db/mongodb";
import { Visit } from "@/models/Visit";
import CryptoJS from "crypto-js";

export async function trackVisit() {
  await connect();

  const headersList = await headers();

  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  const hashedIp = CryptoJS.SHA256(ip).toString(CryptoJS.enc.Hex);

  
  try {
    await Visit.create({ ip: hashedIp, date: new Date() });
  } catch (error: any) {
    if (error.code !== 11000) {
      throw error;
    }
   
  }
}
