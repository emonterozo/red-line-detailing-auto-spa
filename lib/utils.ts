import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RewardType } from "./enums";
import { CONFIG } from "@/app/config/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateReference = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const date = new Date();
  const y = date.getFullYear().toString().slice(2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  let random = "";
  for (let i = 0; i < 5; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }

  return `RL-${y}${m}${d}-${random}`;
};

export const formatCountdown = (countdown: number): string => {
  if (countdown <= 59) {
    return `${countdown} ${countdown === 1 ? "second" : "seconds"}`;
  }

  if (countdown < 3600) {
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;

    return `${mins}:${secs.toString().padStart(2, "0")} ${
      mins === 1 ? "minute" : "minutes"
    }`;
  }

  const hours = Math.ceil(countdown / 3600);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
};

export const isOverDays = (createdAt: Date, days: number) => {
  const now = new Date();

  const diffTime = now.getTime() - createdAt.getTime();
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return daysPassed >= days;
};

export const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const calculateMilestoneRewardDiscount = (
  price: number,
  milestoneReward: {
    reward_type: RewardType;
    discount_amount: number;
    discount_percentage: number;
  },
) => {
  if (milestoneReward.reward_type === RewardType.DISCOUNT) {
    if (milestoneReward.discount_amount === 0) {
      return price * (milestoneReward.discount_percentage / 100);
    }
    return milestoneReward.discount_amount;
  }

  return price;
};

export const generateDiscountTiers = (
  discounts = [50, 100, 150],
  percentage = CONFIG.PERCENTAGE_LIMIT_MULTIPLIER,
) => {
  return discounts.map((off) => ({
    off,
    min: Math.ceil(off / percentage),
  }));
};
