import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { ShieldAlert, PlusCircle, ToggleLeft, ToggleRight, Trash2, Check, RefreshCw, LayoutDashboard } from "lucide-react";

interface AdminDashboardProps {
  admin: { email: string } | null;
  onAdminLogin: (admin: { email: string }) => void;
  onAdminLogout: () => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export default function AdminDashboard({ admin, onAdminLogin, onAdminLogout, products, onRefreshProducts }: AdminDashboardProps) {
  // Login credentials state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // New product form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"oil_wholesale" | "retail_spray" | "accessory">("retail_spray");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Preset Unsplash images option for beautiful simulation uploads
  const imagePresets = [
    { name: "Premium Amber Bottle", url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600" },
    { name: "Luxury French Spray", url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600" },
    { name: "Decant Glass Rollon", url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600" },
    { name: "Oud & Wood Essence", url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onAdminLogin(data.admin);
      } else {
        setLoginError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setLoginError("Connection failed. Check development server console.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setActionLoading(true);

    if (!name || !description || !imageUrl) {
      setFormError("Product name, description, and image are required.");
      setActionLoading(false);
      return;
    }

    try {
      const payload: any = {
        name,
        category,
        description,
        image: imageUrl,
        badge: badge || undefined
      };

      if (category === "oil_wholesale") {
        // Automatically append standard sizes for wholesale oils
        payload.sizes = [
          { size: "250ml", price: 1700 },
          { size: "500ml", price: 3200 },
          { size: "1 Litre", price: 6000 }
        ];
      } else {
        payload.price = price ? parseFloat(price) : 150;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setFormSuccess("Product added successfully to inventory catalog!");
        onRefreshProducts();
        // Reset form
        setName("");
        setDescription("");
        setImageUrl("");
        setPrice("");
        setBadge("");
      } else {
        setFormError(data.message || "Failed to add product.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Server error adding product.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAvailability = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        onRefreshProducts();
      } else {
        alert(data.message || "Toggle failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting server to toggle product.");
    }
  };

  // ---------------------------------------------------------------------------
  // SECURE SIGN IN RENDER
  // ---------------------------------------------------------------------------
  if (!admin) {
    return (
      <div className="max-w-md mx-auto bg-white border border-[#ecd1cc] rounded-2xl overflow-hidden shadow-sm mt-4 text-left">
        <div className="bg-[#6e1329] p-6 text-center text-white">
          <div className="w-12 h-12 bg-[#cca43b] text-black rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm font-bold">
            ADM
          </div>
          <h3 className="text-lg font-black font-display uppercase tracking-wider">
            Tigint Scents Admin Portal
          </h3>
          <p className="text-xs text-rose-100/90 mt-1">
            Sign in with administrative privileges to manage stock and add new catalog items.
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {loginError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 flex gap-2 items-start font-medium">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Admin Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tigintscents.com"
              className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1">Administrative Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
            />
          </div>

          <div className="bg-[#fffbfb] border border-[#ecd1cc] p-3 rounded-lg text-[10px] text-zinc-500 leading-snug">
            💡 <strong>Development Credentials:</strong> Use <span className="font-bold text-[#6e1329]">admin@tigintscents.com</span> and password <span className="font-bold text-[#6e1329]">ChangeMe2026!</span> to log in.
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 bg-[#cca43b] text-zinc-950 font-black uppercase tracking-widest rounded-lg text-xs hover:bg-[#b8912e] transition duration-150 cursor-pointer flex items-center justify-center"
          >
            {authLoading ? (
              <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
            ) : "Verify Security Keys & Sign In"}
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATED DASHBOARD PORTAL
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 text-left">
      <div className="bg-white border border-[#ecd1cc] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-[#fff0ef] text-[#6e1329] font-bold px-2.5 py-1 rounded-full border border-[#ecd1cc] uppercase tracking-wider font-mono">
            Owner Access Verified
          </span>
          <h2 className="text-xl font-black font-display text-[#6e1329] mt-2 flex items-center gap-1.5 uppercase">
            <LayoutDashboard size={20} className="text-[#cca43b]" /> Tigint Inventory Portal
          </h2>
          <p className="text-xs text-zinc-500 font-mono">Operator ID: {admin.email}</p>
        </div>

        <button
          onClick={onAdminLogout}
          className="px-4 py-2 border border-[#ecd1cc] text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-[#6e1329] hover:bg-[#fff0ef] rounded-lg transition"
        >
          Exit Admin Mode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ADD PRODUCT COLUMN (LEFT) */}
        <div className="lg:col-span-5 bg-white border border-[#ecd1cc] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-[#6e1329] uppercase tracking-wider font-display border-b border-[#f5e3e0] pb-2 flex items-center gap-1.5">
            <PlusCircle size={16} className="text-[#cca43b]" /> Upload New Product
          </h3>

          {formSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-3 rounded-lg flex items-center gap-1.5 font-medium">
              <Check size={14} className="shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-medium">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Product Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dior Sauvage Elixir Oil"
                className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329] h-10"
                >
                  <option value="retail_spray">Designer Spray</option>
                  <option value="oil_wholesale">Wholesale Oil</option>
                  <option value="accessory">Empty Bottle / Accessory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Campaign Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Bestseller, 20% Off"
                  className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
                />
              </div>
            </div>

            {category !== "oil_wholesale" && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Base Price (KES)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329] font-mono"
                />
              </div>
            )}

            {category === "oil_wholesale" && (
              <div className="bg-rose-50/50 p-2.5 rounded-lg border border-[#f5e3e0] text-[11px] text-zinc-600 leading-snug">
                ℹ️ <strong>Wholesale Oil Sizes:</strong> This category will automatically assign the standard wholesale tiered volumes: <strong>250ml (Ksh 1,700)</strong>, <strong>500ml (Ksh 3,200)</strong>, and <strong>1 Litre (Ksh 6,000)</strong>.
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Image URL</label>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste direct URL from unsplash/Pinterest"
                className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329] font-mono"
              />
            </div>

            {/* Presets shortcut */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Quick Presets Shortcuts</label>
              <div className="grid grid-cols-2 gap-1.5">
                {imagePresets.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(img.url)}
                    className="p-1.5 text-[10px] border border-[#ecd1cc] hover:bg-[#fff0ef] rounded text-zinc-700 font-medium truncate text-left"
                  >
                    📸 {img.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Marketing Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High longevity, rich sillage, imported from elite laboratories..."
                className="w-full bg-white border border-[#ecd1cc] rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#6e1329]"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3 bg-[#cca43b] text-zinc-950 font-black uppercase tracking-widest rounded-lg text-xs hover:bg-[#b8912e] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {actionLoading ? (
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
              ) : "Create Product & Publish"}
            </button>
          </form>
        </div>

        {/* INVENTORY LIST COLUMN (RIGHT) */}
        <div className="lg:col-span-7 bg-white border border-[#ecd1cc] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#f5e3e0] pb-2">
            <h3 className="text-sm font-black text-[#6e1329] uppercase tracking-wider font-display">
              Catalog Availability Controller
            </h3>
            <button
              onClick={onRefreshProducts}
              className="p-1 text-[#6e1329] hover:bg-[#fff0ef] rounded transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            >
              <RefreshCw size={12} /> Sync Inventory
            </button>
          </div>

          <p className="text-zinc-600 text-xs">
            Toggle the availability switches. Items marked "Out of Stock" are instantly disabled from purchasing in the front catalog.
          </p>

          <div className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto pr-2 space-y-1">
            {products.map((p) => (
              <div key={p.id} className="py-3 flex gap-3 justify-between items-center">
                <div className="flex gap-3 items-center min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded-lg bg-zinc-50 border border-zinc-100"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#6e1329] truncate">{p.name}</h4>
                    <div className="flex gap-2 items-center mt-0.5">
                      <span className="text-[9px] bg-zinc-100 text-zinc-500 font-mono px-1.5 py-0.5 rounded border">
                        {p.category}
                      </span>
                      {p.price && (
                        <span className="text-[10px] text-[#cca43b] font-bold font-mono">
                          KES {p.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${p.isAvailable !== false ? "text-green-600" : "text-zinc-400"}`}>
                    {p.isAvailable !== false ? "Available" : "Out of Stock"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(p.id)}
                    className="text-[#6e1329] hover:text-[#500c1c] transition focus:outline-none cursor-pointer"
                    title={p.isAvailable !== false ? "Mark Out of Stock" : "Mark Available"}
                  >
                    {p.isAvailable !== false ? (
                      <ToggleRight size={32} className="text-[#6e1329] fill-current" />
                    ) : (
                      <ToggleLeft size={32} className="text-zinc-300" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
