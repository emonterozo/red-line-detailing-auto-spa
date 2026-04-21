"use server";

import axios from "axios";

export const sendMessage = async ({
  message,
  phoneNumbers,
}: {
  message: string;
  phoneNumbers: string[];
}) => {
  const formattedNumbers = phoneNumbers.map((num) => "+63" + num.slice(1));

  const auth = Buffer.from(
    `${process.env.SMS_GATE_USERNAME}:${process.env.SMS_GATE_PASSWORD}`,
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://api.sms-gate.app/3rdparty/v1/messages",
      {
        textMessage: { text: message },
        phoneNumbers: formattedNumbers,
        withDeliveryReport: false,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 4000,
      },
    );

    const { data } = response;
    console.log("SMS sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
