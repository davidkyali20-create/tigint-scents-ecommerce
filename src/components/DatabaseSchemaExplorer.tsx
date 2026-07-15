import React, { useState } from "react";
import { Database, Code, ShieldAlert, Check, Copy, Layers } from "lucide-react";

export default function DatabaseSchemaExplorer() {
  const [activeTab, setActiveTab] = useState<"erd" | "sql" | "json">("erd");
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- Tigint Scents E-Commerce Schema
-- Clean relational DDL statements for PostgreSQL / Supabase

-- 1. Scents Catalog (Dynamic scent options for wholesale oil)
CREATE TABLE scents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    profile VARCHAR(100) NOT NULL, -- e.g. 'Sweet & Warm', 'Fresh & Sporty'
    notes TEXT NOT NULL,           -- e.g. 'Vanilla, Sandalwood'
    popularity INT DEFAULT 90,     -- popularity scale 0-100
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Core Products Table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'oil_wholesale', 'retail_spray', 'accessory'
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    badge VARCHAR(50)
);

-- 3. Product Variants & Tiered Size Pricing
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    size_label VARCHAR(50) NOT NULL, -- '250ml', '500ml', '1 Litre', or 'Flat Rate'
    price NUMERIC(10, 2) NOT NULL     -- KES Price
);

-- 4. Customer Orders Table
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,       -- e.g. 'TS-4829'
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    mpesa_phone VARCHAR(20) NOT NULL, -- Phone number for STK Push
    delivery_method VARCHAR(50) NOT NULL, -- 'shop_pickup', 'nairobi_rider', 'upcountry_parcel'
    location_details TEXT,            -- Physical coordinates, shop stalls, bus terminals
    delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
    mpesa_receipt VARCHAR(50),        -- M-PESA unique ID e.g. 'MP_QR57WSTP'
    checkout_request_id VARCHAR(100), -- M-PESA gateway tracking ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Line Items (The absolute key for dynamic scent mapping!)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    variant_id INT REFERENCES product_variants(id), -- links size e.g. '250ml'
    selected_scent_id VARCHAR(50) REFERENCES scents(id), -- Maps wholesale oil selections dynamically!
    quantity INT NOT NULL DEFAULT 1,
    price_each NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- Insert Sample Data
INSERT INTO scents (id, name, profile, notes, popularity) VALUES
('black-vanilla', 'Black Vanilla', 'Sweet & Warm', 'Vanilla Bean, Amber, Caramel', 98),
('pink-chiffon', 'Pink Chiffon', 'Floral & Fruity', 'Wild Berries, Peach Nectar, Rose', 94);

INSERT INTO products (id, name, category, description, image_url, badge) VALUES
('oil_wholesale', 'Grade 1 Perfume Oil (Wholesale)', 'oil_wholesale', 'Undiluted grade 1 fragrance oil', 'perfume_oil.png', 'Pure Import');

INSERT INTO product_variants (product_id, size_label, price) VALUES
('oil_wholesale', '250ml', 1700.00),
('oil_wholesale', '500ml', 3200.00),
('oil_wholesale', '1 Litre', 6000.00);
`;

  const jsonCode = `{
  "orderId": "TS-7384",
  "customer": {
    "name": "Jane Wanjiku",
    "phone": "0712345678",
    "mpesaPhone": "254712345678"
  },
  "delivery": {
    "method": "upcountry_parcel",
    "details": "Easy Coach Parcel Office, Eldoret Town",
    "cost": 500
  },
  "items": [
    {
      "productId": "oil_wholesale",
      "name": "Grade 1 Perfume Oil (Wholesale)",
      "category": "oil_wholesale",
      "selectedSize": "500ml",
      "selectedScent": "Pink Chiffon",
      "quantity": 1,
      "priceEach": 3200,
      "totalPrice": 3200
    },
    {
      "productId": "rollon-6ml",
      "name": "6ml Glass Roll-On Bottles (Per Dozen)",
      "category": "accessory",
      "selectedSize": "1 Dozen",
      "quantity": 2,
      "priceEach": 130,
      "totalPrice": 260
    }
  ],
  "totalAmount": 3960,
  "payment": {
    "status": "paid",
    "mpesaReceipt": "MP_W3T67A99",
    "checkoutRequestId": "ws_CO_829103"
  }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 lg:p-8" id="db-schema-explorer">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2 rounded bg-yellow-500/10 text-yellow-500">
          <Database size={22} />
        </span>
        <div>
          <h3 className="text-xl font-bold font-display text-white tracking-tight">
            Database Schema & Architecture
          </h3>
          <p className="text-zinc-400 text-xs mt-0.5">
            Architected specifically to resolve dynamic bulk scent combinations and flat-rate retail variants.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("erd")}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider font-display border-b-2 transition cursor-pointer ${
            activeTab === "erd"
              ? "border-yellow-500 text-yellow-500"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Entity Relationship ERD
        </button>
        <button
          onClick={() => setActiveTab("sql")}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider font-display border-b-2 transition cursor-pointer ${
            activeTab === "sql"
              ? "border-yellow-500 text-yellow-500"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          PostgreSQL DDL
        </button>
        <button
          onClick={() => setActiveTab("json")}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider font-display border-b-2 transition cursor-pointer ${
            activeTab === "json"
              ? "border-yellow-500 text-yellow-500"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          JSON Order Payload
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "erd" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Table 1: SCENTS */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs mb-3 border-b border-zinc-800 pb-2">
                <Layers size={14} /> scents
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-zinc-300">
                <li className="flex justify-between">
                  <span className="text-yellow-500/90">🔑 id [PK]</span>
                  <span className="text-zinc-500">VARCHAR</span>
                </li>
                <li className="flex justify-between">
                  <span>name</span>
                  <span className="text-zinc-500">VARCHAR</span>
                </li>
                <li className="flex justify-between">
                  <span>profile</span>
                  <span className="text-zinc-500">VARCHAR</span>
                </li>
                <li className="flex justify-between">
                  <span>notes</span>
                  <span className="text-zinc-500">TEXT</span>
                </li>
                <li className="flex justify-between">
                  <span>popularity</span>
                  <span className="text-zinc-500">INT</span>
                </li>
              </ul>
              <p className="text-[10px] text-zinc-500 italic mt-3">
                Stores scents (e.g. 'Black Vanilla') separately so clients can select any scent for wholesale oils.
              </p>
            </div>

            {/* Table 2: PRODUCT_VARIANTS */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs mb-3 border-b border-zinc-800 pb-2">
                <Layers size={14} /> product_variants
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-zinc-300">
                <li className="flex justify-between">
                  <span className="text-yellow-500/90">🔑 id [PK]</span>
                  <span className="text-zinc-500">INT</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-blue-400">🔗 product_id [FK]</span>
                  <span className="text-zinc-500">VARCHAR</span>
                </li>
                <li className="flex justify-between">
                  <span>size_label</span>
                  <span className="text-zinc-500">VARCHAR</span>
                </li>
                <li className="flex justify-between">
                  <span>price</span>
                  <span className="text-zinc-500">NUMERIC</span>
                </li>
              </ul>
              <p className="text-[10px] text-zinc-500 italic mt-3">
                Maps product volumes to KES prices (e.g. wholesale oil variant '250ml' is KES 1700).
              </p>
            </div>

            {/* Table 3: ORDER_ITEMS */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xs mb-3 border-b border-zinc-800 pb-2">
                <Layers size={14} /> order_items
              </div>
              <ul className="space-y-1.5 text-[11px] font-mono text-zinc-300">
                <li className="flex justify-between">
                  <span className="text-yellow-500/90">🔑 id [PK]</span>
                  <span className="text-zinc-500">INT</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-blue-400">🔗 order_id [FK]</span>
                  <span className="text-zinc-500">VARCHAR</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-blue-400">🔗 variant_id [FK]</span>
                  <span className="text-zinc-500">INT</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-blue-400">🔗 selected_scent_id [FK]</span>
                  <span className="text-zinc-500">VARCHAR</span>
                </li>
                <li className="flex justify-between">
                  <span>quantity</span>
                  <span className="text-zinc-500">INT</span>
                </li>
              </ul>
              <p className="text-[10px] text-zinc-500 italic mt-3">
                The junction table. Storing size AND scent references separately enables unlimited bulk options!
              </p>
            </div>
          </div>

          {/* Explanation banner */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-display">
              Why this architecture is optimized for Tigint Scents
            </h4>
            <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1.5">
              <li>
                <strong>Unlimited Scent Combinations:</strong> Rather than hardcoding 100 separate items (e.g. '250ml Black Vanilla', '500ml Black Vanilla'), the platform links a core product item ('Grade 1 Perfume Oil') to specific price tiers, and attaches any scent from the catalog dynamically in the line items.
              </li>
              <li>
                <strong>Fast Mobile Checkout:</strong> Delivery addresses are stored cleanly in the parent <code className="text-yellow-500 font-mono text-[11px]">orders</code> table. No complex user account required; checkout simply captures M-PESA STK Push phone numbers and regional dispatch information.
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "sql" && (
        <div className="relative">
          <button
            onClick={() => copyToClipboard(sqlCode)}
            className="absolute right-4 top-4 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-green-400" /> Copied!
              </>
            ) : (
              <>
                <Copy size={13} /> Copy DDL SQL
              </>
            )}
          </button>
          <pre className="bg-zinc-900/60 text-zinc-300 p-4 rounded-xl text-[10.5px] font-mono overflow-x-auto border border-zinc-800 max-h-96 leading-relaxed">
            {sqlCode}
          </pre>
        </div>
      )}

      {activeTab === "json" && (
        <div className="relative">
          <button
            onClick={() => copyToClipboard(jsonCode)}
            className="absolute right-4 top-4 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={13} className="text-green-400" /> Copied!
              </>
            ) : (
              <>
                <Copy size={13} /> Copy JSON
              </>
            )}
          </button>
          <pre className="bg-zinc-900/60 text-zinc-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-zinc-800 max-h-96 leading-relaxed">
            {jsonCode}
          </pre>
        </div>
      )}
    </div>
  );
}
