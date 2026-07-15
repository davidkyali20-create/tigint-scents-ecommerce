export interface ScentOption {
  id: string;
  name: string;
  profile: string; // e.g. "Sweet/Warm", "Floral/Fresh", "Fresh/Sporty", "Musky/Elegant"
  popularity: number; // percentage or scale
  notes: string; // e.g. "Vanilla, Amber", "Bergamot, Jasmine"
}

export interface Product {
  id: string;
  name: string;
  category: "oil_wholesale" | "retail_spray" | "accessory";
  description: string;
  price?: number; // Null for wholesale oil (calculated by size)
  image: string;
  badge?: string;
  isAvailable?: boolean;
  sizes?: {
    size: string;
    price: number;
  }[];
}

export interface CartItem {
  id: string; // Unique cart item ID (combines product ID + scent + size if applicable)
  productId: string;
  name: string;
  category: "oil_wholesale" | "retail_spray" | "accessory";
  selectedScent?: string;
  selectedSize?: string;
  quantity: number;
  priceEach: number;
  totalPrice: number;
  image: string;
}

export type DeliveryMethod = "shop_pickup" | "nairobi_rider" | "upcountry_parcel";

export interface DeliveryDetails {
  method: DeliveryMethod;
  name: string;
  phone: string;
  mpesaPhone: string;
  locationDetails: string; // For rider/upcountry
  cost: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  delivery: DeliveryDetails;
  totalAmount: number;
  paymentStatus: "pending" | "processing" | "paid" | "failed";
  mpesaReceipt?: string;
  createdAt: string;
}

export interface APIPayRequest {
  phone: string;
  amount: number;
  deliveryMethod: DeliveryMethod;
  locationDetails: string;
  items: Omit<CartItem, "image">[];
}

export interface APIPayResponse {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
  orderId?: string;
}

export interface AISuggestionResponse {
  recommendedScents: {
    scentName: string;
    reason: string;
    suggestedQty: number; // portions of starter package
  }[];
  marketingAdvice: string;
  projectedProfit: string;
}
