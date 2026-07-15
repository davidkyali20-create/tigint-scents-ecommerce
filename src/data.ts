import { ScentOption, Product } from "./types";

export const SCENT_CATALOG: ScentOption[] = [
  {
    id: "black-vanilla",
    name: "Black Vanilla",
    profile: "Sweet & Warm",
    popularity: 98,
    notes: "Vanilla Bean, Warm Amber, Caramel, Soft Sandalwood"
  },
  {
    id: "pink-chiffon",
    name: "Pink Chiffon",
    profile: "Floral & Fruity Sweet",
    popularity: 94,
    notes: "Wild Berries, Peach Nectar, Soft Rose, Whipped Vanilla"
  },
  {
    id: "ferrari-blue",
    name: "Ferrari Blue",
    profile: "Fresh, Sporty & Masculine",
    popularity: 92,
    notes: "Bergamot, Fresh Mint, Juniper, Blue Cedar wood"
  },
  {
    id: "pearl",
    name: "Pearl",
    profile: "Soft, Clean & Powdery",
    popularity: 88,
    notes: "White Lily, Cotton Blossom, Baby Powder, Soft White Musk"
  },
  {
    id: "velvet-musk",
    name: "Velvet Musk",
    profile: "Deep, Exotic & Musky",
    popularity: 90,
    notes: "Royal Oud, Black Musk, Patchouli, Damask Rose"
  },
  {
    id: "coco-mademoiselle",
    name: "Coco Mademoiselle",
    profile: "Sophisticated & Elegant Lady",
    popularity: 91,
    notes: "Orange, Jasmine, Rose, Patchouli, Vetiver"
  },
  {
    id: "sauvage",
    name: "Sauvage",
    profile: "Powerful & Intense Masculine",
    popularity: 96,
    notes: "Calabrian Bergamot, Sichuan Pepper, Lavender, Ambroxan"
  },
  {
    id: "baccarat-rouge-540",
    name: "Baccarat Rouge 540",
    profile: "Luxurious & Sweet Woody",
    popularity: 95,
    notes: "Saffron, Jasmine, Amberwood, Ambergris, Fir Resin"
  }
];

export const PRODUCTS: Product[] = [
  {
    id: "oil_wholesale",
    name: "Grade 1 Oil-Based Perfume Oil (Wholesale)",
    category: "oil_wholesale",
    description: "Purely undiluted grade 1 fragrance oil imported directly from France & Germany. High concentration for up to 48-hour longevity. Perfect for personal luxury, custom decants, or perfume resellers.",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=600",
    badge: "100% Pure Import",
    sizes: [
      { size: "250ml", price: 1700 },
      { size: "500ml", price: 3200 },
      { size: "1 Litre", price: 6000 }
    ]
  },
  // Designer & Branded Perfumes
  {
    id: "mayar-30ml",
    name: "Mayar EDP (30ml Spray)",
    category: "retail_spray",
    description: "A delightful fruity-floral fragrance showcasing fresh lychee, raspberry, white flowers, and light vanilla notes. Beautiful mini presentation box.",
    price: 150,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    badge: "Wholesale Price Retailing"
  },
  {
    id: "gissah-one-only",
    name: "Gissah One & Only EDP (30ml Spray)",
    category: "retail_spray",
    description: "A premium Arabian luxury spray offering deep oud and rich patchouli blended with sweet amber and vanilla. Extremely high longevity.",
    price: 150,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    badge: "Bestselling Mini"
  },
  {
    id: "her-confession",
    name: "Her Confession by Lattafa (100ml)",
    category: "retail_spray",
    description: "A bold statement of femininity. A captivating blend that speaks of elegance, mystery, and confident attraction. Special wholesale campaign.",
    price: 1500,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
    badge: "Mega Promo Offer"
  },
  {
    id: "lacoste-essential",
    name: "Lacoste Essential (Mamba Edition, 125ml)",
    category: "retail_spray",
    description: "Feel fresh and irresistible with the Mamba Edition. A crisp, woody, and aromatic fragrance that keeps you confident all day long.",
    price: 1000,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
    badge: "Mamba Edition"
  },
  // Bottles & Accessories
  {
    id: "rollon-3ml",
    name: "3ml Glass Roll-On Bottles (Per Dozen)",
    category: "accessory",
    description: "Leak-proof glass roll-on vials with gold caps. Pocket friendly and perfect for distributing custom 3ml oil perfume blends.",
    price: 120,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
    badge: "Wholesale Pack"
  },
  {
    id: "rollon-6ml",
    name: "6ml Glass Roll-On Bottles (Per Dozen)",
    category: "accessory",
    description: "Durable clear glass roll-on vials with elegant metallic caps. The perfect container size for your KES 10,000 Starter Pack oil business.",
    price: 130,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
    badge: "Most Popular"
  },
  {
    id: "fancy-bottle-apple",
    name: "Apple-Shape Fancy Glass Refillable Bottle (Each)",
    category: "accessory",
    description: "Sleek, apple-contoured refillable bottle with high-shine gold spray pump. Highly attractive for dressers and luxury gift sets.",
    price: 35,
    image: "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600",
    badge: "Ksh 35 Only"
  },
  {
    id: "fancy-bottle-crown",
    name: "Royal Crown Glass Display Bottle (Each)",
    category: "accessory",
    description: "Exquisite crown-shaped decorative display bottle. Perfect for premium decants of 15ml-30ml.",
    price: 75,
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
    badge: "Premium Glass"
  },
  {
    id: "fancy-bottle-crystal",
    name: "Diamond Facet Premium Decanter Bottle (Each)",
    category: "accessory",
    description: "Ultra-luxurious, heavy crystal-cut glass decanter bottle with multi-angled facets. Reflects light beautifully.",
    price: 150,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    badge: "Elite Elegance"
  }
];

export const DELIVERY_OPTIONS = [
  {
    id: "shop_pickup",
    label: "Pick up at Nairobi CBD Shop 102",
    description: "First Floor Shop 102, Junction Stalls building (Junction between Dubois Road & Latema Road)",
    cost: 0
  },
  {
    id: "nairobi_rider",
    label: "Nairobi Rider Delivery",
    description: "Direct motorcycle courier to your doorstep within Nairobi",
    cost: 300
  },
  {
    id: "upcountry_parcel",
    label: "Upcountry Bus/Shuttle Parcel",
    description: "Sent via reliable regional shuttle/bus parcel services (e.g. Easy Coach, Guardian, North Rift)",
    cost: 500
  }
];
