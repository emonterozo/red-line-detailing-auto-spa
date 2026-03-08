"use server";

import connect from "@/lib/db/mongodb";
import { IInquiry, IInquiryDocument } from "@/lib/db/types";
import nodemailer from "nodemailer";

import Inquiry from "@/models/Inquiry";
import { inquiryEmailTemple } from "../template/inquiry";
import { Types } from "mongoose";

export const createInquiry = async (inquiryData: IInquiry) => {
  await connect();

  try {
    const newInquiry = new Inquiry(inquiryData);

    await newInquiry.save();

    const inquiry: IInquiryDocument = {
      ...newInquiry.toObject(),
      _id: newInquiry._id.toString(),
      created_at: newInquiry.created_at.toISOString(),
      updated_at: newInquiry.updated_at.toISOString(),
    };

    const html = await inquiryEmailTemple(
      inquiryData.name,
      inquiryData.email,
      inquiryData.contact_number,
      inquiryData.message,
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const subject = `${new Types.ObjectId().toString()}, Service Inquiry from Website`;

    await transporter.sendMail({
      from: `"Inquiry From" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      cc: process.env.PERSONAL_EMAIL, 
      subject: subject,
      html: html,
    });

    return {
      success: true,
      message:
        "We received your inquiry! We’ll get back to you soon. Thank you for reaching out.",
      inquiry,
    };
  } catch {
    return {
      success: false,
      message:
        "Something went wrong while creating the inquiry. Please try again later.",
    };
  }
};
