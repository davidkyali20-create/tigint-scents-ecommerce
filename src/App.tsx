import React, { useState } from "react";
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Sparkles, 
  Database, 
  Code, 
  Flame, 
  Award, 
  Star, 
  Check, 
  CheckCircle2, 
  Share2, 
  X, 
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  Instagram
} from "lucide-react";
import { Product, ScentOption, CartItem, Order } from "./types";
import { PRODUCTS, SCENT_CATALOG } from "./data";
import ScentDropdown from "./components/ScentDropdown";
import StarterPackWizard from "./components/StarterPackWizard";
import DatabaseSchemaExplorer from "./components/DatabaseSchemaExplorer";
import APIDocsPanel from "./components/APIDocsPanel";
import CartAndCheckout from "./components/CartAndCheckout";

export default function App() {
  const [activeTab, setActiveTab] = useState<"shop" | "starter" | "cart" | "schema" | "api">("shop");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // State for wholesale oil selection
  const [selectedScent, setSelectedScent] = useState<ScentOption>(SCENT_CATALOG[0]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0); // default to 250ml
  const [wholesaleQty, setWholesaleQty] = useState(1);
  const [oilAddedMessage, setOilAddedMessage] = useState(false);

  // Success Order Overlay State
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const wholesaleProduct = PRODUCTS.find((p) => p.id === "oil_wholesale")!;
  const currentSizeOption = wholesaleProduct.sizes![selectedSizeIndex];

  // Helper: Add custom bulk oil item to cart
  const handleAddWholesaleOil = () => {
    const itemPrice = currentSizeOption.price;
    const cartItemId = `wholesale_${selectedScent.id}_${currentSizeOption.size}`;
    
    const newItem: CartItem = {
      id: cartItemId,
      productId: "oil_wholesale",
      name: `Grade 1 Oil Perfume (${selectedScent.name})`,
      category: "oil_wholesale",
      selectedScent: selectedScent.name,
      selectedSize: currentSizeOption.size,
      quantity: wholesaleQty,
      priceEach: itemPrice,
      totalPrice: itemPrice * wholesaleQty,
      image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"
    };

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) => 
          item.id === cartItemId 
            ? { ...item, quantity: item.quantity + wholesaleQty, totalPrice: (item.quantity + wholesaleQty) * itemPrice }
            : item
        );
      }
      return [...prev, newItem];
    });

    setOilAddedMessage(true);
    setTimeout(() => setOilAddedMessage(false), 3000);
  };

  // Helper: Add catalog items to cart
  const handleAddProductToCart = (product: Product) => {
    const cartItemId = product.id;
    const itemPrice = product.price || 0;

    const newItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.name,
      category: product.category,
      selectedSize: "Standard Option",
      quantity: 1,
      priceEach: itemPrice,
      totalPrice: itemPrice,
      image: product.image
    };

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * itemPrice }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  // Helper: Handle direct add of AI custom starter pack from Wizard
  const handleAddCustomStarterPack = (customItem: CartItem) => {
    setCart((prev) => [...prev, customItem]);
    setActiveTab("cart"); // redirect to cart instantly for fast checkout
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* SUCCESS ORDER POPUP OVERLAY */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-yellow-500/30 rounded-2xl p-6 lg:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setPlacedOrder(null)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="text-xl font-extrabold text-white text-center font-display">
              Payment Confirmed & Order Dispatched!
            </h3>
            <p className="text-zinc-400 text-xs text-center mt-1 leading-snug">
              Thank you for choosing Tigint Scents. Your grade 1 undiluted oils are being packed.
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 my-6 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">Order Reference:</span>
                <strong className="text-white font-mono">{placedOrder.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">M-PESA Receipt:</span>
                <strong className="text-green-400 font-mono">{placedOrder.mpesaReceipt || "MP_GATEWAY_SUCCESS"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">Delivery Route:</span>
                <strong className="text-yellow-500">
                  {placedOrder.delivery.method === "shop_pickup" 
                    ? "Pick up at Dubois Shop 102" 
                    : placedOrder.delivery.method === "nairobi_rider" 
                      ? "Nairobi Rider Delivery" 
                      : "Upcountry Bus Parcel"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">Dispatched Phone:</span>
                <span className="text-zinc-300 font-mono">{placedOrder.delivery.phone}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-zinc-800 pt-2 text-white text-sm">
                <span>Amount Settled:</span>
                <span className="text-yellow-500 font-mono">KES {placedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-yellow-500/10 text-yellow-500 text-xs p-3 rounded-lg flex gap-2 items-start border border-yellow-500/20">
              <span className="text-base">🚀</span>
              <p className="leading-relaxed">
                <strong>Next Steps:</strong> A packaging video has been recorded for our TikTok! Check your WhatsApp <strong>{placedOrder.delivery.phone}</strong> shortly for dispatch and tracking details.
              </p>
            </div>

            <button
              onClick={() => setPlacedOrder(null)}
              className="w-full mt-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold uppercase tracking-wider text-xs rounded-lg transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* HEADER RAIL / BANNER AD */}
      <div className="bg-gradient-to-r from-yellow-500/20 via-pink-500/10 to-transparent border-b border-zinc-900 px-4 py-2 flex flex-wrap justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase animate-pulse">
            Tigint Promo
          </span>
          <p className="text-zinc-300">
            Grade 1 Undiluted Oils imported from <strong>France & Germany</strong>. Longevity Guaranteed!
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-zinc-400">
          <a 
            href="https://wa.me/254794594222" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-yellow-500 flex items-center gap-1 transition"
          >
            <MessageCircle size={13} className="text-green-500" /> WhatsApp Orders: +254 794 594 222
          </a>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline">📍 Dubois Road Junction, Nairobi CBD</span>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <header className="bg-zinc-950/85 backdrop-blur-md sticky top-0 z-40 border-b border-zinc-900 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-yellow-500 to-rose-600 rounded-full flex items-center justify-center font-display font-black text-black text-lg tracking-tighter shadow-md shadow-yellow-500/10">
              TS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black font-display text-white tracking-tight leading-none uppercase">
                  Tigint Scents
                </h1>
                <span className="bg-yellow-500 text-black text-[9px] font-bold px-1 py-0.2 rounded uppercase tracking-widest font-mono">
                  Grade 1
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-widest">Pure Oil-Based Perfumes</p>
            </div>
          </div>

          {/* Social Stats pill */}
          <div className="hidden lg:flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-300">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <strong className="text-white font-mono">109K+</strong> Followers on TikTok
            </div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <strong className="text-white">4.9</strong>/5 Rating
            </div>
          </div>

          {/* Tab Selection Navigation */}
          <nav className="flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab("shop")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-display transition cursor-pointer ${
                activeTab === "shop" 
                  ? "bg-yellow-500 text-black font-bold" 
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              Shop Catalog
            </button>
            <button
              onClick={() => setActiveTab("starter")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-display transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "starter" 
                  ? "bg-yellow-500 text-black font-bold" 
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              <Sparkles size={13} className="fill-current" /> 10K Package
            </button>
            
            {/* Basket Button */}
            <button
              onClick={() => setActiveTab("cart")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-display transition relative flex items-center gap-1.5 cursor-pointer ${
                activeTab === "cart" 
                  ? "bg-yellow-500 text-black font-bold" 
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              <ShoppingBag size={14} />
              <span className="hidden md:inline">Basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-950">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* HERO BANNER SECTION (Strict visual replication of Tigint Scents luxury aesthetic) */}
      <section className="relative bg-zinc-950 border-b border-zinc-900 py-12 lg:py-20 overflow-hidden px-4 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.04),transparent)] pointer-events-none"></div>
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-center relative">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/25 uppercase tracking-wider font-display">
              💎 Elite French & German imports
            </span>
            
            <h2 className="text-3xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight uppercase">
              Experience Luxury <br className="hidden md:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-rose-500 to-yellow-600">
                In Every Drop
              </span>
            </h2>

            <p className="text-zinc-400 text-sm lg:text-base max-w-xl leading-relaxed">
              Tigint Scents delivers 100% undiluted, pure Grade 1 oil-based perfumes designed to command attention. Stop doing manual WhatsApp queues and automate your fragrance journey or business start-up instantly.
            </p>

            {/* Quick trust bullet points */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2.5 items-start">
                <span className="text-yellow-500 text-base mt-0.5">🏆</span>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">100% Pure Import</h4>
                  <p className="text-[11px] text-zinc-500">Straight from French & German laboratories</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-yellow-500 text-base mt-0.5">⏱️</span>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">48-Hour Longevity</h4>
                  <p className="text-[11px] text-zinc-500">Gradual drydown that lingers all day</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-yellow-500 text-base mt-0.5">🤝</span>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">Resellers Plug</h4>
                  <p className="text-[11px] text-zinc-500">Tiered pricing and KES 10,000 starter package</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-yellow-500 text-base mt-0.5">📦</span>
                <div>
                  <h4 className="text-xs font-bold text-white font-display">Nationwide Dispatch</h4>
                  <p className="text-[11px] text-zinc-500">Riders in Nairobi, upcountry buses same-day</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={() => {
                  setActiveTab("shop");
                  document.getElementById("main-shop-view")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold uppercase tracking-wider text-xs rounded-lg shadow-lg shadow-yellow-500/10 transition cursor-pointer"
              >
                Browse Catalog
              </button>
              <button
                onClick={() => {
                  setActiveTab("starter");
                  document.getElementById("main-shop-view")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-semibold uppercase tracking-wider text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-yellow-500" /> Start 10K Business
              </button>
            </div>
          </div>

          {/* Visual Showcase (Gold Aluminum bottles and cosmetic tubes matching images) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="absolute w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Elegant glass decanter vector illustration styled as cards */}
            <div className="relative bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest font-mono">Wholesale Hotlist</span>
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  🔥 KES 10k Package Sold Today
                </span>
              </div>
              
              <div className="flex gap-4 items-center">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=300"
                  alt="Elite oil aluminum bottles"
                  className="w-20 h-20 object-cover rounded-xl border border-zinc-800"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-white font-display">Tigint Aluminum Flasks</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Grade A concentrated French formula, sealed for ultimate projection.
                  </p>
                </div>
              </div>

              {/* Pricing breakdown banner */}
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-zinc-500 text-[9px] font-mono">250ml</p>
                  <p className="text-yellow-500 font-bold font-mono mt-0.5">Ksh 1,700</p>
                </div>
                <div className="border-x border-zinc-850">
                  <p className="text-zinc-500 text-[9px] font-mono">500ml</p>
                  <p className="text-yellow-500 font-bold font-mono mt-0.5">Ksh 3,200</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[9px] font-mono">1 Litre</p>
                  <p className="text-yellow-500 font-bold font-mono mt-0.5">Ksh 6,000</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RE-NAV / TAB SWITCHER BAR */}
      <section className="bg-zinc-950 border-b border-zinc-900 sticky top-20 z-30 px-4">
        <div className="max-w-7xl mx-auto flex items-center overflow-x-auto gap-2 py-3 no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab("shop")}
            className={`px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer ${
              activeTab === "shop" 
                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" 
                : "text-zinc-400 bg-zinc-900/40 border border-transparent hover:bg-zinc-900"
            }`}
          >
            🛒 Wholesale & Retail Catalog
          </button>
          
          <button
            onClick={() => setActiveTab("starter")}
            className={`px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer ${
              activeTab === "starter" 
                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" 
                : "text-zinc-400 bg-zinc-900/40 border border-transparent hover:bg-zinc-900"
            }`}
          >
            💡 KES 10,000 Startup Wizard
          </button>

          <button
            onClick={() => setActiveTab("cart")}
            className={`px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider font-display transition shrink-0 relative cursor-pointer ${
              activeTab === "cart" 
                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" 
                : "text-zinc-400 bg-zinc-900/40 border border-transparent hover:bg-zinc-900"
            }`}
          >
            🛍️ My Shopping Basket ({cartCount})
          </button>

          <button
            onClick={() => setActiveTab("schema")}
            className={`px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer ${
              activeTab === "schema" 
                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" 
                : "text-zinc-400 bg-zinc-900/40 border border-transparent hover:bg-zinc-900"
            }`}
          >
            🗄️ Database Schema
          </button>

          <button
            onClick={() => setActiveTab("api")}
            className={`px-4 py-2 text-xs font-semibold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer ${
              activeTab === "api" 
                ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" 
                : "text-zinc-400 bg-zinc-900/40 border border-transparent hover:bg-zinc-900"
            }`}
          >
            ⚡ REST API Playground
          </button>
        </div>
      </section>

      {/* MAIN VIEW AREA */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-12" id="main-shop-view">
        
        {/* TAB 1: WHOLESALE & RETAIL CATALOG */}
        {activeTab === "shop" && (
          <div className="space-y-12">
            
            {/* CATEGORY A: WHOLESALE OILS PANEL */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 lg:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5 mb-6">
                <div>
                  <span className="text-[10px] bg-yellow-500/10 text-yellow-500 font-bold px-2.5 py-1 rounded-full border border-yellow-500/25 uppercase tracking-wider font-display">
                    Category A — Wholesale Oils
                  </span>
                  <h3 className="text-xl font-bold font-display text-white mt-2">
                    Undiluted Perfume Oils (Bulk Aluminum Cans)
                  </h3>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Select a dynamic fragrance scent profile and select your preferred wholesale size.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-green-500/10 text-green-400 text-xs px-2.5 py-1 rounded-full border border-green-500/20 font-medium">
                    Imported France/Germany
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Selector Controls */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Scent selector component */}
                  <ScentDropdown
                    selectedScentId={selectedScent.id}
                    onChange={(scent) => setSelectedScent(scent)}
                  />

                  {/* Sizes chooser */}
                  <div>
                    <label className="block text-xs font-medium text-yellow-500 uppercase tracking-wider mb-2 font-display">
                      Select Wholesale Volume
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {wholesaleProduct.sizes!.map((sizeOpt, index) => (
                        <button
                          key={sizeOpt.size}
                          type="button"
                          onClick={() => setSelectedSizeIndex(index)}
                          className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition cursor-pointer ${
                            selectedSizeIndex === index
                              ? "border-yellow-500 bg-yellow-500/5 text-white"
                              : "border-zinc-850 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <span className="text-sm font-bold block font-display">{sizeOpt.size} Size</span>
                          <span className="font-mono text-sm font-bold text-yellow-500 mt-2 block">
                            KES {sizeOpt.price.toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-4 border-t border-zinc-900 pt-6">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Quantity (Cans)</label>
                      <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden">
                        <button
                          onClick={() => setWholesaleQty(Math.max(1, wholesaleQty - 1))}
                          className="px-3 py-1.5 text-zinc-400 hover:text-white transition font-bold"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 text-xs text-white font-mono font-bold">
                          {wholesaleQty}
                        </span>
                        <button
                          onClick={() => setWholesaleQty(wholesaleQty + 1)}
                          className="px-3 py-1.5 text-zinc-400 hover:text-white transition font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddWholesaleOil}
                      className="flex-1 py-3 px-6 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold uppercase tracking-widest text-xs rounded-lg shadow-md transition duration-150 cursor-pointer self-end"
                    >
                      Add Wholesale Oils to Basket
                    </button>
                  </div>

                  {oilAddedMessage && (
                    <p className="text-xs text-green-400 font-bold bg-green-500/10 p-2.5 rounded-lg border border-green-500/20 text-center animate-pulse">
                      ✓ Grade 1 {selectedScent.name} ({currentSizeOption.size}) added to your basket successfully!
                    </p>
                  )}
                </div>

                {/* Scent visual description panel */}
                <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-display">
                        Chemical Olfactory Profile
                      </h4>
                      <span className="text-[10px] bg-yellow-500/15 text-yellow-500 font-bold px-2 py-0.5 rounded">
                        Grade 1 Pure
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xl font-bold font-display text-white">{selectedScent.name}</h5>
                      <span className="text-xs text-zinc-500">Scent Classification: </span>
                      <span className="text-xs text-yellow-500 font-semibold">{selectedScent.profile}</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500">Formula Chemistry Notes:</p>
                      <p className="text-xs text-zinc-300 leading-relaxed italic">
                        "{selectedScent.notes}"
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500">Sales Velocity Metric:</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-rose-500 to-yellow-500" 
                            style={{ width: `${selectedScent.popularity}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-white font-mono font-bold">{selectedScent.popularity}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/60 text-xs text-zinc-500 flex gap-2">
                    <span className="text-sm">💡</span>
                    <p className="leading-snug">
                      <strong>Reseller Tip:</strong> Pure oil-based formula ensures zero evaporation. Decant into standard 6ml roll-on tubes to maximize retail yield.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORY B: DESIGNER SPRAYS */}
            <div className="space-y-5">
              <div>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-500 font-bold px-2.5 py-1 rounded-full border border-yellow-500/25 uppercase tracking-wider font-display">
                  Category B — Designer & Branded Perfumes
                </span>
                <h3 className="text-xl font-bold font-display text-white mt-2">
                  Designer Sprays (Flat Rate Retailing Boxed Items)
                </h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Individually boxed miniature and standard EDP retail sprays ready for immediate consumption or gift distribution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PRODUCTS.filter((p) => p.category === "retail_spray").map((p) => (
                  <div key={p.id} className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition flex flex-col justify-between">
                    <div className="relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-44 object-cover"
                      />
                      {p.badge && (
                        <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white font-display line-clamp-1">{p.name}</h4>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed h-8">
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-500">Retail Campaign</p>
                          <p className="text-sm font-bold text-yellow-500 font-mono">KES {p.price?.toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddProductToCart(p)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-800 cursor-pointer"
                        >
                          Add To Basket
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORY C: BOTTLES & ACCESSORIES */}
            <div className="space-y-5">
              <div>
                <span className="text-[10px] bg-yellow-500/10 text-yellow-500 font-bold px-2.5 py-1 rounded-full border border-yellow-500/25 uppercase tracking-wider font-display">
                  Category C — Bottles & Accessories
                </span>
                <h3 className="text-xl font-bold font-display text-white mt-2">
                  Empty Refill Containers & Display Glassware
                </h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Sourcing premium glass decant roll-ons per dozen and high-polish fancy display spray pumps for professional scent customizer stalls.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {PRODUCTS.filter((p) => p.category === "accessory").map((p) => (
                  <div key={p.id} className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-800 transition flex flex-col justify-between">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-white truncate font-display">{p.name}</h4>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                          {p.description}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-zinc-900">
                        <span className="text-xs font-bold text-yellow-500 font-mono">
                          KES {p.price?.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddProductToCart(p)}
                          className="p-1 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-850 text-yellow-500 font-bold text-[10px] px-2 uppercase tracking-wide cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: KES 10,000 STARTUP WIZARD */}
        {activeTab === "starter" && (
          <StarterPackWizard
            onAddPackageToCart={handleAddCustomStarterPack}
          />
        )}

        {/* TAB 3: MY SHOPPING BASKET / CHECKOUT */}
        {activeTab === "cart" && (
          <CartAndCheckout
            cart={cart}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onOrderSuccess={(order) => setPlacedOrder(order)}
          />
        )}

        {/* TAB 4: DATABASE SCHEMA EXPLORER */}
        {activeTab === "schema" && (
          <DatabaseSchemaExplorer />
        )}

        {/* TAB 5: REST API PLAYGROUND */}
        {activeTab === "api" && (
          <APIDocsPanel />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Tigint Scents Ltd</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Kenya's ultimate plug for grade 1 undiluted oil perfumes imported straight from premium manufacturers in France and Germany. Automating retail and reseller dispatches.
            </p>
            <div className="flex gap-2.5 pt-2">
              <a href="https://tiktok.com/@tigint.scents" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition">
                <ThumbsUp size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Nairobi Headquarters</h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="flex items-start gap-1.5 leading-relaxed">
                <MapPin size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                <span>Nairobi CBD, junction between Dubois Road & Latema Road, Junction Stalls building, First Floor Shop 102.</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={14} className="text-yellow-500 shrink-0" />
                <span>+254 794 594 222 (Calls/WhatsApp)</span>
              </p>
            </div>
          </div>

          {/* Reseller shortcuts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">Entrepreneur shortcuts</h4>
            <ul className="space-y-1.5 text-xs text-zinc-400">
              <li>
                <button onClick={() => setActiveTab("starter")} className="hover:text-yellow-500 transition text-left cursor-pointer">
                  → Customize KES 10,000 Starter Package
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("schema")} className="hover:text-yellow-500 transition text-left cursor-pointer">
                  → Relational PostgreSQL Database Schema
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab("api")} className="hover:text-yellow-500 transition text-left cursor-pointer">
                  → Daraja STK Push API Sandbox
                </button>
              </li>
            </ul>
          </div>

          {/* Quick interactive Dubois Junction Map illustration */}
          <div className="space-y-2 bg-zinc-900/40 border border-zinc-900 rounded-xl p-4">
            <h5 className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest font-display">Dubois Stall 102 Navigator</h5>
            <div className="text-[10px] font-mono text-zinc-400 space-y-1 bg-zinc-950 p-2.5 rounded border border-zinc-850">
              <div className="text-zinc-500">{"[Dubois Road] <=======> [River Road]"}</div>
              <div className="text-zinc-500 text-center">{"|"}</div>
              <div>{"[Latema Road] ===[ Junction Stalls ]==="}</div>
              <div className="text-yellow-500 font-bold text-center">{"★ Shop 102 (1st Floor)"}</div>
            </div>
            <p className="text-[9.5px] text-zinc-500 leading-snug">
              Centrally located in Nairobi's absolute cosmetic hub. Same day dispatch nationwide.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-zinc-900 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <div>
            <p>© 2026 Tigint Scents. Built by Expert Full-Stack Developer & Designer.</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Designed by Praxis Labs &middot; Lead Engineering by Charlie CEO</p>
          </div>
          <div className="flex gap-4">
            <span>Secured via Safaricom Daraja STK</span>
            <span>·</span>
            <span>Grade 1 Laboratory Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
