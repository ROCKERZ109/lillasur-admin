

// Product types
export interface Product {
  id: string;
  name: string;
  nameSv: string; // Swedish name
  description: string;
  descriptionSv: string;
  price: number;
  category: ProductCategory;
  image: string;
  available: boolean;
  featured?: boolean;
  allergens?: string[];
  weight?: string;
  // NEW: Days when product is available
  availableDays?: DayOfWeek[];
  // NEW: Special product type (week special or day special)
  specialType?: "week" | "day" | null;
  // NEW: For Fettisdagen special products
  isFettisdagen?: boolean;
  minOrder?: number; // Minimum order quantity
  hasVariants?: boolean;
  variantLabel?: string;
  variantLabelSv?: string;
  variants?: ProductVariant[];
}

export type ProductCategory =
  | "bread"
  | "pastry"
  | "cookie"
  | "other"
  | "seasonal";

export type DayOfWeek =
  // | "monday"
  "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface comment{
message:string,
sentAt: string,
sentBy:string
}
// Order types
export interface Order {
  id?: string;
  comments?:comment[];
  items: OrderItem[];
  customer: CustomerInfo;
  pickupDate: string;
  pickupTime: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  notes?: string;
  // NEW: Flag for Fettisdagen orders
  isFettisdagenOrder?: boolean;
  hasNewComment?: boolean;  
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variantId: string;
  variantName: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "completed"
  | "cancelled";

// Store hours
export interface StoreHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

// Day labels for UI
export const dayLabels: Record<DayOfWeek, string> = {
  // monday: "Måndag",
  tuesday: "Tisdag",
  wednesday: "Onsdag",
  thursday: "Torsdag",
  friday: "Fredag",
  saturday: "Lördag",
  sunday: "Söndag",
};

export const dayLabelsEn: Record<DayOfWeek, string> = {
  // monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

// Fettisdagen date (update yearly)
export const FETTISDAGEN_DATE = "2025-03-04"; // March 4th, 2025
export const FETTISDAGEN_MIN_KREMLA = 10;

export type ProductVariant = {
  id: string;
  name: string;
  nameSv: string;
  priceDiff?: number;
  available: boolean;
};
