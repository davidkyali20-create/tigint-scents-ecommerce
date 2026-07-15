import React, { useState, useEffect } from "react";
import { User, Package, CheckCircle, LogOut } from "lucide-react";

interface AccountViewProps {
  user: { id: string; name: string; email: string; phone: string } | null;
  onLogout: () => void;
  cartCount: number;
  onGoToShop: () => void;
}

export default function AccountView({ user, onLogout, cartCount, onGoToShop }: AccountViewProps) {
  // Simulated user orders
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Load user's simulated orders from server or generate a cute dynamic starter order
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.orders) {
            // Filter orders for this user (or show general user orders as mock)
            setOrders(data.orders);
          }
        })
        .catch(() => {
          // Fallback static mock order history if server is transient
          setOrders([
            {
              id: "TS-8491",
              createdAt: new Date().toISOString(),
              totalAmount: 11200,
              mpesaReceipt: "MP_TGNT8491",
              paymentStatus: "paid",
              items: [
                { name: "Grade 1 Oil Perfume (Black Vanilla)", quantity: 1, selectedSize: "250ml", totalPrice: 1700 }
              ]
            }
          ]);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12 bg-white border border-[#ecd1cc] rounded-2xl p-6 shadow-sm max-w-md mx-auto">
        <p className="text-sm font-bold text-[#6e1329]">You are not signed in.</p>
        <p className="text-xs text-zinc-500 mt-1">Please log in to view your account details.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // LOGGED-IN CUSTOMER DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="bg-white border border-[#ecd1cc] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#fff0ef] border border-[#ecd1cc] text-[#6e1329] rounded-full flex items-center justify-center">
            <User size={30} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#6e1329] font-display">Welcome back, {user.name}!</h3>
            <p className="text-xs text-zinc-500 mt-0.5 font-mono">{user.email} &middot; {user.phone}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onGoToShop}
            className="px-4 py-2 bg-[#cca43b] hover:bg-[#b8912e] text-zinc-950 text-xs font-bold uppercase rounded-lg transition"
          >
            Shop Now
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 border border-[#ecd1cc] hover:bg-[#fff0ef] text-zinc-600 hover:text-[#6e1329] text-xs font-bold uppercase rounded-lg transition flex items-center gap-1.5"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quick Stats side panel */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white border border-[#ecd1cc] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#6e1329] uppercase tracking-wider font-display border-b border-[#f5e3e0] pb-2">
              My Reseller Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50/50 p-3 rounded-lg border border-[#f5e3e0] text-center">
                <p className="text-[10px] text-zinc-500 uppercase">Total Orders</p>
                <p className="text-lg font-black font-mono text-[#6e1329] mt-0.5">{orders.length}</p>
              </div>
              <div className="bg-rose-50/50 p-3 rounded-lg border border-[#f5e3e0] text-center">
                <p className="text-[10px] text-zinc-500 uppercase">Cart Items</p>
                <p className="text-lg font-black font-mono text-[#6e1329] mt-0.5">{cartCount}</p>
              </div>
            </div>
            <div className="bg-[#fff0ef] text-[#6e1329] text-[11px] p-3 rounded-lg border border-[#ecd1cc] leading-relaxed font-medium">
              💡 <strong>Reseller Tip:</strong> Keep ordering the KES 10,000 Starter Pack to unlock custom batch sizes and high-demand German import oil flavors!
            </div>
          </div>
        </div>

        {/* Order History center panel */}
        <div className="md:col-span-8 bg-white border border-[#ecd1cc] rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-base font-bold font-display text-[#6e1329] flex items-center gap-1.5 border-b border-[#f5e3e0] pb-3">
            <Package size={18} className="text-[#cca43b]" /> My Order History
          </h4>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p className="text-sm font-medium">No order records found.</p>
              <p className="text-xs mt-1">Once you complete checkout with Safaricom M-PESA, your trackable orders will appear here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border border-[#ecd1cc] rounded-xl p-4 bg-rose-50/30 text-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-[#f5e3e0] pb-2">
                    <div>
                      <span className="text-zinc-500">Order ID: </span>
                      <strong className="text-zinc-900 font-mono font-bold">{o.id}</strong>
                    </div>
                    <span className="bg-green-100 text-green-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wider flex items-center gap-0.5">
                      <CheckCircle size={10} /> Paid & Dispatched
                    </span>
                  </div>

                  <div className="space-y-1">
                    {o.items && o.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-zinc-600">
                        <span>{item.name} {item.selectedSize ? `(${item.selectedSize})` : ""} x{item.quantity}</span>
                        <span className="font-mono text-zinc-900">KES {item.totalPrice?.toLocaleString() || item.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-[#f5e3e0] pt-2 font-mono text-[10px] text-zinc-500">
                    <span>Receipt: <strong className="text-zinc-700 font-bold">{o.mpesaReceipt || "MP_GATEWAY_OK"}</strong></span>
                    <span className="text-sm font-black text-[#6e1329]">Total: KES {o.totalAmount?.toLocaleString() || o.amount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
