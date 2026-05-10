// Trace Brand Colors — Redesigned Dark African Theme
export const COLORS = {
  primary: "#FF6B35",
  primaryDark: "#E5501A",
  primarySoft: "#2A1A10",
  gold: "#F5A623",
  goldSoft: "#1E1A0E",

  navy: "#0A0A0F",
  navy2: "#0F0F1A",
  slate: "#1A1A2E",
  surface: "#141420",
  surfaceElevated: "#1C1C2E",

  background: "#0A0A0F",
  backgroundCool: "#0F0F1A",
  card: "#141420",
  border: "#2A2A40",
  borderLight: "#333350",

  text: {
    primary: "#F0EFE8",
    secondary: "#9B99B5",
    muted: "#5C5A78",
    inverse: "#0A0A0F",
    inverseSoft: "#1A1A2E",
  },

  status: {
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
    pending: "#F59E0B",
  },

  role: {
    trader: "#FF6B35",
    worker: "#A855F7",
    lender: "#3B82F6",
    admin: "#F5A623",
  },
};

// Business Data
export const TRADERS = [
  {
    id: "trader-1",
    name: "Amaka Foods",
    owner: "Amaka Okonkwo",
    location: "Yaba, Lagos",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
    category: "Food & Beverages",
  },
  {
    id: "trader-2",
    name: "Bola Stores",
    owner: "Bola Adeyemi",
    location: "Ikeja, Lagos",
    image: "https://images.unsplash.com/photo-1506634572416-47a77e0e3557?w=400&h=400&fit=crop&crop=face",
    category: "Retail",
  },
  {
    id: "trader-3",
    name: "Kemi Snacks",
    owner: "Kemi Solanke",
    location: "Surulere, Lagos",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&crop=face",
    category: "Food & Beverages",
  },
  {
    id: "trader-4",
    name: "Yaba Fresh Mart",
    owner: "Chioma Ejiofor",
    location: "Akoka, Lagos",
    image: "https://images.unsplash.com/photo-1523477800337-966dbabe060b?w=400&h=400&fit=crop&crop=face",
    category: "Wholesale",
  },
  {
    id: "trader-5",
    name: "Chinedu Provisions",
    owner: "Chinedu Nwosu",
    location: "Victoria Island, Lagos",
    image: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&h=400&fit=crop&crop=face",
    category: "General Store",
  },
];

// Worker Data
export const WORKERS = [
  {
    id: "worker-1",
    name: "Tobi Ade",
    image: "https://images.unsplash.com/photo-1506634572416-47a77e0e3557?w=100&h=100&fit=crop&crop=face",
    location: "Yaba",
    skills: ["Stocktaking", "Cleaning", "Customer Service"],
    reliabilityScore: 92,
    totalEarnings: 245000,
    jobsCompleted: 12,
    school: "UNILAG",
  },
  {
    id: "worker-2",
    name: "Zainab Yusuf",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face",
    location: "Akoka",
    skills: ["Packing", "Organization", "Inventory"],
    reliabilityScore: 88,
    totalEarnings: 186000,
    jobsCompleted: 9,
    school: "University of Lagos",
  },
  {
    id: "worker-3",
    name: "Mariam Bello",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop&crop=face",
    location: "Ikeja",
    skills: ["Delivery", "Loading", "Setup"],
    reliabilityScore: 85,
    totalEarnings: 165000,
    jobsCompleted: 8,
    school: "Yaba College",
  },
  {
    id: "worker-4",
    name: "David Eze",
    image: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=100&h=100&fit=crop&crop=face",
    location: "Lekki",
    skills: ["Data Entry", "Admin", "Support"],
    reliabilityScore: 90,
    totalEarnings: 218000,
    jobsCompleted: 11,
    school: "LASU",
  },
  {
    id: "worker-5",
    name: "Aisha Lawal",
    image: "https://images.unsplash.com/photo-1523477800337-966dbabe060b?w=100&h=100&fit=crop&crop=face",
    location: "Bariga",
    skills: ["Cleaning", "Organization", "Food Service"],
    reliabilityScore: 87,
    totalEarnings: 142000,
    jobsCompleted: 7,
    school: "Moshood Abiola Polytechnic",
  },
  {
    id: "worker-6",
    name: "Chioma Obi",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face",
    location: "Surulere",
    skills: ["Cashier", "Sales", "Customer Support"],
    reliabilityScore: 91,
    totalEarnings: 203000,
    jobsCompleted: 10,
    school: "UNILAG",
  },
];

// Lagos Neighborhoods
export const LOCATIONS = ["Yaba", "Akoka", "Ikeja", "Surulere", "Lekki", "Victoria Island", "Bariga", "Mushin"];

// Image URLs — African / Black people imagery
export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=900&fit=crop",
  hero2: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&fit=crop&crop=top",
  marketplace: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=600&fit=crop",
  payment: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
  jobs: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=1200&h=600&fit=crop",
  market: "https://images.unsplash.com/photo-1523477800337-966dbabe060b?w=800&h=600&fit=crop",
  trader1: "https://images.unsplash.com/photo-1506634572416-47a77e0e3557?w=600&h=700&fit=crop&crop=top",
  trader2: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&h=700&fit=crop&crop=top",
  trader3: "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=600&h=700&fit=crop&crop=top",
};
