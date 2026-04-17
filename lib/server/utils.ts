import bcrypt from "bcrypt";

export async function hashPassword(plainPassword: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(
    plainPassword,
    process.env.SALT_ROUNDS ? Number.parseInt(process.env.SALT_ROUNDS) : 10,
  );
  return hashedPassword;
}

export async function comparePassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export function generateReferralCode(name: string): string {
  const namePart = name
    .replaceAll(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4);

  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replaceAll("-", "");

  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${namePart}-${datePart}-${randomPart}`;
}

export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
