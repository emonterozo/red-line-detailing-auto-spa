
import bcrypt from "bcrypt";

export async function hashPassword(plainPassword: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(plainPassword, process.env.SALT_ROUNDS ? Number.parseInt(process.env.SALT_ROUNDS) : 10);
  return hashedPassword;
}