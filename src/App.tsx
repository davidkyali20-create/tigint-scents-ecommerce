import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Sparkles, 
  Flame, 
  Award, 
  Star, 
  Check, 
  CheckCircle2, 
  X, 
  MessageCircle, 
  ThumbsUp, 
  Instagram,
  ArrowRight,
  Info,
  User,
  ShieldCheck,
  Menu
} from "lucide-react";
import { Product, ScentOption, CartItem, Order } from "./types";
import { PRODUCTS, SCENT_CATALOG } from "./data";
import ScentDropdown from "./components/ScentDropdown";
import StarterPackWizard from "./components/StarterPackWizard";
import CartAndCheckout from "./components/CartAndCheckout";
import AccountView from "./components/AccountView";
import AdminDashboard from "./components/AdminDashboard";
import LoginView from "./components/LoginView";

export default function App() {
  const [activeTab, setActiveTab] = useState<"shop" | "starter" | "cart" | "account" | "admin">("shop");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real-time catalog and auth sessions state
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [user, setUser] = useState<{ id: string; name: string; email: string; phone: string } | null>(null);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);

  // Sync products list from backend on mount
  const refreshProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Error fetching products:", err));
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    const checkPathnameAndHash = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/admin" || path === "/admin-login" || hash === "#admin" || hash === "#/admin" || hash === "#admin-login" || hash === "#/admin-login") {
        setActiveTab("admin");
      } else if (path === "/login" || path === "/account-login" || hash === "#login" || hash === "#/login" || hash === "#account" || hash === "#/account") {
        setActiveTab("account");
      } else if (hash === "#starter" || hash === "#/starter") {
        setActiveTab("starter");
      } else if (hash === "#cart" || hash === "#/cart") {
        setActiveTab("cart");
      } else if (hash === "#shop" || hash === "#/shop") {
        setActiveTab("shop");
      }
    };

    checkPathnameAndHash();

    const handleHashChange = () => {
      checkPathnameAndHash();
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  
  // State for wholesale oil selection
  const [selectedScent, setSelectedScent] = useState<ScentOption>(SCENT_CATALOG[0]);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0); // default to 250ml
  const [wholesaleQty, setWholesaleQty] = useState(1);
  const [oilAddedMessage, setOilAddedMessage] = useState(false);

  // Success Order Overlay State
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const wholesaleProduct = products.find((p) => p.id === "oil_wholesale") || PRODUCTS.find((p) => p.id === "oil_wholesale")!;
  const currentSizeOption = (wholesaleProduct.sizes && wholesaleProduct.sizes[selectedSizeIndex]) || { size: "250ml", price: 1700 };

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
    <div className="min-h-screen bg-[#faf2f0] text-zinc-800 flex flex-col font-sans selection:bg-[#6e1329] selection:text-white">
      
      {/* SUCCESS ORDER POPUP OVERLAY */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#ecd1cc] rounded-2xl p-6 lg:p-8 max-w-lg w-full shadow-2xl relative text-left">
            <button
              onClick={() => setPlacedOrder(null)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-[#fff0ef] border border-[#ecd1cc] text-[#6e1329] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="text-xl font-bold text-[#6e1329] text-center font-display">
              Payment Confirmed & Order Dispatched!
            </h3>
            <p className="text-zinc-600 text-xs text-center mt-1 leading-snug">
              Thank you for choosing Tigint Scents. Your grade 1 undiluted oils are being packed.
            </p>

            <div className="bg-rose-50/40 border border-[#ecd1cc] rounded-xl p-4 my-6 space-y-2.5 text-xs text-zinc-700">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">Order Reference:</span>
                <strong className="text-zinc-950 font-mono">{placedOrder.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">M-PESA Receipt:</span>
                <strong className="text-green-700 font-mono">{placedOrder.mpesaReceipt || "MP_GATEWAY_SUCCESS"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">Delivery Route:</span>
                <strong className="text-[#6e1329] font-bold">
                  {placedOrder.delivery.method === "shop_pickup" 
                    ? "Pick up at Dubois Shop 102" 
                    : placedOrder.delivery.method === "nairobi_rider" 
                      ? "Nairobi Rider Delivery" 
                      : "Upcountry Bus Parcel"}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-mono">Dispatched Phone:</span>
                <span className="text-zinc-800 font-mono font-bold">+{placedOrder.delivery.phone}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#f5e3e0] pt-2 text-[#6e1329] text-sm">
                <span>Amount Settled:</span>
                <span className="font-mono text-lg font-black">KES {placedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#fff0ef] text-[#6e1329] text-xs p-3 rounded-lg flex gap-2 items-start border border-[#ecd1cc]">
              <span className="text-base">🚀</span>
              <p className="leading-relaxed font-medium">
                <strong>Next Steps:</strong> A packaging video has been recorded for our TikTok! Check your WhatsApp <strong>+{placedOrder.delivery.phone}</strong> shortly for dispatch and tracking details.
              </p>
            </div>

            <button
              onClick={() => setPlacedOrder(null)}
              className="w-full mt-6 py-3 bg-[#cca43b] hover:bg-[#b8912e] text-black font-extrabold uppercase tracking-wider text-xs rounded-lg transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* HEADER RAIL / BANNER AD */}
      <div className="bg-gradient-to-r from-[#fff0ef] via-[#faf2f0] to-transparent border-b border-[#f5e3e0] px-4 py-2 flex flex-wrap justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded uppercase animate-pulse">
            Tigint Promo
          </span>
          <p className="text-zinc-600">
            Grade 1 Undiluted Oils imported from <strong>France & Germany</strong>. Longevity Guaranteed!
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <a 
            href="https://wa.me/254794594222" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-[#6e1329] flex items-center gap-1 transition font-medium"
          >
            <MessageCircle size={13} className="text-[#6e1329]" /> WhatsApp Orders: +254 794 594 222
          </a>
          <span className="hidden md:inline text-zinc-300">|</span>
          <span className="hidden md:inline">📍 Dubois Road Junction, Nairobi CBD</span>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <header className="bg-white sticky top-0 z-40 border-b border-[#f5e3e0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5">
          
          {/* Main Flex Row (Responsive desktop vs mobile) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* ROW 1 (On Mobile: logo/hamburger on left, Cart/Account on right. On Desktop: logo brand) */}
            <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 text-[#6e1329] hover:bg-[#fff0ef] rounded-lg transition cursor-pointer"
                  title="Toggle Mobile Navigation Menu"
                  type="button"
                >
                  <Menu size={20} />
                </button>
                <div 
                  className="flex items-center gap-2 cursor-pointer" 
                  onClick={() => { setActiveTab("shop"); setSearchQuery(""); }}
                >
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#cca43b] to-[#6e1329] rounded-full flex items-center justify-center font-display font-black text-white text-base tracking-tighter shadow-sm shrink-0">
                    TS
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-base md:text-lg font-black font-display text-[#6e1329] tracking-tight leading-none uppercase">
                        Tigint Scents
                      </h1>
                      {/* Hide non-essential badges from mobile header */}
                      <span className="hidden md:inline-block bg-[#cca43b] text-zinc-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
                        Grade 1
                      </span>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-zinc-500 mt-0.5 uppercase tracking-widest leading-none">Pure Oil-Based Perfumes</p>
                  </div>
                </div>
              </div>

              {/* Mobile Header Icons on far right of ROW 1 */}
              <div className="flex items-center gap-1 md:hidden">
                <button
                  onClick={() => setActiveTab("account")}
                  className={`p-2 rounded-xl relative transition cursor-pointer ${
                    activeTab === "account" ? "bg-[#fff0ef] text-[#6e1329]" : "text-zinc-600 hover:text-[#6e1329]"
                  }`}
                  title="My Account"
                  type="button"
                >
                  <User size={18} />
                </button>

                <button
                  onClick={() => setActiveTab("cart")}
                  className={`p-2 rounded-xl relative transition cursor-pointer ${
                    activeTab === "cart" ? "bg-[#fff0ef] text-[#6e1329]" : "text-zinc-600 hover:text-[#6e1329]"
                  }`}
                  title="Shopping Basket"
                  type="button"
                >
                  <ShoppingBag size={18} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#cca43b] text-zinc-950 font-mono text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ROW 2: Search bar (Full width on mobile, Wide on desktop) */}
            <div className="w-full md:max-w-xl md:flex-1">
              <form onSubmit={(e) => e.preventDefault()} className="flex items-stretch border-2 border-[#6e1329] rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (activeTab !== "shop") {
                        setActiveTab("shop");
                      }
                    }}
                    placeholder="Search perfumes, brands, categories..."
                    className="w-full pl-3 pr-8 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 text-xs font-bold font-sans p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab !== "shop") {
                      setActiveTab("shop");
                    }
                  }}
                  className="bg-[#6e1329] hover:bg-[#500c1c] text-white px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shrink-0"
                >
                  SEARCH
                </button>
              </form>
            </div>

            {/* DESKTOP NAVIGATION LINKS (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => { setActiveTab("shop"); setSearchQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-display transition cursor-pointer ${
                  activeTab === "shop" && searchQuery === ""
                    ? "bg-[#6e1329] text-white"
                    : "text-zinc-600 hover:bg-[#fff0ef] hover:text-[#6e1329]"
                }`}
              >
                Shop
              </button>
              
              <button
                onClick={() => { setActiveTab("starter"); setSearchQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-display transition flex items-center gap-1 cursor-pointer ${
                  activeTab === "starter"
                    ? "bg-[#6e1329] text-white"
                    : "text-zinc-600 hover:bg-[#fff0ef] hover:text-[#6e1329]"
                }`}
              >
                <Sparkles size={13} className="fill-current" /> 10K Package
              </button>

              <button
                onClick={() => { setActiveTab("account"); setSearchQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-display transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "account"
                    ? "bg-[#6e1329] text-white"
                    : "text-zinc-600 hover:bg-[#fff0ef] hover:text-[#6e1329]"
                }`}
              >
                <User size={14} />
                <span>{user ? user.name.split(" ")[0] : "Account"}</span>
              </button>

              <button
                onClick={() => { setActiveTab("cart"); setSearchQuery(""); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-display transition relative flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "cart"
                    ? "bg-[#6e1329] text-white"
                    : "text-zinc-600 hover:bg-[#fff0ef] hover:text-[#6e1329]"
                }`}
              >
                <ShoppingBag size={14} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-[#cca43b] text-zinc-950 font-mono text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {admin && (
                <button
                  onClick={() => { setActiveTab("admin"); setSearchQuery(""); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-display transition flex items-center gap-1 cursor-pointer ${
                    activeTab === "admin"
                      ? "bg-[#cca43b] text-zinc-950 font-black"
                      : "text-zinc-600 hover:bg-[#fff0ef]"
                  }`}
                >
                  <ShieldCheck size={13} />
                  <span>Dashboard</span>
                </button>
              )}
            </div>

          </div>

          {/* MOBILE COLLAPSED DRAWER MENU */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#f5e3e0] mt-3 pt-3 pb-2 space-y-1 animate-fadeIn">
              <button
                onClick={() => { setActiveTab("shop"); setMobileMenuOpen(false); setSearchQuery(""); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                  activeTab === "shop" && searchQuery === "" ? "bg-[#fff0ef] text-[#6e1329]" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                🛍️ Browse Perfume Catalog
              </button>
              <button
                onClick={() => { setActiveTab("starter"); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                  activeTab === "starter" ? "bg-[#fff0ef] text-[#6e1329]" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                ✨ 10K Reseller Package
              </button>
              <button
                onClick={() => { setActiveTab("account"); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                  activeTab === "account" ? "bg-[#fff0ef] text-[#6e1329]" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                👤 Customer Account ({user ? user.name : "Sign In / Register"})
              </button>
              <button
                onClick={() => { setActiveTab("cart"); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                  activeTab === "cart" ? "bg-[#fff0ef] text-[#6e1329]" : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                🛒 Shopping Basket ({cartCount} Items)
              </button>
              {admin && (
                <button
                  onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
                    activeTab === "admin" ? "bg-[#cca43b] text-zinc-950 font-black" : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  🔑 Admin Dashboard Control
                </button>
              )}
            </div>
          )}

        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="relative bg-[#fffbfb] border-b border-[#f5e3e0] py-12 lg:py-20 overflow-hidden px-4 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(110,19,41,0.03),transparent)] pointer-events-none"></div>
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-[#cca43b]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-center relative">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1 bg-[#fff0ef] text-[#6e1329] text-xs font-bold px-3 py-1 rounded-full border border-[#ecd1cc] uppercase tracking-wider font-display">
              💎 Elite French & German imports
            </span>
            
            <h2 className="text-3xl lg:text-5xl font-black font-display text-[#6e1329] tracking-tight leading-tight uppercase">
              Experience Luxury <br className="hidden md:inline" />
              <span className="text-[#cca43b]">
                In Every Drop
              </span>
            </h2>

            <p className="text-zinc-600 text-sm lg:text-base max-w-xl leading-relaxed">
              Tigint Scents delivers 100% undiluted, pure Grade 1 oil-based perfumes designed to command attention. Stop doing manual WhatsApp queues and automate your fragrance journey or business start-up instantly.
            </p>

            {/* Quick trust bullet points */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2.5 items-start">
                <span className="text-[#cca43b] text-base mt-0.5">🏆</span>
                <div>
                  <h4 className="text-xs font-bold text-[#6e1329] font-display">100% Pure Import</h4>
                  <p className="text-[11px] text-zinc-500">Straight from French & German laboratories</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-[#cca43b] text-base mt-0.5">⏱️</span>
                <div>
                  <h4 className="text-xs font-bold text-[#6e1329] font-display">48-Hour Longevity</h4>
                  <p className="text-[11px] text-zinc-500">Gradual drydown that lingers all day</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-[#cca43b] text-base mt-0.5">🤝</span>
                <div>
                  <h4 className="text-xs font-bold text-[#6e1329] font-display">Resellers Plug</h4>
                  <p className="text-[11px] text-zinc-500">Tiered pricing and KES 10,000 starter package</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="text-[#cca43b] text-base mt-0.5">📦</span>
                <div>
                  <h4 className="text-xs font-bold text-[#6e1329] font-display">Nationwide Dispatch</h4>
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
                className="px-6 py-3 bg-[#cca43b] hover:bg-[#b8912e] text-black font-extrabold uppercase tracking-wider text-xs rounded-lg shadow-md transition cursor-pointer"
              >
                Browse Catalog
              </button>
              <button
                onClick={() => {
                  setActiveTab("starter");
                  document.getElementById("main-shop-view")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-white border border-[#ecd1cc] text-[#6e1329] hover:bg-[#fffbfb] font-bold uppercase tracking-wider text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-[#cca43b]" /> Start 10K Business
              </button>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="absolute w-72 h-72 bg-rose-200/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative bg-white border border-[#ecd1cc] p-6 rounded-2xl max-w-sm w-full shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-[#f5e3e0] pb-3">
                <span className="text-[10px] text-[#6e1329] font-bold uppercase tracking-widest font-mono">Wholesale Hotlist</span>
                <span className="bg-rose-100 text-[#6e1329] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                  🔥 KES 10k Package Sold Today
                </span>
              </div>
              
              <div className="flex gap-4 items-center">
                <img
                  src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=300"
                  alt="Elite oil aluminum bottles"
                  className="w-20 h-20 object-cover rounded-xl border border-zinc-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#6e1329] font-display">Tigint Aluminum Flasks</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Grade A concentrated French formula, sealed for ultimate projection.
                  </p>
                </div>
              </div>

              {/* Pricing breakdown banner */}
              <div className="bg-rose-50/50 p-3 rounded-lg border border-[#ecd1cc] grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-zinc-500 text-[9px] font-mono font-semibold">250ml</p>
                  <p className="text-[#6e1329] font-bold font-mono mt-0.5">Ksh 1,700</p>
                </div>
                <div className="border-x border-[#ecd1cc]">
                  <p className="text-zinc-500 text-[9px] font-mono font-semibold">500ml</p>
                  <p className="text-[#6e1329] font-bold font-mono mt-0.5">Ksh 3,200</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[9px] font-mono font-semibold">1 Litre</p>
                  <p className="text-[#6e1329] font-bold font-mono mt-0.5">Ksh 6,000</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RE-NAV / TAB SWITCHER BAR */}
      <section className="bg-white border-b border-[#f5e3e0] sticky top-[77px] z-30 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 py-3 no-scrollbar scroll-smooth">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("shop")}
              className={`px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer border ${
                activeTab === "shop" 
                  ? "bg-[#fff0ef] text-[#6e1329] border-[#ecd1cc]" 
                  : "text-zinc-600 bg-zinc-50 border-transparent hover:bg-white hover:border-[#ecd1cc]"
              }`}
            >
              🛒 Wholesale & Retail Catalog
            </button>
            
            <button
              onClick={() => setActiveTab("starter")}
              className={`px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer border ${
                activeTab === "starter" 
                  ? "bg-[#fff0ef] text-[#6e1329] border-[#ecd1cc]" 
                  : "text-zinc-600 bg-zinc-50 border-transparent hover:bg-white hover:border-[#ecd1cc]"
              }`}
            >
              💡 KES 10,000 Startup Wizard
            </button>

            <button
              onClick={() => setActiveTab("cart")}
              className={`px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider font-display transition shrink-0 relative cursor-pointer border ${
                activeTab === "cart" 
                  ? "bg-[#fff0ef] text-[#6e1329] border-[#ecd1cc]" 
                  : "text-zinc-600 bg-zinc-50 border-transparent hover:bg-white hover:border-[#ecd1cc]"
              }`}
            >
              🛍️ My Shopping Basket ({cartCount})
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer border ${
                activeTab === "account" 
                  ? "bg-[#fff0ef] text-[#6e1329] border-[#ecd1cc]" 
                  : "text-zinc-600 bg-zinc-50 border-transparent hover:bg-white hover:border-[#ecd1cc]"
              }`}
            >
              👤 {user ? user.name.split(" ")[0] : "My Account"}
            </button>

            {admin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer border ${
                  activeTab === "admin" 
                    ? "bg-[#fff0ef] text-[#6e1329] border-[#ecd1cc]" 
                    : "text-zinc-600 bg-zinc-50 border-transparent hover:bg-white hover:border-[#ecd1cc]"
                }`}
              >
                🔑 Admin Portal
              </button>
            )}
          </div>

          <a
            href="https://wa.me/254794594222"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-bold rounded-full uppercase tracking-wider font-display transition shrink-0 cursor-pointer border border-[#ecd1cc] bg-[#fff0ef] text-[#6e1329] hover:bg-[#ffe5e2] flex items-center gap-1"
          >
            <MessageCircle size={13} className="text-[#6e1329]" /> Contact / WhatsApp
          </a>
        </div>
      </section>

      {/* MAIN VIEW AREA */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-12" id="main-shop-view">
        
        {/* TAB 1: WHOLESALE & RETAIL CATALOG */}
        {activeTab === "shop" && (() => {
          const filteredSprays = products
            .filter((p) => p.category === "retail_spray")
            .filter((p) => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();
              return (
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.badge && p.badge.toLowerCase().includes(query))
              );
            });

          const filteredAccessories = products
            .filter((p) => p.category === "accessory")
            .filter((p) => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();
              return (
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
              );
            });

          return (
            <div className="space-y-12">
              
              {searchQuery && (
                <div className="bg-[#fff0ef] border border-[#ecd1cc] text-[#6e1329] px-5 py-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔎</span>
                    <p className="text-xs font-medium">
                      Found <strong>{filteredSprays.length + filteredAccessories.length}</strong> matching item(s) for "<strong>{searchQuery}</strong>".
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-3 py-1 bg-[#6e1329] hover:bg-[#500c1c] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                  >
                    Clear Search Filter
                  </button>
                </div>
              )}

              {/* CATEGORY A: WHOLESALE OILS PANEL */}
              <div className="bg-white border border-[#ecd1cc] rounded-2xl p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f5e3e0] pb-5 mb-6">
                  <div>
                    <span className="text-[10px] bg-[#fff0ef] text-[#6e1329] font-bold px-2.5 py-1 rounded-full border border-[#ecd1cc] uppercase tracking-wider font-display">
                      Category A — Wholesale Oils
                    </span>
                    <h3 className="text-xl font-bold font-display text-[#6e1329] mt-2">
                      Undiluted Perfume Oils (Bulk Aluminum Cans)
                    </h3>
                    <p className="text-zinc-600 text-xs mt-0.5">
                      Select a dynamic fragrance scent profile and select your preferred wholesale size.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-rose-100 text-[#6e1329] text-xs px-2.5 py-1 rounded-full border border-[#ecd1cc] font-bold">
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
                      <label className="block text-xs font-bold text-[#6e1329] uppercase tracking-wider mb-2 font-display">
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
                                ? "border-[#6e1329] bg-[#fff0ef] text-[#6e1329] font-bold"
                                : "border-zinc-200 bg-zinc-50/20 text-zinc-600 hover:border-[#ecd1cc] hover:bg-white"
                            }`}
                          >
                            <span className="text-sm font-bold block font-display">{sizeOpt.size} Size</span>
                            <span className="font-mono text-sm font-bold text-[#cca43b] mt-2 block">
                              KES {sizeOpt.price.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center gap-4 border-t border-[#f5e3e0] pt-6">
                      <div>
                        <label className="block text-xs text-zinc-500 mb-1">Quantity (Cans)</label>
                        <div className="flex items-center border border-[#ecd1cc] rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => setWholesaleQty(Math.max(1, wholesaleQty - 1))}
                            className="px-3 py-1.5 text-zinc-600 hover:text-black transition font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-4 py-1.5 text-xs text-zinc-950 font-mono font-bold">
                            {wholesaleQty}
                          </span>
                          <button
                            onClick={() => setWholesaleQty(wholesaleQty + 1)}
                            className="px-3 py-1.5 text-zinc-600 hover:text-black transition font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddWholesaleOil}
                        className="flex-1 py-3.5 px-6 bg-[#cca43b] hover:bg-[#b8912e] text-black font-extrabold uppercase tracking-widest text-xs rounded-lg shadow-sm transition duration-150 cursor-pointer self-end"
                      >
                        Add Wholesale Oils to Basket
                      </button>
                    </div>

                    {oilAddedMessage && (
                      <p className="text-xs text-[#6e1329] font-bold bg-[#fff0ef] p-2.5 rounded-lg border border-[#ecd1cc] text-center animate-pulse">
                        ✓ Grade 1 {selectedScent.name} ({currentSizeOption.size}) added to your basket successfully!
                      </p>
                    )}
                  </div>

                  {/* Scent visual description panel */}
                  <div className="lg:col-span-5 bg-rose-50/30 border border-[#f5e3e0] rounded-2xl p-5 flex flex-col justify-between shadow-inner">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#f5e3e0] pb-2">
                        <h4 className="text-xs font-bold text-[#6e1329] uppercase tracking-widest font-display">
                          Chemical Olfactory Profile
                        </h4>
                        <span className="text-[10px] bg-[#fff0ef] text-[#6e1329] font-bold px-2 py-0.5 rounded border border-[#ecd1cc]">
                          Grade 1 Pure
                        </span>
                      </div>

                      <div>
                        <h5 className="text-xl font-bold font-display text-[#6e1329]">{selectedScent.name}</h5>
                        <span className="text-xs text-zinc-500">Scent Classification: </span>
                        <span className="text-xs text-[#cca43b] font-bold">{selectedScent.profile}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Formula Chemistry Notes:</p>
                        <p className="text-xs text-zinc-600 leading-relaxed italic">
                          "{selectedScent.notes}"
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">Sales Velocity Metric:</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-rose-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-400 to-[#cca43b]" 
                              style={{ width: `${selectedScent.popularity}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-[#6e1329] font-mono font-bold">{selectedScent.popularity}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#f5e3e0] text-xs text-zinc-500 flex gap-2">
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
                  <span className="text-[10px] bg-[#fff0ef] text-[#6e1329] font-bold px-2.5 py-1 rounded-full border border-[#ecd1cc] uppercase tracking-wider font-display">
                    Category B — Designer & Branded Perfumes
                  </span>
                  <h3 className="text-xl font-bold font-display text-[#6e1329] mt-2">
                    Designer Sprays (Flat Rate Retailing Boxed Items)
                  </h3>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    Individually boxed miniature and standard EDP retail sprays ready for immediate consumption or gift distribution.
                  </p>
                </div>

                {filteredSprays.length === 0 ? (
                  <div className="bg-zinc-50 rounded-2xl border border-dashed border-[#ecd1cc] p-8 text-center space-y-2">
                    <p className="text-sm font-bold text-zinc-700">No matching sprays found</p>
                    <p className="text-xs text-zinc-500">Try searching for other brand words or clear your filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredSprays.map((p) => {
                      const isOutOfStock = p.isAvailable === false || p.isAvailable === 0;
                      return (
                        <div key={p.id} className={`bg-white border border-[#ecd1cc] rounded-2xl overflow-hidden hover:border-[#6e1329] transition duration-200 flex flex-col justify-between shadow-sm relative ${isOutOfStock ? "opacity-75" : ""}`}>
                          <div className="relative">
                            <img
                              src={p.image}
                              alt={p.name}
                              className={`w-full h-44 object-cover ${isOutOfStock ? "filter grayscale blur-[1px]" : ""}`}
                            />
                            {p.badge && (
                              <span className="absolute top-2.5 left-2.5 bg-[#6e1329] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {p.badge}
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="absolute top-2.5 right-2.5 bg-zinc-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-[#6e1329] font-display line-clamp-1">{p.name}</h4>
                              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed h-8">
                                {p.description}
                              </p>
                            </div>

                            <div className="pt-2 flex items-center justify-between border-t border-[#f5e3e0]">
                              <div>
                                <p className="text-[10px] text-zinc-400">Retail Campaign</p>
                                <p className="text-sm font-bold text-[#6e1329] font-mono">KES {p.price?.toLocaleString()}</p>
                              </div>
                              <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={() => handleAddProductToCart(p)}
                                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded cursor-pointer transition ${
                                  isOutOfStock 
                                    ? "bg-zinc-200 text-zinc-500 cursor-not-allowed" 
                                    : "bg-[#cca43b] hover:bg-[#b8912e] text-black"
                                }`}
                              >
                                {isOutOfStock ? "Sold Out" : "Add To Basket"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CATEGORY C: BOTTLES & ACCESSORIES */}
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] bg-[#fff0ef] text-[#6e1329] font-bold px-2.5 py-1 rounded-full border border-[#ecd1cc] uppercase tracking-wider font-display">
                    Category C — Bottles & Accessories
                  </span>
                  <h3 className="text-xl font-bold font-display text-[#6e1329] mt-2">
                    Empty Refill Containers & Display Glassware
                  </h3>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    Sourcing premium glass decant roll-ons per dozen and high-polish fancy display spray pumps for professional scent customizer stalls.
                  </p>
                </div>

                {filteredAccessories.length === 0 ? (
                  <div className="bg-zinc-50 rounded-2xl border border-dashed border-[#ecd1cc] p-8 text-center space-y-2">
                    <p className="text-sm font-bold text-zinc-700">No matching accessories found</p>
                    <p className="text-xs text-zinc-500">Try searching for other words or clear your filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {filteredAccessories.map((p) => {
                      const isOutOfStock = p.isAvailable === false || p.isAvailable === 0;
                      return (
                        <div key={p.id} className={`bg-white border border-[#ecd1cc] rounded-2xl overflow-hidden hover:border-[#6e1329] transition duration-200 flex flex-col justify-between shadow-sm relative ${isOutOfStock ? "opacity-75" : ""}`}>
                          <div className="relative">
                            <img
                              src={p.image}
                              alt={p.name}
                              className={`w-full h-32 object-cover ${isOutOfStock ? "filter grayscale blur-[1px]" : ""}`}
                            />
                            {isOutOfStock && (
                              <span className="absolute top-2 right-2 bg-zinc-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                Sold Out
                              </span>
                            )}
                          </div>
                          <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-bold text-[#6e1329] truncate font-display">{p.name}</h4>
                              </div>
                              <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">
                                {p.description}
                              </p>
                            </div>

                            <div className="pt-2 flex items-center justify-between border-t border-[#f5e3e0]">
                              <span className="text-xs font-bold text-[#cca43b] font-mono">
                                KES {p.price?.toLocaleString()}
                              </span>
                              <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={() => handleAddProductToCart(p)}
                                className={`p-1.5 rounded border text-[10px] px-2.5 uppercase tracking-wide transition cursor-pointer ${
                                  isOutOfStock 
                                    ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed" 
                                    : "bg-zinc-50 hover:bg-[#fff0ef] border-[#ecd1cc] text-[#6e1329] font-extrabold"
                                }`}
                              >
                                {isOutOfStock ? "Empty" : "+ Add"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

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
            user={user}
          />
        )}

        {/* TAB 4: JUMIA-STYLE CUSTOMER ACCOUNT PORTAL */}
        {activeTab === "account" && (
          user ? (
            <AccountView
              user={user}
              onLogout={() => {
                setUser(null);
                setActiveTab("shop");
              }}
              cartCount={cartCount}
              onGoToShop={() => setActiveTab("shop")}
            />
          ) : (
            <LoginView
              onLoginSuccess={(loggedInUser) => {
                setUser(loggedInUser);
                setActiveTab("account");
              }}
              onGoToShop={() => setActiveTab("shop")}
            />
          )
        )}

        {/* TAB 5: SECURE ADMINISTRATIVE INVENTORY CONTROL */}
        {activeTab === "admin" && (
          <AdminDashboard
            admin={admin}
            onAdminLogin={(loggedInAdmin) => setAdmin(loggedInAdmin)}
            onAdminLogout={() => {
              setAdmin(null);
              setActiveTab("shop");
            }}
            products={products}
            onRefreshProducts={refreshProducts}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#f5e3e0] py-12 px-4 lg:px-8 text-zinc-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#6e1329] uppercase tracking-wider font-display">Tigint Scents Ltd</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Kenya's ultimate plug for grade 1 undiluted oil perfumes imported straight from premium manufacturers in France and Germany. Automating retail and reseller dispatches.
            </p>
            <div className="flex gap-2.5 pt-2">
              <a href="https://tiktok.com/@tigint.scents" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-[#6e1329] transition">
                <ThumbsUp size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-[#6e1329] transition">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#6e1329] uppercase tracking-wider font-display">Nairobi Headquarters</h4>
            <div className="space-y-2 text-xs text-zinc-500">
              <p className="flex items-start gap-1.5 leading-relaxed">
                <MapPin size={14} className="text-[#cca43b] shrink-0 mt-0.5" />
                <span>Nairobi CBD, junction between Dubois Road & Latema Road, Junction Stalls building, First Floor Shop 102.</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={14} className="text-[#cca43b] shrink-0" />
                <span>+254 794 594 222 (Calls/WhatsApp)</span>
              </p>
            </div>
          </div>

          {/* Reseller shortcuts */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#6e1329] uppercase tracking-wider font-display">Reseller shortcuts</h4>
            <ul className="space-y-1.5 text-xs text-zinc-500 font-medium">
              <li>
                <button onClick={() => setActiveTab("starter")} className="hover:text-[#6e1329] transition text-left cursor-pointer">
                  → Customize KES 10,000 Starter Package
                </button>
              </li>
              <li>
                <a 
                  href="https://wa.me/254794594222" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-[#6e1329] transition text-left cursor-pointer flex items-center gap-1"
                >
                  → Join Reseller WhatsApp Group Chat
                </a>
              </li>
              <li>
                <button onClick={() => setActiveTab("shop")} className="hover:text-[#6e1329] transition text-left cursor-pointer">
                  → Sourcing Gold Aluminum Oil Cannisters
                </button>
              </li>
            </ul>
          </div>

          {/* Real Embedded Google Map for pristine localized customer trust */}
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-[#cca43b] uppercase tracking-widest font-display">Interactive Shop Locator</h5>
            <div className="overflow-hidden rounded-xl border border-[#ecd1cc] shadow-sm bg-rose-50/20">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8190774618214!2d36.8248983!3d-1.2823678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d7a049cb47%3A0xe104cf4c9bb98fbc!2sDubois%20Rd%20%26%20Latema%20Rd%2C%20Nairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1715000000000!5m2!1sen!2ske"
                className="w-full h-28 border-0" 
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tigint Scents Shop Location"
              ></iframe>
            </div>
            <p className="text-[9.5px] text-zinc-500 leading-snug">
              First Floor Shop 102, Junction Stalls. Walk in to sample oil testers today!
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-[#f5e3e0] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
          <div>
            <p>© 2026 Tigint Scents. Built by Expert Full-Stack Developer & Designer.</p>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Designed by Praxis Labs &middot; Lead Engineering by Charlie CEO</p>
          </div>
          <div className="flex gap-4 font-semibold text-[#6e1329] text-[11px]">
            <span>Walk-ins Welcome</span>
            <span>·</span>
            <span>Nationwide Bus Delivery Support</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
