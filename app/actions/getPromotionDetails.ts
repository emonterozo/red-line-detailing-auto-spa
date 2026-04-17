"use server";

import Promotion, { TPromotionDoc } from "@/models/Promotion";
import { PromotionType, ServiceType } from "@/lib/enums";
import connect from "@/lib/db/mongodb";

interface CartItem {
  _id: string;
  title: string;
  type: ServiceType;
  price: number;
}

export type PromotionResponse = {
  _id: string;
  service_ids: string[];
  total_discount: number;
};

export async function getPromotionDetails(id: string, cart: CartItem[]) {
  try {
    await connect();

    // 1. Fetch Promotion (Case-insensitive lookup)
    const promo: TPromotionDoc = await Promotion.findById(id).lean();

    if (!promo) {
      return { success: false, message: "Promo code not found or inactive." };
    }

    const eligibleItems = cart.filter(
      (item) =>
        promo.service_ids.length === 0 ||
        promo.service_ids
          .map((id) => id.toString())
          .includes(item._id.toString()),
    );

    // 2. Calculate the total discount pool based on your existing switch logic
    let total_discount = 0;
    const eligibleTotal = eligibleItems.reduce(
      (sum, item) => sum + item.price,
      0,
    );

    if (promo.type === PromotionType.DISCOUNT_FIXED) {
      total_discount = Math.min(promo.value, eligibleTotal);
    } else if (promo.type === PromotionType.DISCOUNT_PERCENT) {
      total_discount = (eligibleTotal * promo.value) / 100;
    }

    // 3. Calculate the split value
    // If 2 items are eligible and total_discount is 1000, discountPerItem is 500
    const discountPerItem =
      eligibleItems.length > 0 ? total_discount / eligibleItems.length : 0;

    // 4. Return the updated cart services
    const updatedCart = cart.map((item) => {
      const isEligible =
        promo.service_ids.length === 0 ||
        promo.service_ids
          .map((id) => id.toString())
          .includes(item._id.toString());

      const itemDiscount = isEligible ? discountPerItem : 0;

      return {
        ...item,
        discount: itemDiscount,
      };
    });

    return {
      success: true,
      data: {
        services: updatedCart,
        total_discount: total_discount,
      },
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
