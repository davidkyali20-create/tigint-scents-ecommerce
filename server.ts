import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for dynamic simulator state
const mockInventory: Record<string, { stock: number; price: number; name: string }> = {
  "black-vanilla": { stock: 120, price: 1700, name: "Black Vanilla (Wholesale Oil)" },
  "pink-chiffon": { stock: 85, price: 1700, name: "Pink Chiffon (Wholesale Oil)" },
  "ferrari-blue": { stock: 95, price: 1700, name: "Ferrari Blue (Wholesale Oil)" },
  "pearl": { stock: 60, price: 1700, name: "Pearl (Wholesale Oil)" },
  "velvet-musk": { stock: 75, price: 1700, name: "Velvet Musk (Wholesale Oil)" },
  "mayar-30ml": { stock: 200, price: 150, name: "Mayar EDP (30ml)" },
  "gissah-one-only": { stock: 150, price: 150, name: "Gissah One & Only (30ml)" },
  "her-confession": { stock: 45, price: 1500, name: "Her Confession by Lattafa" },
  "lacoste-essential": { stock: 35, price: 1000, name: "Lacoste Essential (Mamba Edition)" },
  "rollon-3ml": { stock: 500, price: 120, name: "3ml Roll-on Bottles (per dozen)" },
  "rollon-6ml": { stock: 400, price: 130, name: "6ml Roll-on Bottles (per dozen)" },
  "fancy-bottle": { stock: 250, price: 75, name: "Fancy Glass Display Bottle" },
};

const orders: any[] = [];

// Lazy load Gemini Client to prevent crashing if GEMINI_API_KEY is not defined
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in secrets/environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -----------------------------------------------------------------------------
// API ENDPOINTS
// -----------------------------------------------------------------------------

// 1. Get current inventory
app.get("/api/inventory", (req, res) => {
  res.json({
    success: true,
    inventory: mockInventory,
    timestamp: new Date().toISOString(),
  });
});

// 2. Simulate M-PESA STK Push checkout
app.post("/api/pay", (req, res) => {
  const { phone, amount, deliveryMethod, locationDetails, items } = req.body;

  if (!phone || !amount || !items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: "Missing mandatory payment details: phone, amount, and items are required.",
    });
  }

  // Basic M-PESA validation format (e.g., 2547XXXXXXXX or 07XXXXXXXX)
  const cleanPhone = phone.trim();
  const mpesaRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/;
  if (!mpesaRegex.test(cleanPhone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid M-PESA Phone Number format. Use 07xxxxxxxx or 254xxxxxxxxx.",
    });
  }

  // Process inventory deduction
  items.forEach((item: any) => {
    const invKey = item.productId;
    if (mockInventory[invKey]) {
      mockInventory[invKey].stock = Math.max(0, mockInventory[invKey].stock - item.quantity);
    }
  });

  // Create a mock order tracking ID
  const checkoutRequestId = `ws_CO_${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = `TS-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: orderId,
    checkoutRequestId,
    items,
    amount,
    phone,
    deliveryMethod,
    locationDetails,
    paymentStatus: "paid", // Instantly complete in simulation
    mpesaReceipt: `MP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);

  // Return success simulating STK Push validation and receipting
  res.json({
    success: true,
    message: `STK Push sent successfully to ${phone}. KES ${amount} transaction confirmed!`,
    checkoutRequestId,
    orderId,
    receipt: newOrder.mpesaReceipt,
    order: newOrder,
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
