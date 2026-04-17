"use server";

import Promotion, { TPromotionDoc } from "@/models/Promotion";
import PromotionUsage from "@/models/PromotionUsage";
import { PromotionType } from "@/lib/enums";
import connect from "@/lib/db/mongodb";

interface CartItem {
  service_id: string;
  price: number;
}

export type PromotionResponse = {
  _id: string;
  promo_code: string;
  type: PromotionType;
  value: number;
  service_ids: string[];
  total_discount: number;
  message: string;
};

export async function validatePromo(
  promo_code: string,
  user_id: string,
  cart: CartItem[],
  has_used_points: boolean
) {
  try {
    await connect();

    // 1. Fetch Promotion (Case-insensitive lookup)
    const promo: TPromotionDoc = await Promotion.findOne({
      promo_code: promo_code.toUpperCase(),
      is_active: true,
    }).lean();
    

    if (!promo) {
      return { success: false, message: "Promo code not found or inactive." };
    }

    if (has_used_points && !promo.stackable) {
      return {
        success: false,
        message: "This promotion cannot be combined with point redemption.",
      };

    }

    // 2. Temporal Check
    const now = new Date();
    if (now < promo.start_date || now > promo.end_date) {
      return {
        success: false,
        message: "This promotion has expired or hasn't started yet.",
      };
    }

    const promoServiceIds = promo.service_ids.map((id) => id.toString());

    if (promoServiceIds.length > 0) {
      if (!cart || cart.length === 0) {
        return {
          success: false,
          message:
            "Your cart is empty. Please add the required services first.",
        };
      }

      // Check if EVERY required service in the promo is present in the cart
      const cartServiceIds = new Set(
        cart.map((item) => item.service_id.toString()),
      );
      const hasAllRequiredServices = promoServiceIds.every((requiredId) =>
        cartServiceIds.has(requiredId),
      );

      if (!hasAllRequiredServices) {
        return {
          success: false,
          message:
            "This promo requires a specific combination of services. Please check your cart.",
        };
      }
    }

    // 3. Global Usage Cap (e.g., Opening Promo 10 slots)
    if (
      promo.usage_limit?.total !== null &&
      promo.usage_limit?.total !== undefined &&
      promo.current_usage_count >= promo.usage_limit.total
    ) {
      return {
        success: false,
        message: "This promotion has reached its maximum usage.",
      };
    }

    // 7. Per-User Usage Limit (e.g., DECON100 limit 3 per user)
    const userUsageCount = await PromotionUsage.countDocuments({
      promotion_id: promo._id,
      user_id: user_id,
    });

    if (
      promo.usage_limit?.per_user !== null &&
      promo.usage_limit?.per_user !== undefined &&
      userUsageCount >= promo.usage_limit.per_user
    ) {
      return {
        success: false,
        message: "You have reached your personal limit for this promo.",
      };
    }

    // 4. Cart Calculations
    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

    // 5. Minimum Purchase Check (e.g., Less Promo 6000 threshold)
    if (cartTotal < promo.min_purchase_amount) {
      return {
        success: false,
        message: `Minimum purchase of ₱${promo.min_purchase_amount} required.`,
      };
    }

    let total_discount = promo.value;
    let message = "Promo applied successfully!";

    const isGlobal = promoServiceIds.length === 0;
    const eligibleTotal = isGlobal
      ? cartTotal
      : cart
          .filter((item) =>
            promoServiceIds.includes(item.service_id.toString()),
          )
          .reduce((sum, item) => sum + item.price, 0);

    switch (promo.type) {
      case PromotionType.DISCOUNT_PERCENT:
        total_discount = (eligibleTotal * promo.value) / 100;
        message = `₱${total_discount.toLocaleString()} discount applied!`;
        break;

      case PromotionType.DISCOUNT_FIXED:
        message = `₱${total_discount.toLocaleString()} discount applied!`;
        break;

      case PromotionType.POINTS_FIXED:
        total_discount = 0;
        message = `You will earn ${promo.value}pts after service is completed.`;
        break;

      case PromotionType.POINTS_MULTIPLIER:
        total_discount = 0;
        message = `You will earn ${promo.value}x points after service is completed.`;
        break;
    }

    const service_ids = promo.service_ids.map((item) => item.toString());

    return {
      success: true,
      data: {
        _id: promo._id.toString(),
        type: promo.type,
        value: promo.value,
        promo_code: promo.promo_code,
        service_ids,
        total_discount,
        message,
      } as PromotionResponse,
    };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}
