interface BaseSmsData {
  name: string;
  ref: string;
}

interface DateModelData extends BaseSmsData {
  date: string;
  model: string;
}

// Assuming you add these to your enums
export enum SmsType {
  FOR_CHECKING = "FOR_CHECKING",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  RESERVED = "RESERVED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
  REFUNDED = "REFUNDED",
  FIRST_FIFTEEN_REWARD = "FIRST_FIFTEEN_REWARD",
  FIRST_SERVICE_COMPLETE = "FIRST_SERVICE_COMPLETE",
  WELCOME_MEMBER = "WELCOME_MEMBER",
  REFERRAL_JOINED = "REFERRAL_JOINED",
  REFERRAL_REWARD_UNLOCKED = "REFERRAL_REWARD_UNLOCKED",
}

type SmsData =
  | ({ type: SmsType.FOR_CHECKING } & DateModelData)
  | ({ type: SmsType.PENDING_PAYMENT } & DateModelData & { amount: string })
  | ({ type: SmsType.RESERVED } & DateModelData & { time: string })
  | ({ type: SmsType.COMPLETED } & DateModelData & { points?: string })
  | ({ type: SmsType.CANCELLED; date: string } & BaseSmsData)
  | ({ type: SmsType.REJECTED; date: string } & BaseSmsData)
  | ({ type: SmsType.REFUNDED; date: string; amount: string } & BaseSmsData)
  | ({ type: SmsType.FIRST_FIFTEEN_REWARD } & BaseSmsData)
  | ({ type: SmsType.FIRST_SERVICE_COMPLETE } & BaseSmsData)
  | ({ type: SmsType.WELCOME_MEMBER } & BaseSmsData)
  | ({ type: SmsType.REFERRAL_JOINED; friendName: string } & BaseSmsData)
  | ({
      type: SmsType.REFERRAL_REWARD_UNLOCKED;
      friendName: string;
      points: string;
    } & BaseSmsData);

export const getSmsContent = (payload: SmsData, isGuest: boolean = false) => {
  const footer = `\n\nBooking Ref: #${payload.ref}`;
  const brandName = "Red Line Detailing & Auto Spa";
  const brandSignoff = `\n- ${brandName} ✨`;
  let body = "";

  switch (payload.type) {
    case SmsType.FOR_CHECKING:
      body = `Hi ${payload.name}, we've received your booking request for your ${payload.model}! Our team is reviewing the details and we'll notify you once confirmed. Thanks for choosing us! 🚗`;
      break;

    case SmsType.PENDING_PAYMENT:
      body = `Hi ${payload.name}, your booking is almost ready! To secure your slot for ${payload.date}, please settle the reservation fee of ${payload.amount}. 💳\n\nYou may visit our Payment Channel section to view all available options.\nNote: Slots are held for a limited time only. If you need any help, just message us!`;
      break;

    case SmsType.RESERVED:
      body = `Great news, ${payload.name}! Your service slot for your ${payload.model} on ${payload.date} at ${payload.time} is now OFFICIALLY RESERVED. We look forward to serving you! 🏁`;
      break;

    case SmsType.COMPLETED:
      body = isGuest
        ? `Service Completed! Hi ${payload.name}, thank you for trusting us with your ${payload.model} today. We hope you enjoyed the service! Want to earn rewards? Register a profile on our website next time to start collecting points. See you again! 🏆 `
        : `Service Completed! Hi ${payload.name}, thank you for trusting us with your ${payload.model} today. You’ve earned ${payload.points} points! You can view your updated milestones and points by visiting your profile on our website. See you next time! 🏆 `;
      break;

    case SmsType.CANCELLED:
      body = `Booking Cancelled: Hi ${payload.name}, your booking for ${payload.date} has been cancelled. We’re sorry it didn't work out this time! You can book a new session whenever you’re ready by visiting our website.`;
      break;

    case SmsType.REJECTED:
      body = `Booking Update: Hi ${payload.name}, we are unable to proceed with your booking for ${payload.date} because we could not reach you for the required confirmation. As a result, your slot has been released. We apologize for any inconvenience!`;
      break;

    case SmsType.REFUNDED:
      body = `Refund Completed: Hi ${payload.name}, we have successfully sent back the refund of ${payload.amount} for your booking on ${payload.date}. Please check your account for the adjustment. We hope to have the chance to serve you again!`;
      break;

    case SmsType.FIRST_FIFTEEN_REWARD:
      body = `Status Unlocked: THE APEX 🏆\n\nHi ${payload.name}! You’re officially one of our first 15 founding customers. To celebrate, we’ve awarded you The Apex Badge + 70 welcome pts! 🏁 You’ve also unlocked the Referral Program—start earning rewards for every friend you bring to the shop.`;
      break;

    case SmsType.FIRST_SERVICE_COMPLETE:
      body = `New Badge Earned: PIT CREW 🧼\n\nThank you for the trust, ${payload.name}! With your first service complete, you’ve officially joined the Pit Crew and earned 20 welcome pts. 🏁 Your personal Referral Link is now active—invite friends and let’s stack up those rewards together!`;
      break;

    case SmsType.WELCOME_MEMBER:
      body = `Hi ${payload.name}! Welcome to the ${brandName} family. 🏁 We’re thrilled to have you on board! Your dashboard is officially live—explore our premium services and manage your appointments with ease. Let’s get your ride looking its absolute best! ✨`;
      break;

    case SmsType.REFERRAL_JOINED:
      body = `Great news, ${payload.name}! 🎟️\n\nYour friend ${payload.friendName} just joined ${brandName}! You're now one step closer to your next reward. 🏁 Keep sharing your link and watch those points stack up!`;
      break;

    case SmsType.REFERRAL_REWARD_UNLOCKED:
      body = `Points Secured! 🔓\n\n${payload.friendName} just completed their first service! As a thank you for the referral, we’ve added ${payload.points} points to your account. 🏆 Visit your profile to see your new balance!`;
      break;
  }

  // Handle cases where there is no booking reference (e.g., General Welcome/Referral)
  return !payload.ref || payload.ref === ""
    ? body + `\n${brandSignoff}`
    : body + footer + brandSignoff;
};
