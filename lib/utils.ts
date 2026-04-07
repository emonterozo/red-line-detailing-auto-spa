import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
