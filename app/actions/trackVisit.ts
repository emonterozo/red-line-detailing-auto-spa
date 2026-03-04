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

  const today = new Date();
  today.setHours(23, 59, 59, 59);

  try {
    await Visit.updateOne(
      { ip: hashedIp, date: today },
      { $setOnInsert: { ip: hashedIp, date: today } },
      { upsert: true },
    );
  } catch (error: any) {
    console.error("Error tracking visit:", error);
  }
}
