import React, { useState, useEffect } from "react";
import { Code, Play, RefreshCw, Send, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export default function APIDocsPanel() {
  const [activeTab, setActiveTab] = useState<"inventory" | "pay">("inventory");
  const [inventoryLog, setInventoryLog] = useState<any>(null);
  const [loadingInv, setLoadingInv] = useState(false);
  
  // Pay simulation form
  const [phone, setPhone] = useState("0794594222");
  const [amount, setAmount] = useState("10000");
  const [method, setMethod] = useState("nairobi_rider");
  const [payResponse, setPayResponse] = useState<any>(null);
  const [loadingPay, setLoadingPay] = useState(false);

  const fetchInventory = async () => {
    setLoadingInv(true);
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventoryLog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInv(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPay(true);
    setPayResponse(null);
    try {
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: parseFloat(amount),
          deliveryMethod: method,
          locationDetails: "Nairobi CBD Stalls, Shop 102 First Floor",
          items: [
            { productId: "oil_wholesale", quantity: 1, name: "Grade 1 Oil-Based Perfume Oil (Wholesale)" }
          ]
        })
      });
      const data = await response.json();
      setPayResponse(data);
      
      // Update inventory display automatically since stock was deducted
      fetchInventory();
    } catch (err: any) {
      setPayResponse({
        success: false,
        message: err.message || "Failed to make simulated payment request."
      });
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 lg:p-8" id="api-docs-panel">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2 rounded bg-yellow-500/10 text-yellow-500">
          <Code size={22} />
        </span>
        <div>
          <h3 className="text-xl font-bold font-display text-white tracking-tight">
            Integrated API Sandbox & Logs
          </h3>
          <p className="text-zinc-400 text-xs mt-0.5">
            Test the live full-stack endpoints connecting payment gateways and warehouse syncing.
          </p>
        </div>
      </div>

      {/* Endpoint switch tab */}
      <div className="grid grid-cols-2 gap-2 mb-6 bg-zinc-900/60 p-1 rounded-lg border border-zinc-900">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
            activeTab === "inventory"
              ? "bg-yellow-500 text-black shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          GET /api/inventory
        </button>
        <button
          onClick={() => setActiveTab("pay")}
          className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
            activeTab === "pay"
              ? "bg-yellow-500 text-black shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          POST /api/pay
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Play control area */}
        <div className="lg:col-span-5 space-y-4">
          {activeTab === "inventory" ? (
            <div className="space-y-3">
              <div>
                <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  SECURE ENDPOINT
                </span>
                <h4 className="text-sm font-bold text-white font-display mt-2">
                  Inventory Synchronizer
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Queries real-time stock balances on Dubois Road. Deducts quantities automatically upon successful checkout to prevent double-allocation of scarce Grade 1 oils.
                </p>
              </div>

              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Method:</span>
                  <strong className="text-green-400 font-mono">GET</strong>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>URL:</span>
                  <code className="text-yellow-500 font-mono text-[11px] bg-zinc-950 px-1 py-0.5 rounded">
                    /api/inventory
                  </code>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Authorization:</span>
                  <span className="text-zinc-500">None required (Public Catalog)</span>
                </div>
              </div>

              <button
                onClick={fetchInventory}
                disabled={loadingInv}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {loadingInv ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Fetch Stock Balances
              </button>
            </div>
          ) : (
            <form onSubmit={handleSimulatePayment} className="space-y-3">
              <div>
                <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                  STK PUSH TRIGGER
                </span>
                <h4 className="text-sm font-bold text-white font-display mt-2">
                  M-PESA Payment Gateway
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Fires an automated STK Push prompt to the client's Safaricom line. Once confirmed, creates order line records and dispatches delivery riders.
                </p>
              </div>

              <div className="space-y-2 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    M-PESA Reseller Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                      Total (KES)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                      Dispatch Route
                    </label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="shop_pickup">Dubois Shop 102</option>
                      <option value="nairobi_rider">Nairobi Rider (+300)</option>
                      <option value="upcountry_parcel">Upcountry Parcel (+500)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingPay}
                className="w-full py-2.5 bg-yellow-500 text-black rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition duration-150 hover:bg-yellow-600 cursor-pointer"
              >
                {loadingPay ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Issuing STK Request...
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current" /> Fire STK Push Trigger
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Live response / console log panel */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex-1 flex flex-col overflow-hidden min-h-[250px]">
            {/* Header bar */}
            <div className="bg-zinc-950 px-4 py-2 flex items-center justify-between border-b border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-wide">
                REST RESPONSE CONSOLE
              </span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
              </div>
            </div>

            {/* Response body */}
            <div className="p-4 flex-1 font-mono text-[11px] text-zinc-300 overflow-y-auto max-h-72">
              {activeTab === "inventory" ? (
                loadingInv ? (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    <Loader2 size={18} className="animate-spin mr-2" /> Executing GET request...
                  </div>
                ) : inventoryLog ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {JSON.stringify(inventoryLog, null, 2)}
                  </pre>
                ) : (
                  <p className="text-zinc-500 italic">No request executed yet.</p>
                )
              ) : loadingPay ? (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  <Loader2 size={18} className="animate-spin mr-2" /> Executing POST /api/pay request...
                </div>
              ) : payResponse ? (
                <div className="space-y-3">
                  <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded flex items-center gap-2">
                    <CheckCircle2 size={14} /> Response Status: 200 OK
                  </div>
                  <pre className="whitespace-pre-wrap leading-relaxed text-zinc-200">
                    {JSON.stringify(payResponse, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center py-8">
                  <p className="italic">Sandbox idle.</p>
                  <p className="text-[10px] text-zinc-600 mt-1 max-w-xs">
                    Fill the form on the left and click "Fire STK Push" to initiate Safaricom Daraja API simulation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
