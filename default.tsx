import { useState, useEffect, useRef } from "react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CreatorProfile {
  name: string;
  handle: string;
  specialty: string;
  avatar: string;
  verified: boolean;
}

interface ProductTag {
  name: string;
  brand: string;
  price: string;
  image: string;
}

interface Post {
  id: string;
  type: "tutorial" | "before-after" | "ugc" | "video" | "tip" | "article";
  creator: CreatorProfile;
  timestamp: string;
  image: string;
  imageAlt: string;
  portrait: boolean;
  caption: string;
  categories: string[];
  products?: ProductTag[];
  likes: number;
  comments: number;
  saves: number;
}

interface TrendItem {
  id: string;
  kind: "creator" | "brand" | "trend";
  label: string;
  sublabel: string;
  image: string;
  seen: boolean;
}

interface GridPost {
  id: string;
  image: string;
  alt: string;
  type: "photo" | "video" | "before-after" | "carousel";
  likes: number;
  comments: number;
  span?: "normal" | "wide";
}

interface Collection {
  id: string;
  name: string;
  cover: string;
  count: number;
  description: string;
}

interface Brand {
  name: string;
  image: string;
  category: string;
}

interface Badge {
  icon: string;
  label: string;
  color: string;
  bg: string;
}

// ─── PROFILE DATA ─────────────────────────────────────────────────────────────

const profileData = {
  name: "Anika Lee",
  handle: "@anika.glows",
  verified: true,
  specialties: ["Skincare Educator", "Clean Beauty", "Wellness"],
  bio: "✨ Evidence-based skincare & clean beauty advocate. Former licensed esthetician turned full-time educator. Sharing routines that actually work — no fluff, no filler 🌿 #GlassySkin",
  location: "New York, NY",
  website: "anikaglows.com",
  avatar:
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=240&h=240&fit=crop&auto=format",
  cover:
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1400&h=420&fit=crop&auto=format",
  stats: {
    followers: 284300,
    following: 1240,
    posts: 847,
    saves: 12400,
    likes: 2800000,
  },
  isOwner: true,
};

const profileCollections: Collection[] = [
  {
    id: "c1",
    name: "Glass Skin Routine",
    cover:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=380&fit=crop&auto=format",
    count: 24,
    description: "AM & PM layering guide",
  },
  {
    id: "c2",
    name: "Everyday Makeup",
    cover:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=380&fit=crop&auto=format",
    count: 18,
    description: "Quick 5-minute looks",
  },
  {
    id: "c3",
    name: "Product Favorites",
    cover:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=380&fit=crop&auto=format",
    count: 56,
    description: "Tried & true staples",
  },
  {
    id: "c4",
    name: "Hair Transformations",
    cover:
      "https://images.unsplash.com/photo-1560066984-138daaa9a18d?w=300&h=380&fit=crop&auto=format",
    count: 12,
    description: "From damaged to glossy",
  },
  {
    id: "c5",
    name: "Tutorials",
    cover:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300&h=380&fit=crop&auto=format",
    count: 32,
    description: "Step-by-step guides",
  },
  {
    id: "c6",
    name: "Night Routines",
    cover:
      "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=300&h=380&fit=crop&auto=format",
    count: 15,
    description: "Restorative rituals",
  },
];

const favoriteBrands: Brand[] = [
  {
    name: "La Mer",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=140&h=140&fit=crop&auto=format",
    category: "Luxury Skincare",
  },
  {
    name: "Paula's Choice",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=140&h=140&fit=crop&auto=format",
    category: "Active Skincare",
  },
  {
    name: "The Ordinary",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=140&h=140&fit=crop&auto=format",
    category: "Affordable Science",
  },
  {
    name: "Tatcha",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=140&h=140&fit=crop&auto=format",
    category: "J-Beauty",
  },
  {
    name: "Drunk Elephant",
    image:
      "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=140&h=140&fit=crop&auto=format",
    category: "Clean Beauty",
  },
  {
    name: "Sunday Riley",
    image:
      "https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?w=140&h=140&fit=crop&auto=format",
    category: "Premium Actives",
  },
];

const achievements: Badge[] = [
  {
    icon: "✓",
    label: "Verified Creator",
    color: "#C4847A",
    bg: "rgba(196,132,122,0.10)",
  },
  {
    icon: "⭐",
    label: "Top Expert",
    color: "#C4A35A",
    bg: "rgba(196,163,90,0.10)",
  },
  {
    icon: "👥",
    label: "250K Community",
    color: "#527055",
    bg: "rgba(138,158,140,0.12)",
  },
  {
    icon: "🤝",
    label: "Brand Partner",
    color: "#5C4A8A",
    bg: "rgba(122,100,160,0.10)",
  },
  {
    icon: "❤️",
    label: "2.8M Appreciations",
    color: "#A0524A",
    bg: "rgba(196,132,122,0.08)",
  },
  {
    icon: "🏆",
    label: "2024 Rising Creator",
    color: "#8B7228",
    bg: "rgba(196,163,90,0.08)",
  },
];

const gridPosts: GridPost[] = [
  {
    id: "g1",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop&auto=format",
    alt: "Skincare product flatlay",
    type: "photo",
    likes: 4287,
    comments: 312,
  },
  {
    id: "g2",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop&auto=format",
    alt: "Glowing skin close-up",
    type: "photo",
    likes: 6821,
    comments: 441,
  },
  {
    id: "g3",
    image:
      "https://images.unsplash.com/photo-1583241800698-e8ab01830a22?w=600&h=600&fit=crop&auto=format",
    alt: "Eye makeup tutorial",
    type: "video",
    likes: 15670,
    comments: 1204,
  },
  {
    id: "g4",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop&auto=format",
    alt: "Natural makeup look",
    type: "photo",
    likes: 3291,
    comments: 187,
  },
  {
    id: "g5",
    image:
      "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=600&h=600&fit=crop&auto=format",
    alt: "Clean skincare routine",
    type: "before-after",
    likes: 8912,
    comments: 567,
  },
  {
    id: "g6",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=600&fit=crop&auto=format",
    alt: "Makeup portrait editorial",
    type: "carousel",
    likes: 5440,
    comments: 298,
  },
  {
    id: "g7",
    image:
      "https://images.unsplash.com/photo-1560066984-138daaa9a18d?w=600&h=600&fit=crop&auto=format",
    alt: "Hair styling tutorial",
    type: "video",
    likes: 22405,
    comments: 2891,
  },
  {
    id: "g8",
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop&auto=format",
    alt: "Product haul flatlay",
    type: "photo",
    likes: 2134,
    comments: 89,
  },
  {
    id: "g9",
    image:
      "https://images.unsplash.com/photo-1567721913486-6585f069b3bb?w=600&h=600&fit=crop&auto=format",
    alt: "Editorial beauty portrait",
    type: "photo",
    likes: 9876,
    comments: 634,
  },
  {
    id: "g10",
    image:
      "https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=600&h=600&fit=crop&auto=format",
    alt: "Wellness morning routine",
    type: "carousel",
    likes: 3782,
    comments: 210,
  },
  {
    id: "g11",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop&auto=format",
    alt: "Luxury skincare haul",
    type: "photo",
    likes: 7234,
    comments: 512,
  },
  {
    id: "g12",
    image:
      "https://images.unsplash.com/photo-1569913486515-b74bf7751574?w=600&h=600&fit=crop&auto=format",
    alt: "Dewy summer skin look",
    type: "before-after",
    likes: 11203,
    comments: 879,
  },
];

const profileSuggestedCreators = [
  {
    name: "Jenna Wells",
    handle: "jenna.wellness",
    specialty: "Holistic Beauty",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format",
    verified: true,
  },
  {
    name: "Marcus Okafor",
    handle: "marcusmua",
    specialty: "Makeup Artist",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    verified: true,
  },
  {
    name: "Clara Voss",
    handle: "clara.nails",
    specialty: "Nail Artist",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&auto=format",
    verified: false,
  },
];

const recentlyViewed = [
  {
    name: "Protini Polypeptide Cream",
    brand: "Drunk Elephant",
    price: "$68",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=80&h=80&fit=crop&auto=format",
  },
  {
    name: "Barrier Repair Serum",
    brand: "Laneige",
    price: "$39",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&auto=format",
  },
  {
    name: "C-Firma Day Serum",
    brand: "Drunk Elephant",
    price: "$78",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=80&h=80&fit=crop&auto=format",
  },
];

// ─── HOME FEED DATA ───────────────────────────────────────────────────────────

const trends: TrendItem[] = [
  {
    id: "t1",
    kind: "creator",
    label: "Anika Lee",
    sublabel: "New",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&auto=format",
    seen: false,
  },
  {
    id: "t2",
    kind: "trend",
    label: "#GlassySkin",
    sublabel: "Trending",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=120&h=120&fit=crop&auto=format",
    seen: false,
  },
  {
    id: "t3",
    kind: "creator",
    label: "Mia Torres",
    sublabel: "New look",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&auto=format",
    seen: false,
  },
  {
    id: "t4",
    kind: "brand",
    label: "Glossier",
    sublabel: "New drop",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=120&h=120&fit=crop&auto=format",
    seen: true,
  },
  {
    id: "t5",
    kind: "creator",
    label: "Sofia Chen",
    sublabel: "Tutorial",
    image:
      "https://images.unsplash.com/photo-1569913486515-b74bf7751574?w=120&h=120&fit=crop&auto=format",
    seen: true,
  },
  {
    id: "t6",
    kind: "trend",
    label: "#CleanBeauty",
    sublabel: "1.2M posts",
    image:
      "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=120&h=120&fit=crop&auto=format",
    seen: false,
  },
  {
    id: "t7",
    kind: "creator",
    label: "Priya Malik",
    sublabel: "New",
    image:
      "https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=120&h=120&fit=crop&auto=format",
    seen: false,
  },
  {
    id: "t8",
    kind: "brand",
    label: "La Mer",
    sublabel: "Event",
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=120&h=120&fit=crop&auto=format",
    seen: true,
  },
];

const feedPosts: Post[] = [
  {
    id: "p1",
    type: "tutorial",
    creator: {
      name: "Anika Lee",
      handle: "anika.glows",
      specialty: "Skincare Educator",
      avatar:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
      verified: true,
    },
    timestamp: "2h ago",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop&auto=format",
    imageAlt:
      "Skincare products layered on a marble surface showing AM routine order",
    portrait: true,
    caption:
      "Your complete guide to layering actives without irritation ✨ The order you apply your skincare matters more than you think. Niacinamide before vitamin C? Not anymore — here's exactly how I build my AM routine.",
    categories: ["Skincare", "Tutorial"],
    products: [
      {
        name: "Vitamin C Serum",
        brand: "Paula's Choice",
        price: "$42",
        image:
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=80&h=80&fit=crop&auto=format",
      },
      {
        name: "10% Niacinamide",
        brand: "The Ordinary",
        price: "$12",
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=80&h=80&fit=crop&auto=format",
      },
    ],
    likes: 4287,
    comments: 312,
    saves: 1840,
  },
  {
    id: "p2",
    type: "before-after",
    creator: {
      name: "Mia Torres",
      handle: "mia.beauty",
      specialty: "Makeup Artist",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&auto=format",
      verified: true,
    },
    timestamp: "4h ago",
    image:
      "https://images.unsplash.com/photo-1583241800698-e8ab01830a22?w=800&h=600&fit=crop&auto=format",
    imageAlt: "Dramatic eye makeup transformation",
    portrait: false,
    caption:
      "6 weeks of consistent retinol — no filter, no facetune. Just patience and SPF. 🌿 The texture difference around my cheeks is what got me. DM me for my exact routine.",
    categories: ["Skincare", "Before & After"],
    likes: 8912,
    comments: 567,
    saves: 3204,
  },
  {
    id: "p3",
    type: "ugc",
    creator: {
      name: "Priya Malik",
      handle: "priya.skin",
      specialty: "Wellness & Skin",
      avatar:
        "https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=80&h=80&fit=crop&auto=format",
      verified: false,
    },
    timestamp: "6h ago",
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=1000&fit=crop&auto=format",
    imageAlt: "Natural glowing makeup look",
    portrait: true,
    caption:
      'My "no-makeup" makeup look for summer ☀️ SPF 50 tinted moisturizer, brow gel, and mascara. That\'s honestly it.',
    categories: ["Makeup", "Minimalist"],
    products: [
      {
        name: "Tinted Moisturizer SPF50",
        brand: "Laura Mercier",
        price: "$48",
        image:
          "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=80&h=80&fit=crop&auto=format",
      },
    ],
    likes: 2134,
    comments: 89,
    saves: 742,
  },
  {
    id: "p4",
    type: "video",
    creator: {
      name: "Sofia Chen",
      handle: "sofia.glow",
      specialty: "Hair Colorist",
      avatar:
        "https://images.unsplash.com/photo-1569913486515-b74bf7751574?w=80&h=80&fit=crop&auto=format",
      verified: true,
    },
    timestamp: "8h ago",
    image:
      "https://images.unsplash.com/photo-1560066984-138daaa9a18d?w=800&h=1000&fit=crop&auto=format",
    imageAlt: "Hair styling tutorial",
    portrait: true,
    caption:
      "Glass hair — the technique I use on every single client. One product. Five minutes. 🪞✨",
    categories: ["Hair", "Tutorial"],
    likes: 15670,
    comments: 1204,
    saves: 8890,
  },
  {
    id: "p5",
    type: "article",
    creator: {
      name: "Lumière Editorial",
      handle: "lumiere.ed",
      specialty: "Beauty Editor",
      avatar:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=80&fit=crop&auto=format",
      verified: true,
    },
    timestamp: "12h ago",
    image:
      "https://images.unsplash.com/photo-1567721913486-6585f069b3bb?w=800&h=500&fit=crop&auto=format",
    imageAlt: "Editorial beauty spread",
    portrait: false,
    caption:
      "The 10 skincare actives worth the hype — and the 3 that are completely overrated. Our editors tested everything.",
    categories: ["Skincare", "Editorial"],
    likes: 3891,
    comments: 445,
    saves: 2167,
  },
  {
    id: "p6",
    type: "tip",
    creator: {
      name: "Dr. Reyna Park",
      handle: "derm.reyna",
      specialty: "Board-certified Dermatologist",
      avatar:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&auto=format",
      verified: true,
    },
    timestamp: "1d ago",
    image:
      "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=800&h=800&fit=crop&auto=format",
    imageAlt: "Minimal skincare routine",
    portrait: false,
    caption:
      "As a derm: your 3-step routine is doing more than your 12-step routine 🧴 Cleanser. Moisturizer. SPF. Everything else is supplemental.",
    categories: ["Skincare", "Expert Advice"],
    products: [
      {
        name: "Barrier Repair Cream",
        brand: "CeraVe",
        price: "$18",
        image:
          "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=80&h=80&fit=crop&auto=format",
      },
    ],
    likes: 22405,
    comments: 2891,
    saves: 14320,
  },
];

const trendingTags = [
  { tag: "#GlassySkin", count: "284K posts" },
  { tag: "#CleanBeauty", count: "1.2M posts" },
  { tag: "#SkincareRoutine", count: "890K posts" },
  { tag: "#NaturalHair", count: "456K posts" },
  { tag: "#NoFilterSkin", count: "127K posts" },
  { tag: "#SunscreenEveryDay", count: "98K posts" },
];

const feedSuggestedCreators = [
  {
    name: "Jenna Wells",
    handle: "jenna.wellness",
    specialty: "Holistic Beauty",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format",
    verified: true,
  },
  {
    name: "Marcus Okafor",
    handle: "marcusmua",
    specialty: "Makeup Artist",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    verified: true,
  },
  {
    name: "Clara Voss",
    handle: "clara.nails",
    specialty: "Nail Artist",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&auto=format",
    verified: false,
  },
];

const beautyEvents = [
  { name: "Beauty Week NYC", date: "Aug 12–16", kind: "Event" },
  { name: "Clean Beauty Summit", date: "Aug 22", kind: "Virtual" },
  { name: "Fall Trend Preview", date: "Sep 5", kind: "Livestream" },
];

const trendingProducts = [
  {
    name: "Protini Polypeptide Cream",
    brand: "Drunk Elephant",
    price: "$68",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=200&fit=crop&auto=format",
    rating: 4.8,
    category: "Moisturizer",
  },
  {
    name: "Barrier Serum",
    brand: "Laneige",
    price: "$39",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop&auto=format",
    rating: 4.7,
    category: "Serum",
  },
  {
    name: "C-Firma Day Serum",
    brand: "Drunk Elephant",
    price: "$78",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&h=200&fit=crop&auto=format",
    rating: 4.6,
    category: "Vitamin C",
  },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill={filled ? "#C4847A" : "none"}
      stroke={filled ? "#C4847A" : "currentColor"}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconComment() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconBookmark({ filled }: { filled: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill={filled ? "#C4847A" : "none"}
      stroke={filled ? "#C4847A" : "currentColor"}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}
function IconHome({ active }: { active?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "#C4847A" : "none"}
      stroke={active ? "#C4847A" : "currentColor"}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconCompass() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function IconPerson() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="#C4A35A"
      stroke="none"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" x2="7.01" y1="7" y2="7" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.6H22l-6.4 4.6 2.4 7.8L12 17.4l-6 4.6 2.4-7.8L2 9.6h7.6z" />
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
function IconMapPin() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function IconMoreHorizontal() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
function IconFilm() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18M17 3v18M3 7h4M17 7h4M3 12h18M3 17h4M17 17h4" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconAtSign() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconImages() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

const categoryStyle: Record<string, { bg: string; text: string }> = {
  Skincare: { bg: "rgba(196,132,122,0.10)", text: "#A0524A" },
  Makeup: { bg: "rgba(160,105,79,0.10)", text: "#8B5A3C" },
  Hair: { bg: "rgba(138,158,140,0.12)", text: "#527055" },
  Nails: { bg: "rgba(196,132,122,0.08)", text: "#9A6E88" },
  Wellness: { bg: "rgba(138,158,140,0.12)", text: "#527055" },
  Fragrance: { bg: "rgba(122,100,160,0.10)", text: "#5C4A8A" },
  Tutorial: { bg: "rgba(45,36,34,0.06)", text: "#4A3A36" },
  Editorial: { bg: "rgba(45,36,34,0.06)", text: "#4A3A36" },
  "Expert Advice": { bg: "rgba(122,100,160,0.10)", text: "#5C4A8A" },
  "Before & After": { bg: "rgba(196,163,90,0.10)", text: "#8B7228" },
  Minimalist: { bg: "rgba(45,36,34,0.05)", text: "#6B5E59" },
};

function CategoryChip({ label }: { label: string }) {
  const style = categoryStyle[label] ?? {
    bg: "rgba(45,36,34,0.06)",
    text: "#4A3A36",
  };
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        fontSize: "11px",
        fontWeight: 500,
        padding: "3px 9px",
        borderRadius: "99px",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </span>
  );
}

function VerifiedBadge({ size = 15 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#C4847A",
        flexShrink: 0,
      }}
      aria-label="Verified creator"
    >
      <IconCheck />
    </span>
  );
}

function ActionBtn({
  onClick,
  icon,
  count,
  active,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  count?: string;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 10px",
        borderRadius: 10,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: active ? "#C4847A" : "#7A6460",
        fontSize: 12.5,
        fontWeight: 500,
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F5EFE8")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon}
      {count && <span>{count}</span>}
    </button>
  );
}

// ─── TOP NAV ─────────────────────────────────────────────────────────────────

interface CompactProfile {
  name: string;
  handle: string;
  avatar: string;
  isFollowed: boolean;
  onFollow: () => void;
}

function TopNav({
  compactProfile,
  onBack,
  onLogoClick,
}: {
  compactProfile?: CompactProfile;
  onBack?: () => void;
  onLogoClick?: () => void;
}) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(253,250,247,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #EDE0DA",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 62,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Back button (profile mobile) or logo */}
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="back-btn-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: "#4A3A36",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F5EFE8")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <IconArrowLeft />
          </button>
        )}
        <button
          onClick={onLogoClick}
          style={{
            flexShrink: 0,
            background: "none",
            border: "none",
            cursor: onLogoClick ? "pointer" : "default",
            padding: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 21,
              fontWeight: 600,
              color: "#2D2422",
              letterSpacing: "-0.02em",
            }}
          >
            lumière
          </span>
        </button>

        {/* Compact profile (profile page, scrolled) */}
        {compactProfile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: 1,
              transition: "opacity 0.3s ease",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                overflow: "hidden",
                border: "1.5px solid #EDE0DA",
                flexShrink: 0,
              }}
            >
              <img
                src={compactProfile.avatar}
                alt={compactProfile.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#2D2422",
                  lineHeight: 1.2,
                }}
              >
                {compactProfile.name}
              </div>
              <div style={{ fontSize: 10.5, color: "#7A6460", lineHeight: 1 }}>
                {compactProfile.handle}
              </div>
            </div>
            <button
              onClick={compactProfile.onFollow}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                padding: "4px 14px",
                borderRadius: 99,
                border: compactProfile.isFollowed
                  ? "1.5px solid #EDE0DA"
                  : "1.5px solid #C4847A",
                background: compactProfile.isFollowed
                  ? "transparent"
                  : "#C4847A",
                color: compactProfile.isFollowed ? "#7A6460" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {compactProfile.isFollowed ? "Following" : "+ Follow"}
            </button>
          </div>
        )}

        {/* Search */}
        {!compactProfile && (
          <div style={{ flex: 1, maxWidth: 420 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                backgroundColor: searchFocused ? "#fff" : "#F5EFE8",
                border: `1.5px solid ${searchFocused ? "#C4847A" : "transparent"}`,
                borderRadius: 12,
                padding: "0 14px",
                height: 38,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ color: "#7A6460", flexShrink: 0 }}>
                <IconSearch />
              </span>
              <input
                type="search"
                placeholder="Search creators, brands, looks..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 13.5,
                  color: "#2D2422",
                  fontFamily: "var(--font-sans)",
                }}
                aria-label="Search beauty content"
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: "auto",
          }}
        >
          {[
            { Icon: IconBell, label: "Notifications", badge: 3 },
            { Icon: IconMail, label: "Messages", badge: 1 },
          ].map(({ Icon, label, badge }) => (
            <button
              key={label}
              aria-label={label}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "#4A3A36",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F5EFE8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Icon />
              {badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#C4847A",
                    border: "1.5px solid #FDFAF7",
                  }}
                />
              )}
            </button>
          ))}
          <button
            aria-label="Profile"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #EDE0DA",
              cursor: "pointer",
              marginLeft: 6,
              transition: "border-color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#C4847A")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#EDE0DA")
            }
          >
            <img
              src={profileData.avatar}
              alt="Your profile"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
}) {
  const tabs = [
    {
      id: "home",
      label: "Home",
      icon: (a: boolean) => <IconHome active={a} />,
    },
    { id: "discover", label: "Discover", icon: () => <IconCompass /> },
    { id: "create", label: "Create", icon: () => <IconPlus /> },
    {
      id: "saved",
      label: "Saved",
      icon: (a: boolean) => <IconBookmark filled={a} />,
    },
    { id: "profile", label: "Profile", icon: () => <IconPerson /> },
  ];
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(253,250,247,0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid #EDE0DA",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: 62,
        padding: "0 8px",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isCreate = tab.id === "create";
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              flex: 1,
              height: "100%",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isActive && !isCreate ? "#C4847A" : "#7A6460",
            }}
          >
            {isCreate ? (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: "#C4847A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(196,132,122,0.4)",
                }}
              >
                <IconPlus />
              </div>
            ) : (
              <>
                {tab.icon(isActive)}
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: "0.01em",
                  }}
                >
                  {tab.label}
                </span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function FloatingCreateButton() {
  return (
    <button
      className="float-btn"
      aria-label="Create new post"
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 40,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#C4847A",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 24px rgba(196,132,122,0.4)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(196,132,122,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(196,132,122,0.4)";
      }}
    >
      <IconPlus />
    </button>
  );
}

// ─── HOME FEED COMPONENTS ─────────────────────────────────────────────────────

function TrendingCarousel() {
  const [seenItems, setSeenItems] = useState<Set<string>>(
    new Set(trends.filter((t) => t.seen).map((t) => t.id)),
  );
  return (
    <div style={{ padding: "20px 0 4px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 14,
          padding: "0 20px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 500,
            color: "#2D2422",
          }}
        >
          Trending Today
        </span>
        <span style={{ fontSize: 12, color: "#7A6460" }}>
          Updated 20 min ago
        </span>
      </div>
      <div
        className="scroll-reveal"
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          padding: "4px 20px 12px",
          scrollSnapType: "x mandatory",
        }}
      >
        {trends.map((item) => {
          const seen = seenItems.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() =>
                setSeenItems((prev) => new Set([...prev, item.id]))
              }
              style={{
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 7,
                background: "none",
                border: "none",
                cursor: "pointer",
                scrollSnapAlign: "start",
                width: 68,
              }}
              aria-label={`${item.label} — ${item.sublabel}`}
            >
              <div className={seen ? "story-ring-seen" : "story-ring"}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#F5EFE8",
                    border: "2px solid #FDFAF7",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: seen ? "#7A6460" : "#2D2422",
                    lineHeight: 1.3,
                    maxWidth: 68,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9A8880",
                    lineHeight: 1.2,
                    marginTop: 1,
                  }}
                >
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ height: 1, background: "#EDE0DA", margin: "0 20px" }} />
    </div>
  );
}

function PostCard({
  post,
  likedIds,
  savedIds,
  followedIds,
  onLike,
  onSave,
  onFollow,
}: {
  post: Post;
  likedIds: Set<string>;
  savedIds: Set<string>;
  followedIds: Set<string>;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onFollow: (handle: string) => void;
}) {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [likePop, setLikePop] = useState(false);
  const [savePop, setSavePop] = useState(false);
  const isLiked = likedIds.has(post.id),
    isSaved = savedIds.has(post.id),
    isFollowed = followedIds.has(post.creator.handle);
  const captionLong = post.caption.length > 120;
  const typeLabel: Record<Post["type"], string> = {
    tutorial: "Tutorial",
    "before-after": "Before & After",
    ugc: "Community Look",
    video: "Video",
    tip: "Expert Tip",
    article: "Editorial",
  };

  function handleLike() {
    onLike(post.id);
    setLikePop(true);
    setTimeout(() => setLikePop(false), 400);
  }
  function handleSave() {
    onSave(post.id);
    setSavePop(true);
    setTimeout(() => setSavePop(false), 400);
  }

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #EDE0DA",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(45,36,34,0.05)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 28px rgba(45,36,34,0.09)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(45,36,34,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px 12px",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#F5EFE8",
              border: "1.5px solid #EDE0DA",
            }}
          >
            <img
              src={post.creator.avatar}
              alt={post.creator.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          {post.creator.verified && (
            <span style={{ position: "absolute", bottom: -1, right: -1 }}>
              <VerifiedBadge />
            </span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "#2D2422",
              lineHeight: 1.2,
            }}
          >
            {post.creator.name}
          </span>
          <div
            style={{
              fontSize: 11.5,
              color: "#7A6460",
              lineHeight: 1.3,
              marginTop: 1,
            }}
          >
            {post.creator.specialty} · {post.timestamp}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#9A8880",
              background: "#F5EFE8",
              padding: "3px 8px",
              borderRadius: 99,
            }}
          >
            {typeLabel[post.type]}
          </span>
          <button
            onClick={() => onFollow(post.creator.handle)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 14px",
              borderRadius: 99,
              border: isFollowed
                ? "1.5px solid #EDE0DA"
                : "1.5px solid #C4847A",
              background: isFollowed ? "transparent" : "#C4847A",
              color: isFollowed ? "#7A6460" : "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {isFollowed ? "Following" : "+ Follow"}
          </button>
        </div>
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          background: "#F5EFE8",
          lineHeight: 0,
        }}
      >
        <img
          src={post.image}
          alt={post.imageAlt}
          style={{
            width: "100%",
            height: post.portrait ? 460 : 300,
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
        />
        {post.type === "video" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(45,36,34,0.25) 0%, rgba(45,36,34,0.1) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "rgba(253,250,247,0.92)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2D2422",
                paddingLeft: 3,
                boxShadow: "0 4px 20px rgba(45,36,34,0.2)",
              }}
            >
              <IconPlay />
            </div>
          </div>
        )}
        {post.type === "before-after" && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: 12,
              background: "rgba(253,250,247,0.92)",
              backdropFilter: "blur(8px)",
              borderRadius: 99,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: "#8B7228",
              border: "1px solid rgba(196,163,90,0.25)",
            }}
          >
            Before → After
          </div>
        )}
      </div>
      {post.categories.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            padding: "12px 16px 0",
          }}
        >
          {post.categories.map((cat) => (
            <CategoryChip key={cat} label={cat} />
          ))}
        </div>
      )}
      <div style={{ padding: "10px 16px 12px" }}>
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.65,
            color: "#4A3A36",
            margin: 0,
          }}
        >
          {captionExpanded || !captionLong
            ? post.caption
            : post.caption.slice(0, 120) + "…"}
          {captionLong && !captionExpanded && (
            <button
              onClick={() => setCaptionExpanded(true)}
              style={{
                color: "#7A6460",
                fontWeight: 500,
                fontSize: 13,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0 2px",
                marginLeft: 2,
              }}
            >
              more
            </button>
          )}
        </p>
      </div>
      {post.products && post.products.length > 0 && (
        <div style={{ padding: "0 16px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 10,
            }}
          >
            <span style={{ color: "#9A8880" }}>
              <IconTag />
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                color: "#7A6460",
                letterSpacing: "0.02em",
              }}
            >
              Tagged Products
            </span>
          </div>
          <div
            className="scroll-reveal"
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {post.products.map((product, i) => (
              <button
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                  background: "#FDFAF7",
                  border: "1px solid #EDE0DA",
                  borderRadius: 12,
                  padding: "7px 12px 7px 7px",
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#C4847A";
                  e.currentTarget.style.background = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#EDE0DA";
                  e.currentTarget.style.background = "#FDFAF7";
                }}
                aria-label={`Shop ${product.name} by ${product.brand}`}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#F5EFE8",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#2D2422",
                      lineHeight: 1.2,
                      maxWidth: 130,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#7A6460", marginTop: 1 }}>
                    {product.brand} ·{" "}
                    <strong style={{ color: "#4A3A36" }}>
                      {product.price}
                    </strong>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 14px 14px",
          borderTop: "1px solid #F5EBE5",
        }}
      >
        <div style={{ display: "flex", gap: 2, flex: 1 }}>
          <ActionBtn
            onClick={handleLike}
            icon={
              <span
                className={likePop ? "animate-pop" : ""}
                style={{ display: "flex" }}
              >
                <IconHeart filled={isLiked} />
              </span>
            }
            count={formatCount(post.likes + (isLiked ? 1 : 0))}
            active={isLiked}
            label={isLiked ? "Unlike" : "Like"}
          />
          <ActionBtn
            onClick={() => {}}
            icon={<IconComment />}
            count={formatCount(post.comments)}
            label="Comment"
          />
          <ActionBtn
            onClick={handleSave}
            icon={
              <span
                className={savePop ? "animate-pop" : ""}
                style={{ display: "flex" }}
              >
                <IconBookmark filled={isSaved} />
              </span>
            }
            count={formatCount(post.saves + (isSaved ? 1 : 0))}
            active={isSaved}
            label={isSaved ? "Unsave" : "Save"}
          />
        </div>
        <ActionBtn onClick={() => {}} icon={<IconShare />} label="Share" />
      </div>
    </article>
  );
}

function ProductRecommendationCard() {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  function toggle(i: number) {
    setWishlist((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  }
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #EDE0DA",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(45,36,34,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: "#C4A35A" }}>
            <IconSparkle />
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 500,
              color: "#2D2422",
            }}
          >
            Trending in Skincare
          </span>
        </div>
        <button
          style={{
            fontSize: 12,
            color: "#7A6460",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
            textDecorationColor: "#EDE0DA",
          }}
        >
          View all
        </button>
      </div>
      <div
        style={{ display: "flex", gap: 12, overflowX: "auto" }}
        className="scroll-reveal"
      >
        {trendingProducts.map((p, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: 160,
              background: "#FDFAF7",
              borderRadius: 14,
              border: "1px solid #EDE0DA",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                height: 140,
                background: "#F5EFE8",
              }}
            >
              <img
                src={p.image}
                alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
              <button
                onClick={() => toggle(i)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(253,250,247,0.9)",
                  backdropFilter: "blur(6px)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: wishlist.has(i) ? "#C4847A" : "#7A6460",
                  transition: "color 0.15s",
                }}
                aria-label={`Wishlist ${p.name}`}
              >
                <IconBookmark filled={wishlist.has(i)} />
              </button>
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  background: "rgba(253,250,247,0.92)",
                  color: "#7A6460",
                  borderRadius: 99,
                  padding: "2px 7px",
                }}
              >
                {p.category}
              </span>
            </div>
            <div style={{ padding: "10px 11px 12px" }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#2D2422",
                  lineHeight: 1.35,
                  marginBottom: 3,
                }}
              >
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: "#7A6460", marginBottom: 7 }}>
                {p.brand}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#2D2422" }}
                >
                  {p.price}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconStar />
                  <span
                    style={{
                      fontSize: 10.5,
                      color: "#7A6460",
                      fontWeight: 500,
                    }}
                  >
                    {p.rating}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionBreak({
  type,
  context,
}: {
  type: "because" | "recommended";
  context?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#EDE0DA" }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 14px",
          borderRadius: 99,
          background: "#F5EFE8",
          border: "1px solid #EDE0DA",
          flexShrink: 0,
        }}
      >
        <span style={{ color: type === "because" ? "#C4847A" : "#C4A35A" }}>
          <IconSparkle />
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#7A6460",
            whiteSpace: "nowrap",
          }}
        >
          {type === "because" ? (
            <>
              Because you follow{" "}
              <strong style={{ color: "#4A3A36" }}>{context}</strong>
            </>
          ) : (
            "Recommended for you"
          )}
        </span>
      </div>
      <div style={{ flex: 1, height: 1, background: "#EDE0DA" }} />
    </div>
  );
}

function FeedSidebar({
  followedIds,
  onFollow,
}: {
  followedIds: Set<string>;
  onFollow: (handle: string) => void;
}) {
  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #EDE0DA",
          padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 500,
            color: "#2D2422",
            marginBottom: 14,
          }}
        >
          Trending Now
        </div>
        {trendingTags.map((item, i) => (
          <button
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F5EFE8")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#C4847A" }}>
              {item.tag}
            </span>
            <span style={{ fontSize: 11, color: "#9A8880" }}>{item.count}</span>
          </button>
        ))}
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #EDE0DA",
          padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 500,
              color: "#2D2422",
            }}
          >
            Suggested Creators
          </div>
          <button
            style={{
              fontSize: 11.5,
              color: "#C4847A",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            See all
          </button>
        </div>
        {feedSuggestedCreators.map((creator, i) => {
          const isF = followedIds.has(creator.handle);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: i < feedSuggestedCreators.length - 1 ? 14 : 0,
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#F5EFE8",
                    border: "1.5px solid #EDE0DA",
                  }}
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
                {creator.verified && (
                  <span style={{ position: "absolute", bottom: -1, right: -1 }}>
                    <VerifiedBadge />
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#2D2422",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {creator.name}
                </div>
                <div style={{ fontSize: 11, color: "#7A6460" }}>
                  {creator.specialty}
                </div>
              </div>
              <button
                onClick={() => onFollow(creator.handle)}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 99,
                  border: isF ? "1.5px solid #EDE0DA" : "1.5px solid #C4847A",
                  background: isF ? "transparent" : "rgba(196,132,122,0.1)",
                  color: isF ? "#9A8880" : "#C4847A",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {isF ? "Following" : "+ Follow"}
              </button>
            </div>
          );
        })}
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #EDE0DA",
          padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 500,
            color: "#2D2422",
            marginBottom: 14,
          }}
        >
          Beauty Events
        </div>
        {beautyEvents.map((event, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: i < beautyEvents.length - 1 ? 12 : 0,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#F5EFE8",
                border: "1px solid #EDE0DA",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "#9A8880",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {event.date.split(" ")[0]}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#2D2422",
                  lineHeight: 1,
                }}
              >
                {event.date.replace(/[^\d]/g, "").slice(0, 2)}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ fontSize: 12.5, fontWeight: 600, color: "#2D2422" }}
              >
                {event.name}
              </div>
              <div style={{ fontSize: 11, color: "#7A6460", marginTop: 2 }}>
                <span
                  style={{
                    background:
                      event.kind === "Virtual"
                        ? "rgba(138,158,140,0.12)"
                        : event.kind === "Livestream"
                          ? "rgba(196,132,122,0.1)"
                          : "rgba(45,36,34,0.06)",
                    color:
                      event.kind === "Virtual"
                        ? "#527055"
                        : event.kind === "Livestream"
                          ? "#A0524A"
                          : "#4A3A36",
                    padding: "2px 7px",
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                >
                  {event.kind}
                </span>
                <span style={{ marginLeft: 6 }}>{event.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 4px" }}>
        <p style={{ fontSize: 11, color: "#9A8880", lineHeight: 1.8 }}>
          About · Careers · Press · Legal · Privacy · Help
        </p>
        <p style={{ fontSize: 11, color: "#B5A5A0", marginTop: 8 }}>
          © 2024 Lumière Beauty Inc.
        </p>
      </div>
    </aside>
  );
}

// ─── PROFILE COMPONENTS ───────────────────────────────────────────────────────

function ProfileHeader({
  isFollowed,
  onFollow,
}: {
  isFollowed: boolean;
  onFollow: () => void;
}) {
  const {
    name,
    handle,
    verified,
    specialties,
    bio,
    location,
    website,
    avatar,
    cover,
    stats,
  } = profileData;
  const [messagePop, setMessagePop] = useState(false);

  return (
    <div>
      {/* Cover image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 240,
          background: "#F5EFE8",
          overflow: "hidden",
        }}
      >
        <img
          src={cover}
          alt={`${name}'s profile cover`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(253,250,247,0.6) 100%)",
          }}
        />
        {/* Edit cover (owner) */}
        {profileData.isOwner && (
          <button
            style={{
              position: "absolute",
              bottom: 12,
              right: 14,
              fontSize: 11.5,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 99,
              border: "1.5px solid rgba(255,255,255,0.7)",
              background: "rgba(253,250,247,0.85)",
              backdropFilter: "blur(8px)",
              color: "#4A3A36",
              cursor: "pointer",
            }}
          >
            Edit Cover
          </button>
        )}
      </div>

      {/* Profile info */}
      <div
        style={{
          background: "#fff",
          borderRadius: "0 0 20px 20px",
          border: "1px solid #EDE0DA",
          borderTop: "none",
          padding: "0 24px 24px",
          boxShadow: "0 4px 20px rgba(45,36,34,0.06)",
        }}
      >
        {/* Avatar row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: -48,
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #fff",
                background: "#F5EFE8",
                boxShadow: "0 4px 20px rgba(45,36,34,0.12)",
              }}
            >
              <img
                src={avatar}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {verified && (
              <span style={{ position: "absolute", bottom: 4, right: 4 }}>
                <VerifiedBadge size={22} />
              </span>
            )}
            {profileData.isOwner && (
              <button
                style={{
                  position: "absolute",
                  bottom: 2,
                  right: -4,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#2D2422",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                }}
                aria-label="Edit photo"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            <button
              onClick={onFollow}
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "9px 22px",
                borderRadius: 99,
                border: isFollowed ? "1.5px solid #EDE0DA" : "none",
                background: isFollowed ? "transparent" : "#C4847A",
                color: isFollowed ? "#7A6460" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                boxShadow: isFollowed
                  ? "none"
                  : "0 4px 16px rgba(196,132,122,0.35)",
              }}
              aria-label={isFollowed ? "Unfollow" : "Follow"}
            >
              {isFollowed ? "Following ✓" : "+ Follow"}
            </button>
            <button
              onClick={() => {
                setMessagePop(true);
                setTimeout(() => setMessagePop(false), 400);
              }}
              className={messagePop ? "animate-pop" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 18px",
                borderRadius: 99,
                border: "1.5px solid #EDE0DA",
                background: "#fff",
                color: "#4A3A36",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C4847A";
                e.currentTarget.style.color = "#C4847A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EDE0DA";
                e.currentTarget.style.color = "#4A3A36";
              }}
              aria-label="Send message"
            >
              <IconMessage /> Message
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 18px",
                borderRadius: 99,
                border: "1.5px solid #EDE0DA",
                background: "#fff",
                color: "#4A3A36",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C4847A";
                e.currentTarget.style.color = "#C4847A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EDE0DA";
                e.currentTarget.style.color = "#4A3A36";
              }}
              aria-label="Share profile"
            >
              <IconShare />
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: 99,
                border: "1.5px solid #EDE0DA",
                background: "#fff",
                color: "#4A3A36",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#C4847A";
                e.currentTarget.style.color = "#C4847A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#EDE0DA";
                e.currentTarget.style.color = "#4A3A36";
              }}
              aria-label="More options"
            >
              <IconMoreHorizontal />
            </button>
          </div>
        </div>

        {/* Name & handle */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 600,
                color: "#2D2422",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {name}
            </h1>
            {verified && <VerifiedBadge size={18} />}
          </div>
          <div style={{ fontSize: 14, color: "#7A6460", marginTop: 3 }}>
            {handle}
          </div>
        </div>

        {/* Specialty tags */}
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}
        >
          {specialties.map((s) => (
            <span
              key={s}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: 99,
                background: "rgba(196,132,122,0.08)",
                color: "#A0524A",
                border: "1px solid rgba(196,132,122,0.15)",
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Bio */}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#4A3A36",
            marginTop: 12,
            marginBottom: 0,
            maxWidth: 560,
          }}
        >
          {bio}
        </p>

        {/* Meta */}
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12 }}
        >
          {location && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "#7A6460",
              }}
            >
              <span style={{ color: "#9A8880" }}>
                <IconMapPin />
              </span>
              {location}
            </span>
          )}
          {website && (
            <a
              href={`https://${website}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "#C4847A",
                textDecoration: "none",
                fontWeight: 500,
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconLink />
              {website}
            </a>
          )}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginTop: 20,
            borderTop: "1px solid #F5EBE5",
            paddingTop: 18,
          }}
        >
          {[
            { label: "Followers", value: formatCount(stats.followers) },
            { label: "Following", value: formatCount(stats.following) },
            { label: "Posts", value: formatCount(stats.posts) },
            ...(profileData.isOwner
              ? [{ label: "Saves", value: formatCount(stats.saves) }]
              : []),
            { label: "Likes", value: formatCount(stats.likes) },
          ].map((stat, i, arr) => (
            <button
              key={stat.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "8px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                borderRight: i < arr.length - 1 ? "1px solid #F5EBE5" : "none",
                transition: "background 0.15s",
                borderRadius: 10,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F5EFE8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#2D2422",
                  lineHeight: 1.1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#7A6460",
                  letterSpacing: "0.02em",
                }}
              >
                {stat.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeaturedCollections() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #EDE0DA",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 500,
            color: "#2D2422",
          }}
        >
          Featured Collections
        </span>
        <button
          style={{
            fontSize: 12,
            color: "#C4847A",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          View all
        </button>
      </div>
      <div
        className="scroll-reveal"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {profileCollections.map((col) => (
          <button
            key={col.id}
            style={{
              flexShrink: 0,
              width: 140,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
              borderRadius: 14,
              overflow: "hidden",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                position: "relative",
                height: 180,
                borderRadius: 14,
                overflow: "hidden",
                background: "#F5EFE8",
              }}
            >
              <img
                src={col.cover}
                alt={col.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, transparent 30%, rgba(45,36,34,0.72) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.3,
                  }}
                >
                  {col.name}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "rgba(255,255,255,0.75)",
                    marginTop: 3,
                  }}
                >
                  {col.count} posts
                </div>
              </div>
            </div>
          </button>
        ))}
        {/* Add collection (owner) */}
        {profileData.isOwner && (
          <button
            style={{
              flexShrink: 0,
              width: 140,
              height: 180,
              borderRadius: 14,
              border: "1.5px dashed #EDE0DA",
              background: "#FDFAF7",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: "pointer",
              color: "#7A6460",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C4847A";
              e.currentTarget.style.color = "#C4847A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#EDE0DA";
              e.currentTarget.style.color = "#7A6460";
            }}
            aria-label="Create new collection"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1.5px dashed currentColor",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconPlus />
            </div>
            <span style={{ fontSize: 12, fontWeight: 500 }}>
              New Collection
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function AchievementBadges() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #EDE0DA",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 16,
          fontWeight: 500,
          color: "#2D2422",
          marginBottom: 14,
        }}
      >
        Achievements
      </div>
      <div
        className="scroll-reveal"
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {achievements.map((badge, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 99,
              background: badge.bg,
              border: `1px solid ${badge.color}22`,
            }}
          >
            <span style={{ fontSize: 14 }}>{badge.icon}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: badge.color,
                whiteSpace: "nowrap",
              }}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoriteBrands() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid #EDE0DA",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 500,
            color: "#2D2422",
          }}
        >
          Favorite Brands
        </span>
        <button
          style={{
            fontSize: 12,
            color: "#C4847A",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          See all
        </button>
      </div>
      <div
        className="scroll-reveal"
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {favoriteBrands.map((brand, i) => (
          <button
            key={i}
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 18,
                overflow: "hidden",
                background: "#F5EFE8",
                border: "1.5px solid #EDE0DA",
                transition: "border-color 0.15s",
              }}
            >
              <img
                src={brand.image}
                alt={brand.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#2D2422",
                  lineHeight: 1.2,
                }}
              >
                {brand.name}
              </div>
              <div style={{ fontSize: 10, color: "#9A8880", marginTop: 2 }}>
                {brand.category}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

type ProfileTab = "posts" | "videos" | "collections" | "tagged" | "saved";

function ProfileTabNav({
  active,
  onChange,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}) {
  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: "posts", label: "Posts", icon: <IconGrid /> },
    { id: "videos", label: "Videos", icon: <IconFilm /> },
    { id: "collections", label: "Collections", icon: <IconFolder /> },
    { id: "tagged", label: "Tagged", icon: <IconAtSign /> },
    ...(profileData.isOwner
      ? [{ id: "saved" as ProfileTab, label: "Saved", icon: <IconLock /> }]
      : []),
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 62,
        zIndex: 30,
        background: "rgba(253,250,247,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #EDE0DA",
      }}
    >
      <div
        style={{ display: "flex", overflowX: "auto" }}
        className="scroll-reveal"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "14px 20px",
                border: "none",
                borderBottom: `2.5px solid ${isActive ? "#C4847A" : "transparent"}`,
                background: "transparent",
                cursor: "pointer",
                color: isActive ? "#C4847A" : "#7A6460",
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                whiteSpace: "nowrap",
                transition: "color 0.15s, border-color 0.15s",
                flexShrink: 0,
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "saved" && (
                <span style={{ fontSize: 10, color: "#9A8880", marginLeft: 2 }}>
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProfilePostGrid({ tab }: { tab: ProfileTab }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered =
    tab === "videos"
      ? gridPosts.filter((p) => p.type === "video")
      : tab === "collections"
        ? [] // empty state
        : gridPosts;

  if (tab === "collections") {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {profileCollections.map((col) => (
          <button
            key={col.id}
            style={{
              position: "relative",
              height: 200,
              borderRadius: 16,
              overflow: "hidden",
              background: "#F5EFE8",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              const img = e.currentTarget.querySelector("img");
              if (img) (img as HTMLElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              const img = e.currentTarget.querySelector("img");
              if (img) (img as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <img
              src={col.cover}
              alt={col.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s ease",
              }}
              loading="lazy"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 30%, rgba(45,36,34,0.7) 100%)",
              }}
            />
            <div
              style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {col.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 3,
                }}
              >
                {col.count} posts · {col.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 280,
          gap: 12,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#F5EFE8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          📹
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 500,
            color: "#2D2422",
          }}
        >
          No videos yet
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: "#7A6460",
            textAlign: "center",
            maxWidth: 280,
          }}
        >
          Share your first video tutorial or beauty reel
        </div>
        <button
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "10px 22px",
            borderRadius: 99,
            background: "#C4847A",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(196,132,122,0.35)",
            marginTop: 4,
          }}
        >
          + Upload Video
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}
    >
      {filtered.map((post) => (
        <button
          key={post.id}
          style={{
            position: "relative",
            aspectRatio: "1",
            overflow: "hidden",
            background: "#F5EFE8",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
          onMouseEnter={() => setHoveredId(post.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <img
            src={post.image}
            alt={post.alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.35s ease",
              transform: hoveredId === post.id ? "scale(1.06)" : "scale(1)",
            }}
            loading="lazy"
          />

          {/* Type badge */}
          {post.type !== "photo" && (
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              {post.type === "video" && (
                <div
                  style={{
                    background: "rgba(45,36,34,0.6)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 6,
                    padding: "3px 6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <IconPlay />
                  <span
                    style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}
                  >
                    Video
                  </span>
                </div>
              )}
              {post.type === "before-after" && (
                <div
                  style={{
                    background: "rgba(253,250,247,0.85)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 6,
                    padding: "3px 7px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#8B7228",
                  }}
                >
                  B→A
                </div>
              )}
              {post.type === "carousel" && (
                <div
                  style={{
                    background: "rgba(45,36,34,0.6)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 6,
                    padding: "3px 6px",
                  }}
                >
                  <IconImages />
                </div>
              )}
            </div>
          )}

          {/* Hover overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(45,36,34,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              opacity: hoveredId === post.id ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          >
            <div style={{ display: "flex", gap: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#fff",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  {formatCount(post.likes)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#fff",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700 }}>
                  {formatCount(post.comments)}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ProfileSidebar({
  followedIds,
  onFollow,
}: {
  followedIds: Set<string>;
  onFollow: (handle: string) => void;
}) {
  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Suggested creators */}
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #EDE0DA",
          padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 500,
              color: "#2D2422",
            }}
          >
            Similar Creators
          </div>
          <button
            style={{
              fontSize: 11.5,
              color: "#C4847A",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            See all
          </button>
        </div>
        {profileSuggestedCreators.map((creator, i) => {
          const isF = followedIds.has(creator.handle);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: i < profileSuggestedCreators.length - 1 ? 14 : 0,
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#F5EFE8",
                    border: "1.5px solid #EDE0DA",
                  }}
                >
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </div>
                {creator.verified && (
                  <span style={{ position: "absolute", bottom: -1, right: -1 }}>
                    <VerifiedBadge />
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#2D2422",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {creator.name}
                </div>
                <div style={{ fontSize: 11, color: "#7A6460" }}>
                  {creator.specialty}
                </div>
              </div>
              <button
                onClick={() => onFollow(creator.handle)}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 99,
                  border: isF ? "1.5px solid #EDE0DA" : "1.5px solid #C4847A",
                  background: isF ? "transparent" : "rgba(196,132,122,0.1)",
                  color: isF ? "#9A8880" : "#C4847A",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {isF ? "Following" : "+ Follow"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Recently viewed products */}
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #EDE0DA",
          padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 500,
            color: "#2D2422",
            marginBottom: 14,
          }}
        >
          Recently Viewed
        </div>
        {recentlyViewed.map((p, i) => (
          <button
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "8px 6px",
              borderRadius: 12,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
              marginBottom: i < recentlyViewed.length - 1 ? 4 : 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F5EFE8")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                overflow: "hidden",
                background: "#F5EFE8",
                flexShrink: 0,
              }}
            >
              <img
                src={p.image}
                alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#2D2422",
                  lineHeight: 1.3,
                }}
              >
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: "#7A6460", marginTop: 2 }}>
                {p.brand} ·{" "}
                <strong style={{ color: "#4A3A36" }}>{p.price}</strong>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Trending beauty topics */}
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #EDE0DA",
          padding: "18px 20px",
          boxShadow: "0 2px 12px rgba(45,36,34,0.04)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 500,
            color: "#2D2422",
            marginBottom: 14,
          }}
        >
          Trending Topics
        </div>
        {trendingTags.slice(0, 5).map((item, i) => (
          <button
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "8px 10px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F5EFE8")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#C4847A" }}>
              {item.tag}
            </span>
            <span style={{ fontSize: 11, color: "#9A8880" }}>{item.count}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: "0 4px" }}>
        <p style={{ fontSize: 11, color: "#9A8880", lineHeight: 1.8 }}>
          About · Careers · Press · Legal · Privacy · Help
        </p>
        <p style={{ fontSize: 11, color: "#B5A5A0", marginTop: 8 }}>
          © 2024 Lumière Beauty Inc.
        </p>
      </div>
    </aside>
  );
}

// ─── PAGE COMPONENTS ──────────────────────────────────────────────────────────

function HomeFeed({ onViewProfile }: { onViewProfile: () => void }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState("home");

  function handleLike(id: string) {
    setLikedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function handleSave(id: string) {
    setSavedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function handleFollow(handle: string) {
    setFollowedIds((prev) => {
      const n = new Set(prev);
      n.has(handle) ? n.delete(handle) : n.add(handle);
      return n;
    });
  }

  const feedItems: Array<
    | { kind: "post"; post: Post }
    | { kind: "products" }
    | { kind: "section"; type: "because" | "recommended"; context?: string }
  > = [
    { kind: "post", post: feedPosts[0] },
    { kind: "post", post: feedPosts[1] },
    { kind: "products" },
    { kind: "post", post: feedPosts[2] },
    { kind: "section", type: "because", context: "@sofia.glow" },
    { kind: "post", post: feedPosts[3] },
    { kind: "post", post: feedPosts[4] },
    { kind: "section", type: "recommended" },
    { kind: "post", post: feedPosts[5] },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FDFAF7" }}>
      <TopNav onLogoClick={onViewProfile} />
      <style>{`
        @media (min-width: 1024px) { .feed-grid { grid-template-columns: minmax(0, 1fr) 320px !important; gap: 32px !important; } .bottom-nav-area { display: none !important; } .float-btn-desktop { display: flex !important; } }
        @media (max-width: 1023px) { .feed-sidebar { display: none !important; } .float-btn-desktop { display: none !important; } }
        @media (max-width: 639px) { .feed-grid { padding: 0 12px 80px !important; } }
      `}</style>
      <div
        className="feed-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px 100px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 0,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ padding: "24px 0 8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 26,
                    fontWeight: 500,
                    color: "#2D2422",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {new Date().getHours() < 12
                    ? "Good morning"
                    : new Date().getHours() < 17
                      ? "Good afternoon"
                      : "Good evening"}
                  , Anika ✨
                </h1>
                <p
                  style={{
                    fontSize: 13.5,
                    color: "#7A6460",
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  12 new posts from creators you follow · 3 new product drops
                </p>
              </div>
              <button
                onClick={onViewProfile}
                style={{
                  flexShrink: 0,
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: 99,
                  border: "1.5px solid #EDE0DA",
                  background: "#fff",
                  color: "#4A3A36",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 4px rgba(45,36,34,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#C4847A";
                  e.currentTarget.style.color = "#C4847A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#EDE0DA";
                  e.currentTarget.style.color = "#4A3A36";
                }}
              >
                View my profile
              </button>
            </div>
          </div>
          <TrendingCarousel />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingTop: 16,
            }}
          >
            {feedItems.map((item, i) => {
              if (item.kind === "post")
                return (
                  <PostCard
                    key={item.post.id}
                    post={item.post}
                    likedIds={likedIds}
                    savedIds={savedIds}
                    followedIds={followedIds}
                    onLike={handleLike}
                    onSave={handleSave}
                    onFollow={handleFollow}
                  />
                );
              if (item.kind === "products")
                return <ProductRecommendationCard key={`pr-${i}`} />;
              if (item.kind === "section")
                return (
                  <SectionBreak
                    key={`sb-${i}`}
                    type={item.type}
                    context={item.context}
                  />
                );
              return null;
            })}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2].map((n) => (
                <div
                  key={n}
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    border: "1px solid #EDE0DA",
                    overflow: "hidden",
                    height: 400,
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 10, padding: "14px 16px" }}
                  >
                    <div
                      className="skeleton"
                      style={{ width: 42, height: 42, borderRadius: "50%" }}
                    />
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        paddingTop: 4,
                      }}
                    >
                      <div
                        className="skeleton"
                        style={{ height: 12, borderRadius: 6, width: "55%" }}
                      />
                      <div
                        className="skeleton"
                        style={{ height: 10, borderRadius: 6, width: "35%" }}
                      />
                    </div>
                  </div>
                  <div
                    className="skeleton"
                    style={{ height: 280, margin: "0 16px", borderRadius: 12 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className="feed-sidebar"
          style={{
            position: "sticky",
            top: 80,
            alignSelf: "start",
            paddingTop: 24,
          }}
        >
          <FeedSidebar followedIds={followedIds} onFollow={handleFollow} />
        </div>
      </div>
      <div className="float-btn-desktop" style={{ display: "none" }}>
        <FloatingCreateButton />
      </div>
      <div className="bottom-nav-area">
        <BottomNav activeTab={mobileTab} setActiveTab={setMobileTab} />
      </div>
    </div>
  );
}

function ProfilePage({ onBack }: { onBack: () => void }) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [scrolled, setScrolled] = useState(false);
  const [mobileTab, setMobileTab] = useState("profile");
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const threshold = 320;
      setScrolled(window.scrollY > threshold);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleFollow(handle: string) {
    setFollowedIds((prev) => {
      const n = new Set(prev);
      n.has(handle) ? n.delete(handle) : n.add(handle);
      return n;
    });
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FDFAF7" }}>
      <style>{`
        @media (min-width: 1024px) { .profile-grid { grid-template-columns: minmax(0, 1fr) 300px !important; gap: 28px !important; } .profile-bottom-nav { display: none !important; } .profile-float-btn { display: flex !important; } .back-btn-mobile { display: none !important; } }
        @media (max-width: 1023px) { .profile-right { display: none !important; } .profile-float-btn { display: none !important; } }
        @media (max-width: 639px) { .profile-grid { padding: 0 0 80px !important; } }
      `}</style>

      <TopNav
        compactProfile={
          scrolled
            ? {
                name: profileData.name,
                handle: profileData.handle,
                avatar: profileData.avatar,
                isFollowed,
                onFollow: () => setIsFollowed((f) => !f),
              }
            : undefined
        }
        onBack={onBack}
        onLogoClick={onBack}
      />

      {/* Main layout */}
      <div
        className="profile-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px 100px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 0,
          alignItems: "start",
        }}
      >
        {/* Left: feed */}
        <div>
          {/* Profile header */}
          <div ref={headerRef} style={{ paddingTop: 0 }}>
            <ProfileHeader
              isFollowed={isFollowed}
              onFollow={() => setIsFollowed((f) => !f)}
            />
          </div>

          {/* Featured collections + badges + brands */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              marginTop: 16,
            }}
          >
            <FeaturedCollections />
            <AchievementBadges />
            <FavoriteBrands />
          </div>

          {/* Tab nav + grid */}
          <div style={{ marginTop: 16 }}>
            <ProfileTabNav active={activeTab} onChange={setActiveTab} />
            <div style={{ marginTop: 3 }}>
              <ProfilePostGrid tab={activeTab} />
            </div>
            {/* Skeleton for infinite scroll */}
            {(activeTab === "posts" || activeTab === "videos") && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 3,
                  marginTop: 3,
                }}
              >
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="skeleton"
                    style={{ aspectRatio: "1" }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div
          className="profile-right"
          style={{
            position: "sticky",
            top: 80,
            alignSelf: "start",
            paddingTop: 16,
          }}
        >
          <ProfileSidebar followedIds={followedIds} onFollow={handleFollow} />
        </div>
      </div>

      {/* Floating create (owner, desktop) */}
      {profileData.isOwner && (
        <div className="profile-float-btn" style={{ display: "none" }}>
          <FloatingCreateButton />
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="profile-bottom-nav">
        <BottomNav activeTab={mobileTab} setActiveTab={setMobileTab} />
      </div>
    </div>
  );
}

// ─── APP (ROUTER) ─────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<"home" | "profile">("profile");

  if (page === "home")
    return <HomeFeed onViewProfile={() => setPage("profile")} />;
  return <ProfilePage onBack={() => setPage("home")} />;
}
