import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const from = "Red Line Detailing <ask.redlinedetailing@gmail.com>"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getTemplate = (filename: string) => {
  const templatePath = path.join(process.cwd(), "template", filename);
  return fs.readFileSync(templatePath, "utf8");
};

export async function sendOTPEmail(email: string, otp: string, name: string, expiryMinutes: number) {
  let html = getTemplate("registration-otp.html");
  html = html.replace("{{name}}", name);
  html = html.replace("{{otpCode}}", otp);
  html = html.replace("{{expiryMinutes}}", expiryMinutes.toString());
  html = html.replace("{{year}}", new Date().getFullYear().toString());

  return await transporter.sendMail({
    from: from,
    to: email,
    subject: `Red Line Rewards Registration Code: ${otp}`,
    html: html,
  });
}
