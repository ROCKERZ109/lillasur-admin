"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/orders";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Väntande",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Bekräftad",
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  ready: {
    label: "Redo",
    color: "bg-green-100 text-green-800",
    icon: <Package className="w-4 h-4" />,
  },
  completed: {
    label: "Klar",
    color: "bg-gray-100 text-gray-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Avbruten",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError("Kunde inte hämta beställningar");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count orders by status
  const orderCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-crust-900">
              Beställningar
            </h2>
            <button
              onClick={fetchOrders}
              className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-200 rounded-md transition-colors"
              title="Uppdatera"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crust-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sök namn, email eller order-ID..."
              className="pl-10 pr-4 py-2 w-72 border border-flour-300 rounded-md text-sm focus:outline-none focus:border-crust-400"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              statusFilter === "all"
                ? "bg-crust-900 text-white"
                : "bg-flour-200 text-crust-600 hover:bg-flour-300"
            )}
          >
            Alla ({orders.length})
          </button>
          {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                statusFilter === status
                  ? statusConfig[status].color
                  : "bg-flour-200 text-crust-600 hover:bg-flour-300"
              )}
            >
              {statusConfig[status].label} ({orderCounts[status] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-crust-500">
          Laddar beställningar...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-flour-400 mx-auto mb-3" />
          <p className="text-crust-500">Inga beställningar hittades</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="border border-flour-200 rounded-lg overflow-hidden bg-white"
            >
              {/* Order Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-flour-50 transition-colors"
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order.id ? null : order.id!
                  )
                }
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-crust-900">
                      {order.customer.name}
                    </p>
                    <p className="text-xs text-crust-500">
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-crust-500">Avhämtning</p>
                    <p className="text-sm font-medium text-crust-900">
                      {order.pickupDate} {order.pickupTime}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                      statusConfig[order.status].color
                    )}
                  >
                    {statusConfig[order.status].icon}
                    {statusConfig[order.status].label}
                  </span>

                  <p className="font-semibold text-crust-900 w-20 text-right">
                    {formatPrice(order.totalAmount)}
                  </p>

                  {expandedOrder === order.id ? (
                    <ChevronUp className="w-5 h-5 text-crust-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-crust-400" />
                  )}
                </div>
              </div>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="p-4 border-t border-flour-200 bg-flour-50">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium text-crust-900 mb-3 text-sm">
                        Kunduppgifter
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2 text-crust-600">
                          <Mail className="w-4 h-4 text-crust-400" />
                          <a href={`mailto:${order.customer.email}`} className="hover:underline">
                            {order.customer.email}
                          </a>
                        </p>
                        <p className="flex items-center gap-2 text-crust-600">
                          <Phone className="w-4 h-4 text-crust-400" />
                          <a href={`tel:${order.customer.phone}`} className="hover:underline">
                            {order.customer.phone}
                          </a>
                        </p>
                        <p className="flex items-center gap-2 text-crust-600">
                          <Calendar className="w-4 h-4 text-crust-400" />
                          {order.pickupDate} kl {order.pickupTime}
                        </p>
                      </div>
                      {order.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Meddelande:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-crust-900 mb-3 text-sm">
                        Produkter
                      </h4>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li
                            key={index}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-crust-600">
                              {item.quantity}× {item.productName}
                            </span>
                            <span className="text-crust-900 font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                        <li className="flex justify-between text-sm font-semibold pt-2 border-t border-flour-300">
                          <span>Totalt</span>
                          <span>{formatPrice(order.totalAmount)}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Status Update */}
                    <div>
                      <h4 className="font-medium text-crust-900 mb-3 text-sm">
                        Uppdatera status
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(statusConfig) as OrderStatus[]).map(
                          (status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(order.id!, status);
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                order.status === status
                                  ? statusConfig[status].color + " ring-2 ring-offset-1 ring-crust-300"
                                  : "bg-flour-200 text-crust-600 hover:bg-flour-300"
                              )}
                            >
                              {statusConfig[status].label}
                            </button>
                          )
                        )}
                      </div>
                      <p className="text-xs text-crust-400 mt-4">
                        Skapad:{" "}
                        {order.createdAt instanceof Date
                          ? order.createdAt.toLocaleString("sv-SE")
                          : new Date(order.createdAt).toLocaleString("sv-SE")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
