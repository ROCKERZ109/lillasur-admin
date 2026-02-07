"use client";

import { useState, useEffect, useRef } from "react";
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
  CalendarDays,
  Printer,
  Square,
  CheckSquare,
} from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/orders";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  ready: {
    label: "Ready",
    color: "bg-green-100 text-green-800",
    icon: <Package className="w-4 h-4" />,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-100 text-gray-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-4 h-4" />,
  },
};

function getDateString(daysFromNow: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "tomorrow" | "custom">("all");
  const [customDate, setCustomDate] = useState("");

  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      setError("Could not fetch orders");
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

  const getFilterDate = (): string | null => {
    switch (dateFilter) {
      case "today": return getDateString(0);
      case "tomorrow": return getDateString(1);
      case "custom": return customDate || null;
      default: return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const filterDate = getFilterDate();
    const matchesDate = !filterDate || order.pickupDate === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime();
  });

  const orderCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const todayCount = orders.filter(o => o.pickupDate === getDateString(0)).length;
  const tomorrowCount = orders.filter(o => o.pickupDate === getDateString(1)).length;

  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllVisible = () => {
    const allIds = sortedOrders.map(o => o.id!);
    setSelectedOrders(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedOrders(new Set());
  };

  const getSelectedOrders = () => {
    return sortedOrders.filter(o => selectedOrders.has(o.id!));
  };

  const handlePrint = () => {
    const ordersToPrint = selectedOrders.size > 0 ? getSelectedOrders() : sortedOrders;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders - Lilla Sur</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; font-size: 12px; }
          h1 { font-size: 18px; margin-bottom: 5px; }
          .date { color: #666; margin-bottom: 20px; }
          .order { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
          .order-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
          .customer-name { font-weight: bold; font-size: 14px; }
          .order-id { color: #666; font-size: 10px; }
          .pickup { background: #f5f5f5; padding: 8px; border-radius: 4px; margin-bottom: 10px; }
          .items { margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; padding: 3px 0; }
          .total { font-weight: bold; border-top: 1px solid #ddd; padding-top: 5px; display: flex; justify-content: space-between; }
          .contact { font-size: 11px; color: #666; }
          .notes { background: #fff3cd; padding: 8px; border-radius: 4px; margin-top: 10px; font-size: 11px; }
          .status { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 500; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-confirmed { background: #dbeafe; color: #1e40af; }
          .status-ready { background: #d1fae5; color: #065f46; }
          @media print { body { padding: 10px; } .order { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>Orders - Lilla Sur</h1>
        <p class="date">Printed: ${new Date().toLocaleString('en-US')} | ${ordersToPrint.length} order(s)</p>
        ${ordersToPrint.map(order => `
          <div class="order">
            <div class="order-header">
              <div>
                <div class="customer-name">${order.customer.name}</div>
                <div class="order-id">#${order.id?.slice(0, 8).toUpperCase()}</div>
              </div>
              <span class="status status-${order.status}">${statusConfig[order.status].label}</span>
            </div>
            <div class="pickup">
              <strong>Pickup:</strong> ${order.pickupDate} at ${order.pickupTime}
            </div>
            <div class="items">
              ${order.items.map(item => `
                <div class="item">
                  <span>${item.quantity}× ${item.productName} ${item.variantId != null ? `- ${item.variantName}` : ""}</span>
                  <span>${item.price * item.quantity} kr</span>
                </div>
              `).join('')}
            </div>
            <div class="total">
              <span>Total</span>
              <span>${order.totalAmount} kr</span>
            </div>
            <div class="contact">
              📧 ${order.customer.email} | 📞 ${order.customer.phone}
            </div>
            ${order.notes ? `<div class="notes"><strong>Message:</strong> ${order.notes}</div>` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-crust-900">Orders</h2>
            <button
              onClick={fetchOrders}
              className="p-2 text-crust-500 hover:text-crust-900 hover:bg-flour-200 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-crust-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, email or order ID..."
              className="pl-10 pr-4 py-2 w-full border border-flour-300 rounded-md text-sm focus:outline-none focus:border-crust-400"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <CalendarDays className="w-4 h-4 text-crust-500 flex-shrink-0" />
          <span className="text-sm text-crust-600 flex-shrink-0">Date:</span>

          {[
            { key: "all", label: "All", color: "bg-crust-900" },
            { key: "today", label: `Today (${todayCount})`, color: "bg-green-600" },
            { key: "tomorrow", label: `Tomorrow (${tomorrowCount})`, color: "bg-blue-600" },
            { key: "custom", label: "Select", color: "bg-purple-600" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setDateFilter(btn.key as typeof dateFilter)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap",
                dateFilter === btn.key
                  ? `${btn.color} text-white`
                  : "bg-flour-200 text-crust-600 hover:bg-flour-300"
              )}
            >
              {btn.label}
            </button>
          ))}

          {dateFilter === "custom" && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-3 py-1.5 border border-flour-300 rounded-md text-sm focus:outline-none focus:border-crust-400 flex-shrink-0"
            />
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap",
              statusFilter === "all"
                ? "bg-crust-900 text-white"
                : "bg-flour-200 text-crust-600 hover:bg-flour-300"
            )}
          >
            All ({orders.length})
          </button>
          {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-shrink-0 whitespace-nowrap",
                statusFilter === status
                  ? statusConfig[status].color
                  : "bg-flour-200 text-crust-600 hover:bg-flour-300"
              )}
            >
              {statusConfig[status].label} ({orderCounts[status] || 0})
            </button>
          ))}
        </div>

        {/* Print Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-flour-100 rounded-lg">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectMode(!selectMode);
                if (selectMode) deselectAll();
              }}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                selectMode
                  ? "bg-crust-900 text-white"
                  : "bg-white text-crust-700 border border-crust-300"
              )}
            >
              {selectMode ? "Cancel selection" : "Select for print"}
            </button>

            {selectMode && (
              <>
                <button
                  onClick={selectAllVisible}
                  className="text-sm text-crust-600 hover:text-crust-900 underline"
                >
                  Select all
                </button>
                <span className="text-sm text-crust-500">
                  {selectedOrders.size} selected
                </span>
              </>
            )}
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-crust-900 text-white rounded-md hover:bg-crust-800 transition-colors text-sm font-medium w-full sm:w-auto justify-center"
          >
            <Printer className="w-4 h-4" />
            {selectedOrders.size > 0 ? `Print (${selectedOrders.size})` : "Print all"}
          </button>
        </div>
      </div>

      {dateFilter !== "all" && (
        <div className="mb-4 text-sm text-crust-600">
          Showing {sortedOrders.length} order(s) for{" "}
          {dateFilter === "today" && "today"}
          {dateFilter === "tomorrow" && "tomorrow"}
          {dateFilter === "custom" && customDate}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-crust-500">
          Loading orders...
        </div>
      )}

      {!loading && sortedOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-flour-400 mx-auto mb-3" />
          <p className="text-crust-500">No orders found</p>
        </div>
      )}

      {!loading && sortedOrders.length > 0 && (
        <div className="space-y-3">
          {sortedOrders.map((order) => (
            <div
              key={order.id}
              className={cn(
                "border border-flour-200 rounded-lg overflow-hidden bg-white",
                selectedOrders.has(order.id!) && "ring-2 ring-crust-400"
              )}
            >
              <div
                className="flex items-start sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-flour-50 transition-colors gap-2 sm:gap-3"
                onClick={() => {
                  if (selectMode) {
                    toggleSelectOrder(order.id!);
                  } else {
                    setExpandedOrder(expandedOrder === order.id ? null : order.id!);
                  }
                }}
              >
                {selectMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectOrder(order.id!);
                    }}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {selectedOrders.has(order.id!) ? (
                      <CheckSquare className="w-5 h-5 text-crust-900" />
                    ) : (
                      <Square className="w-5 h-5 text-crust-400" />
                    )}
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <p className="font-medium text-crust-900 truncate">
                      {order.customer.name}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit",
                        statusConfig[order.status].color
                      )}
                    >
                      {statusConfig[order.status].icon}
                      <span className="hidden xs:inline">{statusConfig[order.status].label}</span>
                    </span>
                  </div>
                  <p className="text-xs text-crust-500">
                    #{order.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-crust-600 mt-1 sm:hidden">
                    📅 {order.pickupDate} at {order.pickupTime}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-crust-500">Pickup</p>
                    <p className="text-sm font-medium text-crust-900">
                      {order.pickupDate} {order.pickupTime}
                    </p>
                  </div>

                  <p className="font-semibold text-crust-900 text-sm sm:text-base">
                    {formatPrice(order.totalAmount)}
                  </p>

                  {!selectMode && (
                    expandedOrder === order.id ? (
                      <ChevronUp className="w-5 h-5 text-crust-400 flex-shrink-0 hidden sm:block" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-crust-400 flex-shrink-0 hidden sm:block" />
                    )
                  )}
                </div>
              </div>

              {expandedOrder === order.id && !selectMode && (
                <div className="p-3 sm:p-4 border-t border-flour-200 bg-flour-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-medium text-crust-900 mb-3 text-sm">Customer Details</h4>
                      <div className="space-y-2 text-sm">
                        <a href={`mailto:${order.customer.email}`} className="flex items-center gap-2 text-crust-600 hover:text-crust-900 break-all">
                          <Mail className="w-4 h-4 text-crust-400 flex-shrink-0" />
                          {order.customer.email}
                        </a>
                        <a href={`tel:${order.customer.phone}`} className="flex items-center gap-2 text-crust-600 hover:text-crust-900">
                          <Phone className="w-4 h-4 text-crust-400 flex-shrink-0" />
                          {order.customer.phone}
                        </a>
                        <p className="flex items-center gap-2 text-crust-600">
                          <Calendar className="w-4 h-4 text-crust-400 flex-shrink-0" />
                          {order.pickupDate} at {order.pickupTime}
                        </p>
                      </div>
                      {order.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800 break-words">
                            <strong>Message:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium text-crust-900 mb-3 text-sm">Products</h4>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between text-sm">
                            <span className="text-crust-600">{item.quantity}× {item.productName} {item.variantId != null ? `- ${item.variantName}` : ""} </span>
                            <span className="text-crust-900 font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </li>
                        ))}
                        <li className="flex justify-between text-sm font-semibold pt-2 border-t border-flour-300">
                          <span>Total</span>
                          <span>{formatPrice(order.totalAmount)}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-crust-900 mb-3 text-sm">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(statusConfig) as OrderStatus[]).map((status) => (
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
                        ))}
                      </div>
                      <p className="text-xs text-crust-400 mt-4">
                        Created: {order.createdAt instanceof Date
                          ? order.createdAt.toLocaleString("en-US")
                          : new Date(order.createdAt).toLocaleString("en-US")}
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