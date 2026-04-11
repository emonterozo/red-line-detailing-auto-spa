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
