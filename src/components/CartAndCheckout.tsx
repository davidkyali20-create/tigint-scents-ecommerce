import React, { useState } from "react";
import { CartItem, DeliveryMethod, Order } from "../types";
import { DELIVERY_OPTIONS } from "../data";
import { ShoppingCart, Trash2, Smartphone, Truck, ShieldCheck, MapPin, Loader2, ArrowRight } from "lucide-react";

interface CartAndCheckoutProps {
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export default function CartAndCheckout({ cart, onRemoveItem, onClearCart, onOrderSuccess }: CartAndCheckoutProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("nairobi_rider");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [loading, setLoading] = useState(false);
  
  // STK Push active overlay simulation
  const [stkActive, setStkActive] = useState(false);
  const [stkCountdown, setStkCountdown] = useState(6);
  const [simulatedOrder, setSimulatedOrder] = useState<any>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const selectedDelivery = DELIVERY_OPTIONS.find((o) => o.id === deliveryMethod) || DELIVERY_OPTIONS[0];
  const total = subtotal + selectedDelivery.cost;

  // Pre-fill M-PESA phone if they fill general phone
  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    if (!mpesaPhone) {
      setMpesaPhone(val);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      // Initiate live POST call to our server.ts /api/pay endpoint
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: mpesaPhone,
          amount: total,
          deliveryMethod,
          locationDetails: locationDetails || "Pick up at Shop 102",
          items: cart.map((i) => ({
            productId: i.productId,
            name: i.name,
            selectedScent: i.selectedScent,
            selectedSize: i.selectedSize,
            quantity: i.quantity,
            priceEach: i.priceEach,
            totalPrice: i.totalPrice
          }))
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        setSimulatedOrder(data.order);
        // Start M-PESA STK Push overlay countdown for high-converting UX feel!
        setStkActive(true);
        setStkCountdown(6);
        
        const interval = setInterval(() => {
          setStkCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              // Trigger final success state
              setStkActive(false);
              onOrderSuccess(data.order);
              onClearCart();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert(data.message || "Payment request failed. Please check M-PESA number.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
          <ShoppingCart size={28} />
        </div>
        <h3 className="text-lg font-bold text-white font-display">Your Basket is Empty</h3>
        <p className="text-zinc-400 text-xs max-w-xs mt-1 leading-relaxed">
          Select a dynamic fragrance oil or a retail designer spray to start your order.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cart-checkout-layout">
      
      {/* Dynamic STK Push Overlay */}
      {stkActive && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-zinc-950 border border-green-500/30 rounded-2xl p-6 lg:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>
            
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Smartphone size={36} className="text-green-500 animate-bounce" />
            </div>

            <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono">
              STK Push Triggered
            </span>

            <h4 className="text-xl font-extrabold text-white mt-4 font-display">
              Check Your Phone!
            </h4>
            
            <p className="text-zinc-300 text-xs mt-2 leading-relaxed">
              We have dispatched an M-PESA STK prompt to <strong className="text-white font-mono">{mpesaPhone}</strong>.
            </p>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 my-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Payment Request Amount</p>
              <p className="text-2xl font-black text-green-400 font-mono mt-0.5">KES {total.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-400 italic mt-1.5">Enter your M-PESA PIN to complete the sale</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <Loader2 size={14} className="animate-spin text-green-500" />
              <span>Simulating network response in {stkCountdown}s...</span>
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary Panel (Left) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-1.5">
              <ShoppingCart size={18} className="text-yellow-500" /> Your Shopping Basket
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {cart.length} item{cart.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-zinc-900 max-h-[300px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="py-3 flex gap-3 group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg border border-zinc-900 bg-zinc-900"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                  {item.selectedScent && (
                    <p className="text-[10px] text-yellow-500/90 truncate font-display font-medium mt-0.5">
                      Scent: {item.selectedScent}
                    </p>
                  )}
                  {item.selectedSize && (
                    <p className="text-[10px] text-zinc-400">
                      Size: {item.selectedSize}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-mono text-zinc-300">
                      {item.quantity} x <span className="text-zinc-500">KES {item.priceEach.toLocaleString()}</span>
                    </p>
                    <p className="text-xs font-bold text-yellow-500 font-mono">
                      KES {item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-zinc-600 hover:text-red-400 p-1 self-start transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Totals block */}
          <div className="border-t border-zinc-900 pt-4 mt-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-200">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-zinc-500" /> Delivery ({selectedDelivery.label}):
              </span>
              <span className="font-mono text-zinc-200">
                {selectedDelivery.cost === 0 ? "FREE" : `KES ${selectedDelivery.cost}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-white border-t border-zinc-900 pt-3 mt-1 font-display">
              <span>Total Bill:</span>
              <span className="font-mono text-yellow-500 text-lg">KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Localized trust guidelines */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex gap-3 text-left">
          <span className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg h-fit">
            <MapPin size={16} />
          </span>
          <div>
            <h4 className="text-xs font-bold text-zinc-300 font-display">Physical Location Collection</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
              Choose <strong>"Pick up at shop"</strong> to save transport costs. We are on Dubois Road, Junction Stalls building, 1st Floor Shop 102. Walk-ins are highly welcome!
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Forms Panel (Right) */}
      <div className="lg:col-span-7">
        <form onSubmit={handleCheckout} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="border-b border-zinc-900 pb-3 mb-4">
            <h3 className="text-base font-bold font-display text-white">
              Slick 30-Second Local Checkout
            </h3>
            <p className="text-zinc-400 text-xs mt-0.5 leading-snug">
              Provide delivery details. Payment triggers an automated STK PIN request instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name / Business Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Grace Kamau Scents"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono"
                required
              />
            </div>
          </div>

          {/* M-PESA Input Row */}
          <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-green-400 font-bold text-xs font-display">
              <Smartphone size={14} /> M-PESA Number for STK Push
            </div>
            <p className="text-[11px] text-zinc-400">
              Ensure this phone is unlocked and active to authorize the transaction.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono font-bold">
                +254
              </span>
              <input
                type="text"
                value={mpesaPhone.startsWith("0") ? mpesaPhone.slice(1) : mpesaPhone.startsWith("254") ? mpesaPhone.slice(3) : mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="712345678"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-14 pr-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Delivery Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Select Dispatch Route
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {DELIVERY_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setDeliveryMethod(o.id as DeliveryMethod)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between h-24 transition cursor-pointer ${
                    deliveryMethod === o.id
                      ? "border-yellow-500 bg-yellow-500/5 text-white"
                      : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block truncate font-display">{o.label}</span>
                    <span className="text-[9.5px] text-zinc-400 line-clamp-2 mt-0.5">{o.description}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-yellow-500 mt-2 block">
                    {o.cost === 0 ? "FREE" : `+ KES ${o.cost}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Physical Delivery details textarea */}
          {deliveryMethod !== "shop_pickup" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Delivery Address / Destination Terminal
              </label>
              <textarea
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder={
                  deliveryMethod === "upcountry_parcel"
                    ? "e.g. Eldoret Town, easy Coach parcel collection office, ID Number: 1234567"
                    : "e.g. Westlands, Delta Corner building, Tower B, 4th Floor"
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-yellow-500 h-16"
                required
              />
            </div>
          )}

          {/* Huge order button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-500 text-black font-extrabold uppercase tracking-widest rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:bg-yellow-600 hover:shadow-yellow-500/20 transition duration-150 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Issuing Secure Payment...
              </>
            ) : (
              <>
                Confirm Order & Pay KES {total.toLocaleString()} <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
