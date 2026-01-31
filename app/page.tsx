"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import OrdersPanel from "@/components/OrdersPanel";
import ProductsPanel from "@/components/ProductsPanel";

type Tab = "orders" | "products";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "lillasur";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthorized(true);
      setError("");
      sessionStorage.setItem("adminAuth", "true");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    sessionStorage.removeItem("adminAuth");
  };

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthorized(true);
    }
  }, []);

  // Login screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-flour-100 p-4">
        <div className="card p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-crust-900 mb-2">
              Lilla Sur Admin
            </h1>
            <p className="text-crust-500 text-sm">
              Log in to manage orders and products
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-crust-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full">
              Log in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-flour-100">
      {/* Header */}
      <header className="bg-white border-b border-flour-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-crust-900">
                Lilla Sur Admin
              </h1>
              
              {/* Tabs */}
              <nav className="flex gap-1">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === "orders"
                      ? "bg-crust-100 text-crust-900"
                      : "text-crust-600 hover:bg-flour-200"
                  )}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === "products"
                      ? "bg-crust-100 text-crust-900"
                      : "text-crust-600 hover:bg-flour-200"
                  )}
                >
                  <Package className="w-4 h-4" />
                  Products
                </button>
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-crust-600 hover:text-crust-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          {activeTab === "orders" && <OrdersPanel />}
          {activeTab === "products" && <ProductsPanel />}
        </div>
      </main>
    </div>
  );
}