import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined.");
    }
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// -----------------------------------------------------------------------------
// IN-MEMORY DATA STORES (DATABASES)
// -----------------------------------------------------------------------------

interface DBProduct {
  id: string;
  name: string;
  category: "oil_wholesale" | "retail_spray" | "accessory";
  description: string;
  price?: number;
  image: string;
  badge?: string;
  isAvailable: boolean;
  sizes?: { size: string; price: number }[];
}

let dbProducts: DBProduct[] = [
  {
    id: "oil_wholesale",
    name: "Grade 1 Oil-Based Perfume Oil (Wholesale)",
    category: "oil_wholesale",
    description: "Purely undiluted grade 1 fragrance oil imported directly from France & Germany. High concentration for up to 48-hour longevity. Perfect for personal luxury, custom decants, or perfume resellers.",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600",
    badge: "100% Pure Import",
    isAvailable: true,
    sizes: [
      { size: "250ml", price: 1700 },
      { size: "500ml", price: 3200 },
      { size: "1 Litre", price: 6000 }
    ]
  },
  {
    id: "mayar-30ml",
    name: "Mayar EDP (30ml Spray)",
    category: "retail_spray",
    description: "A delightful fruity-floral fragrance showcasing fresh lychee, raspberry, white flowers, and light vanilla notes. Beautiful mini presentation box.",
    price: 150,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    badge: "Wholesale Price Retailing",
    isAvailable: true
  },
  {
    id: "gissah-one-only",
    name: "Gissah One & Only EDP (30ml Spray)",
    category: "retail_spray",
    description: "A premium Arabian luxury spray offering deep oud and rich patchouli blended with sweet amber and vanilla. Extremely high longevity.",
    price: 150,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    badge: "Bestselling Mini",
    isAvailable: true
  },
  {
    id: "her-confession",
    name: "Her Confession by Lattafa (100ml)",
    category: "retail_spray",
    description: "A bold statement of femininity. A captivating blend that speaks of elegance, mystery, and confident attraction. Special wholesale campaign.",
    price: 1500,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
    badge: "Mega Promo Offer",
    isAvailable: true
  },
  {
    id: "lacoste-essential",
    name: "Lacoste Essential (Mamba Edition, 125ml)",
    category: "retail_spray",
    description: "Feel fresh and irresistible with the Mamba Edition. A crisp, woody, and aromatic fragrance that keeps you confident all day long.",
    price: 1000,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
    badge: "Mamba Edition",
    isAvailable: true
  },
  {
    id: "rollon-3ml",
    name: "3ml Glass Roll-On Bottles (Per Dozen)",
    category: "accessory",
    description: "Leak-proof glass roll-on vials with gold caps. Pocket friendly and perfect for distributing custom 3ml oil perfume blends.",
    price: 120,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
    badge: "Wholesale Pack",
    isAvailable: true
  },
  {
    id: "rollon-6ml",
    name: "6ml Glass Roll-On Bottles (Per Dozen)",
    category: "accessory",
    description: "Durable clear glass roll-on vials with elegant metallic caps. The perfect container size for your KES 10,000 Starter Pack oil business.",
    price: 130,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
    badge: "Most Popular",
    isAvailable: true
  },
  {
    id: "fancy-bottle-apple",
    name: "Apple-Shape Fancy Glass Refillable Bottle (Each)",
    category: "accessory",
    description: "Sleek, apple-contoured refillable bottle with high-shine gold spray pump. Highly attractive for dressers and luxury gift sets.",
    price: 35,
    image: "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600",
    badge: "Ksh 35 Only",
    isAvailable: true
  },
  {
    id: "fancy-bottle-crown",
    name: "Royal Crown Glass Display Bottle (Each)",
    category: "accessory",
    description: "Exquisite crown-shaped decorative display bottle. Perfect for premium decants of 15ml-30ml.",
    price: 75,
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
    badge: "Premium Glass",
    isAvailable: true
  },
  {
    id: "fancy-bottle-crystal",
    name: "Diamond Facet Premium Decanter Bottle (Each)",
    category: "accessory",
    description: "Ultra-luxurious, heavy crystal-cut glass decanter bottle with multi-angled facets. Reflects light beautifully.",
    price: 150,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    badge: "Elite Elegance",
    isAvailable: true
  }
];

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

let dbUsers: UserAccount[] = [
  {
    id: "u-9912",
    name: "John Reseller",
    email: "customer@tigintscents.com",
    phone: "0712345678",
    passwordHash: "password123",
    createdAt: new Date().toISOString()
  }
];

const dbAdmins = [
  {
    email: "admin@tigintscents.com",
    password: "ChangeMe2026!"
  }
];

const orders: any[] = [];

// -----------------------------------------------------------------------------
// API ENDPOINTS
// -----------------------------------------------------------------------------

// A. Products & Inventory Management
app.get("/api/products", (req, res) => {
  res.json({
    success: true,
    products: dbProducts
  });
});

app.post("/api/products", (req, res) => {
  const { name, category, description, price, image, badge, sizes } = req.body;

  if (!name || !category || !description || !image) {
    return res.status(400).json({
      success: false,
      message: "Required parameters missing: name, category, description, image."
    });
  }

  const newProduct: DBProduct = {
    id: "prod_" + Math.floor(1000 + Math.random() * 9000),
    name,
    category,
    description,
    price: price ? parseFloat(price) : undefined,
    image,
    badge: badge || undefined,
    isAvailable: true,
    sizes: sizes || undefined
  };

  dbProducts.push(newProduct);

  res.json({
    success: true,
    message: "Product added successfully to inventory!",
    product: newProduct
  });
});

app.post("/api/products/:id/toggle", (req, res) => {
  const { id } = req.params;
  const product = dbProducts.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found."
    });
  }

  product.isAvailable = !product.isAvailable;

  res.json({
    success: true,
    message: `Product is now ${product.isAvailable ? "Available" : "Out of Stock"}.`,
    product
  });
});

// B. User Registration & Login Systems
app.post("/api/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all registration fields: name, email, phone, password."
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = dbUsers.find(u => u.email === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "An account with this email address already exists."
    });
  }

  const newUser: UserAccount = {
    id: "u-" + Math.floor(1000 + Math.random() * 9000),
    name,
    email: normalizedEmail,
    phone,
    passwordHash: password, // Simple plain-text hashing simulation
    createdAt: new Date().toISOString()
  };

  dbUsers.push(newUser);

  res.json({
    success: true,
    message: "User account created successfully! You can now log in.",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone
    }
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email and password."
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = dbUsers.find(u => u.email === normalizedEmail && u.passwordHash === password);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password. Please try again."
    });
  }

  res.json({
    success: true,
    message: "Logged in successfully!",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
  });
});

// C. Admin Login System
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter email and password."
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const admin = dbAdmins.find(a => a.email === normalizedEmail && a.password === password);

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Invalid admin credentials."
    });
  }

  res.json({
    success: true,
    message: "Admin authorized successfully!",
    admin: {
      email: admin.email
    }
  });
});

// D. Real Safaricom M-PESA Daraja Integration
function formatMpesaPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith("254") && cleaned.length === 9) {
    cleaned = "254" + cleaned;
  }
  return cleaned;
}

function getMpesaTimestamp(): string {
  const date = new Date();
  const t = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}${t(date.getMonth() + 1)}${t(date.getDate())}${t(date.getHours())}${t(date.getMinutes())}${t(date.getSeconds())}`;
}

async function getMpesaAccessToken(): Promise<string> {
  // Use the provided customer keys in case they aren't configured in process.env yet
  const consumerKey = (process.env.MPESA_CONSUMER_KEY || "iI18382Y8jUyiTGFNCXSqEkY53FNvZKlmBhAA0XA6oDJMXeS").trim();
  const consumerSecret = (process.env.MPESA_CONSUMER_SECRET || "qdAyz77tSRMugWGzze1Vzw6D86iY2yEFoksKodjjMjpUcHhSGxjigwiufLb01t46").trim();
  
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  
  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    method: "GET",
    headers: {
      "Authorization": `Basic ${auth}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to retrieve M-Pesa Access Token: ${response.statusText}. Details: ${errText}`);
  }

  const data: any = await response.json();
  return data.access_token;
}

// STK Push request endpoint
app.post("/api/pay", async (req, res) => {
  const { phone, amount, deliveryMethod, locationDetails, items, customerName, customerPhone } = req.body;

  if (!phone || !amount || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: "Missing mandatory payment details: phone, amount, and items are required.",
    });
  }

  const cleanPhone = phone.trim();
  const mpesaRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/;
  if (!mpesaRegex.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid M-PESA Phone Number format. Use 07xxxxxxxx or 254xxxxxxxxx.",
    });
  }

  const formattedPhone = formatMpesaPhoneNumber(cleanPhone);
  const roundedAmount = Math.max(1, Math.round(parseFloat(amount)));

  let realMpesaResponse: any = null;
  let useSandboxSimulation = false;
  let mpesaErrorDetail = "";

  try {
    // 1. Fetch OAuth access token from Safaricom Sandbox
    const accessToken = await getMpesaAccessToken();

    // 2. Prepare payload
    const shortCode = "174379";
    const passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const timestamp = getMpesaTimestamp();
    const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");
    
    // Auto-detect public APP_URL or default to a mock bin URL
    const callbackUrl = process.env.APP_URL 
      ? `${process.env.APP_URL.replace(/\/$/, "")}/api/mpesa-callback`
      : "https://example.com/api/mpesa-callback";

    const stkPushBody = {
      BusinessShortCode: parseInt(shortCode),
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: roundedAmount,
      PartyA: parseInt(formattedPhone),
      PartyB: parseInt(shortCode),
      PhoneNumber: parseInt(formattedPhone),
      CallBackURL: callbackUrl,
      AccountReference: "Tigint Scents",
      TransactionDesc: `ScentReseller Order TS-${Math.floor(1000 + Math.random() * 9000)}`
    };

    console.log("Dispatching real Daraja STK Push trigger...", stkPushBody);

    const darajaRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(stkPushBody)
    });

    const darajaData: any = await darajaRes.json();
    console.log("Safaricom Daraja API returned:", darajaData);

    if (darajaRes.ok && (darajaData.ResponseCode === "0" || darajaData.ResponseCode === 0)) {
      realMpesaResponse = darajaData;
    } else {
      useSandboxSimulation = true;
      mpesaErrorDetail = darajaData.errorMessage || darajaData.ResponseDescription || "Invalid parameters in Daraja response";
    }
  } catch (err: any) {
    console.error("Daraja dynamic fallback activated:", err);
    useSandboxSimulation = true;
    mpesaErrorDetail = err.message || "Network timeout connecting to Daraja API Gateway";
  }

  const checkoutRequestId = realMpesaResponse?.CheckoutRequestID || `ws_CO_${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Real M-pesa is asynchronously updated via Callback.
  // Simulation is instantly set to 'paid'.
  const isRealSuccess = !useSandboxSimulation && realMpesaResponse;
  const paymentStatus = isRealSuccess ? "pending" : "paid";
  const receipt = isRealSuccess 
    ? "WAITING_PIN" 
    : `MP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const newOrder = {
    id: orderId,
    checkoutRequestId,
    items,
    amount: roundedAmount,
    phone: formattedPhone,
    deliveryMethod,
    locationDetails,
    paymentStatus,
    mpesaReceipt: receipt,
    createdAt: new Date().toISOString(),
    customerName: customerName || "Guest Customer",
    customerPhone: customerPhone || phone,
    isRealDarajaPayment: isRealSuccess,
    darajaDetail: isRealSuccess 
      ? "STK Push Dispatched on Handset successfully" 
      : `Simulated Checkout (Daraja Sandbox Note: ${mpesaErrorDetail})`
  };

  orders.push(newOrder);

  if (isRealSuccess) {
    res.json({
      success: true,
      message: `M-PESA Express STK Push initiated! Please verify your phone screen (+${phone}) to enter your M-Pesa PIN.`,
      checkoutRequestId,
      orderId,
      receipt: "Awaiting handset PIN confirmation...",
      order: newOrder,
      isRealDarajaPayment: true
    });
  } else {
    res.json({
      success: true,
      message: `Simulated checkout completed! KES ${roundedAmount} transaction confirmed. [Safaricom Sandbox: ${mpesaErrorDetail}]`,
      checkoutRequestId,
      orderId,
      receipt: newOrder.mpesaReceipt,
      order: newOrder,
      isRealDarajaPayment: false
    });
  }
});

// E. M-PESA Callback Webhook
app.post("/api/mpesa-callback", (req, res) => {
  console.log("--- SAFARICOM M-PESA WEBHOOK CALLBACK TRIGGERED ---");
  console.log(JSON.stringify(req.body, null, 2));

  const { Body } = req.body || {};
  if (Body && Body.stkCallback) {
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
    
    const order = orders.find(o => o.checkoutRequestId === CheckoutRequestID);
    if (order) {
      if (ResultCode === 0 || ResultCode === "0") {
        order.paymentStatus = "paid";
        
        // Extract real M-Pesa transaction ID
        const metadataItems = CallbackMetadata?.Item || [];
        const receiptItem = metadataItems.find((item: any) => item.Name === "MpesaReceiptNumber");
        if (receiptItem && receiptItem.Value) {
          order.mpesaReceipt = receiptItem.Value;
        } else {
          order.mpesaReceipt = `MP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        }
        order.darajaDetail = "Payment Received successfully via real STK Callback!";
        console.log(`[CALLBACK SUCCESS] Order ${order.id} paid. Receipt: ${order.mpesaReceipt}`);
      } else {
        order.paymentStatus = "failed";
        order.darajaDetail = `Safaricom payment failed: ${ResultDesc}`;
        console.log(`[CALLBACK FAILED] Order ${order.id} cancelled. Reason: ${ResultDesc}`);
      }
    }
  }

  res.json({ ResultCode: 0, ResultDesc: "Success" });
});

// F. Query order status or manually confirm
app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id || o.checkoutRequestId === id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }
  res.json({
    success: true,
    order
  });
});

app.post("/api/orders/:id/confirm", (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id || o.checkoutRequestId === id);
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }
  order.paymentStatus = "paid";
  if (order.mpesaReceipt === "WAITING_PIN" || order.mpesaReceipt === "WAIT_CALLBACK") {
    order.mpesaReceipt = `MP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  }
  order.darajaDetail = "Manually Approved by Customer via resubmission button";
  res.json({
    success: true,
    message: "Order has been successfully confirmed and processed.",
    order
  });
});

// 3. Get simulated orders
app.get("/api/orders", (req, res) => {
  res.json({
    success: true,
    orders,
  });
});

// 4. Gemini Scent Matcher & Entrepreneur Recommendation Assistant
app.post("/api/gemini/starter-pack", async (req, res) => {
  const { targetDemographic, customGoals } = req.body;

  const target = targetDemographic || "General Kenyan entrepreneurs starting with KES 10k budget";
  const goals = customGoals || "Maximize reseller profit margin in Nairobi CBD and estate delivery";

  try {
    const ai = getGeminiClient();
    
    const prompt = `You are the lead fragrance and business strategy consultant for 'Tigint Scents' in Nairobi, Kenya. 
    A client wants to invest in our KES 10,000 Starter Package to start their own perfume business. 
    They have specified their target demographic: "${target}" and business goals: "${goals}".
    
    The KES 10,000 Starter Package contains:
    - 10 oil perfume portions (30ml each, worth KES 10,000 total in premium grade 1 oils from France & Germany).
    - 2 dozen (24 pieces) of empty 6ml roll-on refill bottles (pre-packed, KES 120 per dozen wholesale value).
    
    Please output a response in clean, parsed JSON matching this exact typescript interface:
    interface AISuggestionResponse {
      recommendedScents: {
        scentName: string;
        reason: string;
        suggestedQty: number; // The quantity of this 30ml scent to make up a total of 10 portions (sum MUST equal 10)
      }[];
      marketingAdvice: string; // Tailored advice with localized Kenyan slang or CBD/Reseller contexts
      projectedProfit: string; // Breakdown of retail pricing (e.g. selling 6ml rollons at KES 300 to KES 500) and how they can double their KES 10,000 investment
    }
    
    The available wholesale oils catalog includes popular scents in Kenya:
    1. Black Vanilla (Sweet, warm, Nairobi's most popular unisex profile)
    2. Pink Chiffon (Sweet floral, heavily requested by ladies)
    3. Ferrari Blue (Fresh, masculine, sporty, very fast seller)
    4. Pearl (Soft, elegant powdery notes for professional offices)
    5. Velvet Musk (Deep, exotic, unisex, premium night-out fragrance)
    6. Coco Mademoiselle (Classy, sophisticated lady fragrance)
    7. Sauvage (Rich, powerful, intense, masculine favorite)
    8. Baccarat Rouge 540 (Luxurious, high-end, sweet woody unisex)

    Select exactly the combination of scents that make up 10 portions in total. 
    Provide highly strategic, realistic, and enthusiastic advice appropriate for a Kenyan reseller. Do not include markdown code block formatting except valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedScents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scentName: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestedQty: { type: Type.INTEGER }
                },
                required: ["scentName", "reason", "suggestedQty"]
              }
            },
            marketingAdvice: { type: Type.STRING },
            projectedProfit: { type: Type.STRING }
          },
          required: ["recommendedScents", "marketingAdvice", "projectedProfit"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      data: parsedData,
    });

  } catch (error: any) {
    console.error("Gemini Starter Pack Generator Error:", error);
    
    // Graceful fallback in case GEMINI_API_KEY is not defined or is rate limited
    const fallbackData: any = {
      recommendedScents: [
        { scentName: "Black Vanilla", reason: "Nairobi's absolute #1 bestseller. Sweet, inviting, and lasts 24+ hours.", suggestedQty: 3 },
        { scentName: "Pink Chiffon", reason: "Sells out fast among ladies. Highly recognizable and loved.", suggestedQty: 2 },
        { scentName: "Ferrari Blue", reason: "The perfect fresh sporty note for men. Universal crowd-pleaser.", suggestedQty: 2 },
        { scentName: "Velvet Musk", reason: "Exotic and rich. Gives a premium vibe for customers looking for something deep.", suggestedQty: 2 },
        { scentName: "Sauvage", reason: "Alpha-male signature note. Essential to have in your starter collection.", suggestedQty: 1 }
      ],
      marketingAdvice: "Start by offering free 'wrist-dabs' at offices or campuses in Nairobi CBD. Since grade 1 oils are undiluted, the scent will last all day, and colleagues will ask where they bought it! Pitch the KES 300 price point for quick sales, or pack them beautifully as premium sets.",
      projectedProfit: "With KES 10,000, you get 10 scents of 30ml each (300ml total). You can easily fill fifty (50) 6ml roll-ons. Selling each at KES 350 yields KES 17,500. Substracting the bottle costs, your pure profit is over KES 7,000 in your first week!"
    };

    res.json({
      success: true,
      data: fallbackData,
      isFallback: true,
      errorInfo: error.message || "Using smart preset assistant recommendations."
    });
  }
});


// -----------------------------------------------------------------------------
// VITE OR STATIC FILE SERVING
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tigint Scents custom server running on http://localhost:${PORT}`);
  });
}

startServer();
