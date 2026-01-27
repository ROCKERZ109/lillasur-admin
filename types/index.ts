// Product types
export interface Product {
  id: string;
  name: string;
  nameSv: string;
  description: string;
  descriptionSv: string;
  price: number;
  category: ProductCategory;
  image: string;
  available: boolean;
  featured?: boolean;
  allergens?: string[];
  weight?: string;
}

export type ProductCategory = 
  | "bread" 
  | "pastry" 
  | "cookie" 
  // | "cake" 
  // | "seasonal";

// Order types
export interface Order {
  id?: string;
  items: OrderItem[];
  customer: CustomerInfo;
  pickupDate: string;
  pickupTime: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
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
