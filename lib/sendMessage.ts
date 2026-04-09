export const sendMessage = ({
  message,
  phoneNumbers,
}: {
  message: string;
  phoneNumbers: string[];
}) => {
  const formattedNumbers = phoneNumbers.map((num) => "+63" + num.slice(1));


  fetch("https://api.sms-gate.app/3rdparty/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        btoa(
          `${process.env.SMS_GATE_USERNAME}:${process.env.SMS_GATE_PASSWORD}`,
        ),
    },
    body: JSON.stringify({
      textMessage: { text: message },
      phoneNumbers: formattedNumbers,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("SMS sent successfully:", data);
    })
    .catch((error) => {
      console.error("Error sending SMS:", error);
    });
};
