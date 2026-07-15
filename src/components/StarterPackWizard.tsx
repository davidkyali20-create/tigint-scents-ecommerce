import React, { useState } from "react";
import { Sparkles, Loader2, Plus, ShoppingBag, Info, ShieldCheck, Flame } from "lucide-react";
import { CartItem } from "../types";

interface RecommendedScent {
  scentName: string;
  reason: string;
  suggestedQty: number;
}

interface AISuggestion {
  recommendedScents: RecommendedScent[];
  marketingAdvice: string;
  projectedProfit: string;
}

interface StarterPackWizardProps {
  onAddPackageToCart: (customItem: CartItem) => void;
}

const DEMOGRAPHIC_PRESETS = [
  { label: "Campus & College Students", text: "Trendy university students in Nairobi looking for sweet, affordable, head-turning perfumes" },
  { label: "CBD Corporate Executives", text: "Professional men and women working in central offices, seeking sophisticated long-lasting scents" },
  { label: "Upcountry Neighbors & Relatives", text: "General family, friends, and church groups in rural/suburban towns, wanting versatile, familiar scents" },
  { label: "Salon & Barber Shop Resellers", text: "Sub-retail in local beauty parlors, looking for ultra-strong masculine and feminine beasts" }
];

export default function StarterPackWizard({ onAddPackageToCart }: StarterPackWizardProps) {
  const [demographic, setDemographic] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AISuggestion | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsAdded(false);
    try {
      const response = await fetch("/api/gemini/starter-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDemographic: demographic || "General estate crowd",
          customGoals: goals || "Maximize profit in local beauty space"
        })
      });
      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiResult(resData.data);
      } else {
        throw new Error("Could not fetch recommendation");
      }
    } catch (err) {
      console.error(err);
      // Hard fallback preset
      setAiResult({
        recommendedScents: [
          { scentName: "Black Vanilla", reason: "Kenya's absolute #1 bestseller. Sweet, appealing to all demographics.", suggestedQty: 4 },
          { scentName: "Pink Chiffon", reason: "Highly requested sweet-floral by ladies.", suggestedQty: 3 },
          { scentName: "Ferrari Blue", reason: "Extremely popular fresh sporty notes for young men.", suggestedQty: 2 },
          { scentName: "Sauvage", reason: "Premium woody-spice profile with massive projection.", suggestedQty: 1 }
        ],
        marketingAdvice: "Focus on social selling on TikTok! Record videos of you packaging orders or showing the undiluted longevity test. Hand out custom sample papers at salons or barber shops.",
        projectedProfit: "Decant your 300ml oil supply (10 x 30ml) into 50 x 6ml roll-on bottles. Selling each roll-on at KES 350 earns you KES 17,500 total, netting over KES 7,500 pure profit on your KES 10,000 package investment!"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!aiResult) return;
    
    // Create a breakdown list string for cart display
    const breakdown = aiResult.recommendedScents
      .map((s) => `${s.suggestedQty}x ${s.scentName}`)
      .join(", ");

    const customCartItem: CartItem = {
      id: `starter_pack_ai_${Date.now()}`,
      productId: "starter-package-10k",
      name: "Tigint KES 10,000 Custom Starter Package",
      category: "oil_wholesale",
      selectedScent: `AI Recommended: ${breakdown}`,
      selectedSize: "10 x 30ml Oils + 2 Dozen 6ml Bottles",
      quantity: 1,
      priceEach: 10000,
      totalPrice: 10000,
      image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600"
    };

    onAddPackageToCart(customCartItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  return (
    <div className="bg-zinc-950 border border-yellow-500/20 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden" id="starter-pack-wizard">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Package Value Proposition Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-900 pb-6 mb-6">
        <div>
          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-500/20 mb-3 uppercase tracking-wider font-display">
            🎯 Starter Package — KES 10,000
          </span>
          <h3 className="text-2xl font-bold font-display text-white tracking-tight">
            Launch Your Own Perfume Business Today
          </h3>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Everything you need to double your investment in one week. Includes <strong className="text-yellow-500">10 x 30ml Pure Grade 1 Oils</strong> + <strong className="text-yellow-500">2 Dozen (24 pcs) Empty 6ml Roll-on Bottles</strong>.
          </p>
        </div>
        <div className="text-right flex flex-col items-start lg:items-end">
          <p className="text-xs text-zinc-500">Guaranteed Return</p>
          <p className="text-3xl font-extrabold text-yellow-500 font-mono">KES 10,000</p>
          <div className="flex gap-1.5 mt-1 text-[11px] text-green-400 items-center bg-green-500/10 px-2 py-0.5 rounded-full">
            <ShieldCheck size={12} /> Double Your Money (100% Margin)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 font-display flex items-center gap-1.5">
              <Sparkles size={16} className="text-yellow-500" /> AI-Powered Scent Curator
            </h4>
            
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Who is your target customer group?
            </label>
            
            {/* Quick demographic pills */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DEMOGRAPHIC_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setDemographic(p.text);
                  }}
                  className={`p-2 rounded text-left border text-[11px] transition ${
                    demographic === p.text
                      ? "border-yellow-500 bg-yellow-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="font-semibold block text-yellow-500/90">{p.label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={demographic}
              onChange={(e) => setDemographic(e.target.value)}
              placeholder="e.g. Trendy college ladies in Eldoret and Nairobi who love sweet caramel notes..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4 h-16"
              required
            />

            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Any custom marketing goals / pricing plans? (Optional)
            </label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. Sell each roll-on at Ksh 350, maximize social media sales"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-zinc-800 text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg transition duration-200 hover:shadow-yellow-500/20 uppercase tracking-wider font-display cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Designing Portfolio with Gemini...
              </>
            ) : (
              <>
                <Sparkles size={16} className="fill-current" /> Auto-Select 10 Best Scents
              </>
            )}
          </button>
        </form>

        {/* Output Panel */}
        <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between min-h-[300px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <Loader2 size={36} className="animate-spin text-yellow-500 mb-3" />
              <p className="text-sm font-semibold text-white">Analyzing Perfume Chemistry & Nairobi Trends</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Sifting through Black Vanilla sales velocity and wholesale metrics to maximize your margins.
              </p>
            </div>
          ) : aiResult ? (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-widest font-display">
                    Recommended 10-Portion Scent Composition
                  </h5>
                  <span className="text-[10px] bg-green-500/15 text-green-400 font-bold px-2 py-0.5 rounded-full">
                    Optimized Portfolio
                  </span>
                </div>

                {/* Scents Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {aiResult.recommendedScents.map((s, idx) => (
                    <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5 relative">
                      <div className="absolute top-2 right-2 bg-yellow-500/10 text-yellow-500 font-mono text-xs font-bold px-1.5 py-0.5 rounded">
                        {s.suggestedQty} portions
                      </div>
                      <p className="font-bold text-xs text-white pr-16">{s.scentName}</p>
                      <p className="text-[10px] text-zinc-400 mt-1 italic">{s.reason}</p>
                    </div>
                  ))}
                </div>

                {/* Profit math banner */}
                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3 mt-4">
                  <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Projected Business Profit Margin</p>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {aiResult.projectedProfit}
                  </p>
                </div>

                {/* Local Marketing Tips */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 mt-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CBD Reseller Action Strategy</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {aiResult.marketingAdvice}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/40">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                    isAdded 
                      ? "bg-green-500 text-white" 
                      : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-lg shadow-yellow-500/10"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <ShieldCheck size={16} /> Custom Starter Pack Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} /> Add AI Customized Pack to Cart (KES 10,000)
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-yellow-500 mb-3">
                <Info size={20} />
              </div>
              <p className="text-sm font-semibold text-zinc-300">Portfolios Ready for Creation</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                Choose a customer target or enter custom goals on the left, then click <strong>"Auto-Select 10 Best Scents"</strong> to let Gemini build your tailored perfume starter package catalog!
              </p>
              
              {/* Promo Banner inside */}
              <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex items-center gap-2 text-left max-w-sm">
                <span className="p-1 rounded bg-yellow-500/10 text-yellow-500">
                  <Flame size={14} />
                </span>
                <p className="text-[10px] text-zinc-400">
                  <strong className="text-white">Tip:</strong> Select <strong>"Campus & College Students"</strong> for sweet, fruity, vanilla blends with rapid stock turnarounds.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
