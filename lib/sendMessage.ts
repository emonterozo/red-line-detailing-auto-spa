export const sendMessage = async ({
  message,
  phoneNumbers,
}: {
  message: string;
  phoneNumbers: string[];
}) => {
  const formattedNumbers = phoneNumbers.map((num) => "+63" + num.slice(1));

  try {
    const response = await fetch(
      "https://api.sms-gate.app/3rdparty/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "close",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.SMS_GATE_USERNAME}:${process.env.SMS_GATE_PASSWORD}`,
            ).toString("base64"),
        },
        body: JSON.stringify({
          textMessage: { text: message },
          phoneNumbers: formattedNumbers,
          withDeliveryReport: false
        }),
      },
    );

    const data = await response.json();
    console.log("SMS sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
