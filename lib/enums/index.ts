export enum ServiceType {
  SERVICE = 'service', ADD_ONS = 'add-ons', 
}

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

