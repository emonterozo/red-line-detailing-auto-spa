export enum ServiceType {
  SERVICE = 'service', ADD_ONS = 'add-ons', 
}

export enum VehicleType {
  CAR = 'car', MOTORCYCLE = 'motorcycle',
}

export enum VehicleSize {
  SM = 'sm', MD = 'md', LG = 'lg', XL = 'xl', XXL = 'xxl',
}

export const VehicleSizeDisplay: Record<VehicleSize, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  xl: 'Large',
  xxl: 'Extra-Large',
};

export enum InquiryStatus {
  NEW = 'new', COMPLETED = 'completed', REJECTED = 'rejected',
}

export enum BookingStatus {
  FOR_CHECKING = 'for_checking', PENDING_PAYMENT = 'pending_payment', RESERVED = 'reserved', COMPLETED = 'completed', CANCELLED = 'cancelled', REJECTED = 'rejected', REFUNDED = 'refunded',
}

export const InquiryStatusDisplay: Record<InquiryStatus, string> = {
  new: 'New',
  completed: 'Completed',
  rejected: 'Rejected',
};

export const BookingStatusDisplay: Record<BookingStatus, string> = {
  for_checking: 'For Checking',
  pending_payment: 'Pending Payment',
  reserved: 'Reserved',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  refunded: 'Refunded'
};

export const TransactionFromDisplay: Record<TransactionFrom, string> = {
  booking: 'Booking',
  "walk-in": 'Walk-In',
  
};

export const DiscountTypeDisplay: Record<DiscountType, string> = {
  promotions: 'Promotions',
  manual: 'Manual',
};

export enum RewardType {
  DISCOUNT = 'discount', FREE_SERVICE = 'free_service',
}

export enum TransactionFrom {
  BOOKING = 'booking', WALK_IN = 'walk-in',
}

export enum DiscountType {
  PROMOTIONS = "promotions", MANUAL = 'manual'
}

export enum ReferralStatus {
  PENDING = "pending", COMPLETED = "completed"
}

export enum PromotionType {
  POINTS = "points", DISCOUNT = "discount"
}