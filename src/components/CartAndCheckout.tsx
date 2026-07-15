import React, { useState, useEffect } from "react";
import { CartItem, DeliveryMethod, Order } from "../types";
import { DELIVERY_OPTIONS } from "../data";
import { ShoppingCart, Trash2, Smartphone, Truck, ShieldCheck, MapPin, Loader2, ArrowRight } from "lucide-react";

interface CartAndCheckoutProps {
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
  user?: { name: string; email: string; phone: string } | null;
}

export default function CartAndCheckout({ cart, onRemoveItem, onClearCart, onOrderSuccess, user }: CartAndCheckoutProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("nairobi_rider");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");

  // Auto pre-populate form fields when user logs in
  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerPhone(user.phone);
      setMpesaPhone(user.phone);
    } else {
      setCustomerName("");
      setCustomerPhone("");
      setMpesaPhone("");
    }
  }, [user]);
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
      <div className="bg-white border border-[#ecd1cc] rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-[#ecd1cc] flex items-center justify-center text-[#6e1329] mb-4">
          <ShoppingCart size={28} />
        </div>
        <h3 className="text-lg font-bold text-[#6e1329] font-display">Your Basket is Empty</h3>
        <p className="text-zinc-600 text-xs max-w-xs mt-1 leading-relaxed">
          Select a dynamic fragrance oil or a retail designer spray to start your order.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cart-checkout-layout">
      
      {/* Dynamic STK Push Overlay */}
      {stkActive && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#ecd1cc] rounded-2xl p-6 lg:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>
            
            <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
              <Smartphone size={36} className="text-green-600 animate-bounce" />
            </div>

            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono border border-green-200">
              STK Push Triggered
            </span>

            <h4 className="text-xl font-bold text-[#6e1329] mt-4 font-display">
              Check Your Phone!
            </h4>
            
            <p className="text-zinc-600 text-xs mt-2 leading-relaxed">
              We have dispatched an M-PESA STK prompt to <strong className="text-zinc-900 font-mono">+{mpesaPhone}</strong>.
            </p>

            <div className="bg-green-50/50 border border-green-200 rounded-xl p-4 my-5">
              <p className="text-[10px] text-green-700 uppercase tracking-wider font-mono">Payment Request Amount</p>
              <p className="text-2xl font-black text-green-700 font-mono mt-0.5">KES {total.toLocaleString()}</p>
              <p className="text-[10px] text-zinc-500 italic mt-1.5">Enter your M-PESA PIN to complete the sale</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <Loader2 size={14} className="animate-spin text-green-600" />
              <span>Simulating network response in {stkCountdown}s...</span>
            </div>
          </div>
        </div>
      )}

      {/* Cart Summary Panel (Left) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-[#ecd1cc] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f5e3e0] pb-3 mb-4">
            <h3 className="text-base font-bold font-display text-[#6e1329] flex items-center gap-1.5">
              <ShoppingCart size={18} className="text-[#cca43b]" /> Your Shopping Basket
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              {cart.length} item{cart.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="py-3 flex gap-3 group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg border border-zinc-100 bg-zinc-50"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#6e1329] truncate">{item.name}</h4>
                  {item.selectedScent && (
                    <p className="text-[10px] text-[#cca43b] truncate font-display font-semibold mt-0.5">
                      Scent: {item.selectedScent}
                    </p>
                  )}
                  {item.selectedSize && (
                    <p className="text-[10px] text-zinc-500">
                      Size: {item.selectedSize}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-mono text-zinc-500">
                      {item.quantity} x <span className="text-zinc-400">KES {item.priceEach.toLocaleString()}</span>
                    </p>
                    <p className="text-xs font-bold text-[#6e1329] font-mono">
                      KES {item.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-zinc-400 hover:text-red-500 p-1 self-start transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Totals block */}
          <div className="border-t border-[#f5e3e0] pt-4 mt-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-800 font-bold">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span className="flex items-center gap-1">
                <Truck size={12} className="text-zinc-400" /> Delivery ({selectedDelivery.label}):
              </span>
              <span className="font-mono text-zinc-800 font-bold">
                {selectedDelivery.cost === 0 ? "FREE" : `KES ${selectedDelivery.cost}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#6e1329] border-t border-[#f5e3e0] pt-3 mt-1 font-display">
              <span>Total Bill:</span>
              <span className="font-mono text-[#6e1329] text-lg">KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Localized trust guidelines */}
        <div className="bg-white border border-[#ecd1cc] rounded-2xl p-4 flex gap-3 text-left shadow-sm">
          <span className="p-1.5 bg-[#fff0ef] text-[#6e1329] rounded-lg h-fit border border-[#ecd1cc]">
            <MapPin size={16} />
          </span>
          <div>
            <h4 className="text-xs font-bold text-[#6e1329] font-display">Physical Location Collection</h4>
            <p className="text-[11px] text-zinc-600 leading-relaxed mt-0.5">
              Choose <strong>"Pick up at shop"</strong> to save transport costs. We are on Dubois Road, Junction Stalls building, 1st Floor Shop 102. Walk-ins are highly welcome!
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Forms Panel (Right) */}
      <div className="lg:col-span-7">
        <form onSubmit={handleCheckout} className="bg-white border border-[#ecd1cc] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-[#f5e3e0] pb-3 mb-4">
            <h3 className="text-base font-bold font-display text-[#6e1329]">
              Slick 30-Second Local Checkout
            </h3>
            <p className="text-zinc-600 text-xs mt-0.5 leading-snug">
              Provide delivery details. Payment triggers an automated STK PIN request instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Full Name / Business Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Grace Kamau Scents"
                className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329] font-mono"
                required
              />
            </div>
          </div>

          {/* M-PESA Input Row */}
          <div className="bg-green-50/50 border border-green-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-green-700 font-bold text-xs font-display">
              <Smartphone size={14} /> M-PESA Number for STK Push
            </div>
            <p className="text-[11px] text-zinc-500">
              Ensure this phone is unlocked and active to authorize the transaction.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono font-bold">
                +254
              </span>
              <input
                type="text"
                value={mpesaPhone.startsWith("0") ? mpesaPhone.slice(1) : mpesaPhone.startsWith("254") ? mpesaPhone.slice(3) : mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="712345678"
                className="w-full bg-white border border-green-200 rounded-lg py-2.5 pl-14 pr-3 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Delivery Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
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
                      ? "border-[#6e1329] bg-[#fff0ef] text-[#6e1329]"
                      : "border-zinc-200 bg-zinc-50/30 text-zinc-600 hover:border-[#ecd1cc] hover:bg-[#fffbfb]"
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block truncate font-display">{o.label}</span>
                    <span className="text-[9.5px] text-zinc-500 line-clamp-2 mt-0.5">{o.description}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#cca43b] mt-2 block">
                    {o.cost === 0 ? "FREE" : `+ KES ${o.cost}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Physical Delivery details textarea */}
          {deliveryMethod !== "shop_pickup" && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
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
                className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329] h-16"
                required
              />
            </div>
          )}

          {/* Huge order button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#cca43b] text-black font-extrabold uppercase tracking-widest rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-[#b8912e] hover:shadow-[#cca43b]/20 transition duration-150 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-black" /> Issuing Secure Payment...
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
