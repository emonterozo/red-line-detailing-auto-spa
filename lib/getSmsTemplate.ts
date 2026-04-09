import { BookingStatus } from "./enums";

interface BaseSmsData {
  name: string;
  ref: string;
}

interface DateModelData extends BaseSmsData {
  date: string;
  model: string;
}

type SmsData =
  | ({ type: BookingStatus.FOR_CHECKING } & DateModelData)
  | ({ type: BookingStatus.PENDING_PAYMENT } & DateModelData & {
        amount: string;
      })
  | ({ type: BookingStatus.RESERVED } & DateModelData & { time: string })
  | ({ type: BookingStatus.COMPLETED } & DateModelData & { points?: string })
  | ({ type: BookingStatus.CANCELLED } & { date: string } & BaseSmsData)
  | ({ type: BookingStatus.REJECTED } & { date: string } & BaseSmsData)
  | ({ type: BookingStatus.REFUNDED } & {
      date: string;
      amount: string;
    } & BaseSmsData);

export const getSmsContent = (payload: SmsData, _isGuest: boolean = false) => {
  const footer = `\n\nBooking Ref: #${payload.ref}`;
  const brand = `\n- Red Line Detailing & Auto Spa ✨`;
  let body = "";

  switch (payload.type) {
    case BookingStatus.FOR_CHECKING:
      body = `Hi ${payload.name}, we've received your booking request for your ${payload.model}! Our team is reviewing the details and we'll notify you once confirmed. Thanks for choosing us! 🚗`;
      break;

    case BookingStatus.PENDING_PAYMENT:
      body = `Hi ${payload.name}, your booking is almost ready! To secure your slot for ${payload.date}, please settle the reservation fee of ${payload.amount}. 💳\nNote: Slots are held for a limited time only. If you need any help, just message us!`;
      break;

    case BookingStatus.RESERVED:
      body = `Great news, ${payload.name}! Your service slot for your ${payload.model} on ${payload.date} at ${payload.time} is now OFFICIALLY RESERVED. We look forward to serving you! 🏁`;
      break;

    // case BookingStatus.COMPLETED:
    //   body = isGuest
    //     ? `Service Completed! Hi ${payload.name}, thank you for trusting us with your ${payload.model} today. We hope you enjoyed the service! Want to earn rewards? Register a profile on our website next time to start collecting points. See you again! 🏆 `
    //     : `Service Completed! Hi ${payload.name}, thank you for trusting us with your ${payload.model} today. You’ve earned ${payload.points} points! You can view your updated milestones and points by visiting your profile on our website. See you next time! 🏆 `;
    //   break;
    case BookingStatus.COMPLETED:
      body = `Service Completed! Hi ${payload.name}, thank you for trusting us with your ${payload.model} today. We hope you love the results! It was a pleasure serving you. See you again! 🏆`;
      break;

    case BookingStatus.CANCELLED:
      body = `Booking Cancelled: Hi ${payload.name}, your booking for ${payload.date} has been cancelled. We’re sorry it didn't work out this time! You can book a new session whenever you’re ready by visiting our website.`;
      break;

    case BookingStatus.REJECTED:
      body = `Booking Update: Hi ${payload.name}, we are unable to proceed with your booking for ${payload.date} because we could not reach you for the required confirmation. As a result, your slot has been released. We apologize for any inconvenience!`;
      break;

    case BookingStatus.REFUNDED:
      body = `Refund Completed: Hi ${payload.name}, we have successfully sent back the refund of ${payload.amount} for your booking on ${payload.date}. Please check your account for the adjustment. We hope to have the chance to serve you again!`;
      break;
  }

  return payload.ref === "" ? body + `\n${brand}` : body + footer + brand;
};
