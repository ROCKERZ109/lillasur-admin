import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Order, OrderStatus } from "@/types";

const ORDERS_COLLECTION = process.env.NEXT_PUBLIC_ORDER_DATABASE as string;

// Create a new order
export async function createOrder(
  order: Omit<Order, "id" | "createdAt">,
): Promise<string> {
  try {
    const orderData = {
      ...order,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}

// Get all orders (for admin)
export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

// Get orders by email (for customers)
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("customer.email", "==", email),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}

// Update order status
// lib/orders.ts

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  ownerComment?: string, // ✅ Add optional comment
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };

  // ✅ Add comment if provided
  if (ownerComment) {
    updateData.ownerComment = ownerComment;
  }

  await updateDoc(orderRef, updateData);
}
// Get orders by date range
export async function getOrdersByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("pickupDate", ">=", startDate.toISOString().split("T")[0]),
      where("pickupDate", "<=", endDate.toISOString().split("T")[0]),
      orderBy("pickupDate", "asc"),
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
}


export async function sendOrderComment(
  orderId: string,
  message: string
): Promise<void> {
  const orderRef = doc(db, 'test-orders', orderId);

  await updateDoc(orderRef, {
    comments: arrayUnion({
      message,
      sentAt: new Date().toISOString(),
      sentBy: "owner"
    }),
    lastCommentAt: serverTimestamp(),
    hasNewComment: true  // ✅ Flag for Cloud Function
  });
}