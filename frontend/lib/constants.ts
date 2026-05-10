// Trace Brand Colors
// Trace Brand Colors
export const COLORS = {
  primary: "#ff6b00",
  primaryDark: "#d95700",
  primarySoft: "#fff1e8",

  navy: "#0f172a",
  navy2: "#111827",
  slate: "#1e293b",

  background: "#f8f6f1",
  backgroundCool: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",

  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    muted: "#94a3b8",
    inverse: "#ffffff",
    inverseSoft: "#cbd5e1",
  },

  status: {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    pending: "#f59e0b",
  },

  role: {
    trader: "#ff6b00",
    worker: "#7c3aed",
    lender: "#2563eb",
    admin: "#0f172a",
  },
};

// Business Data
export const TRADERS = [
  {
    id: "trader-1",
    name: "Amaka Foods",
    owner: "Amaka Okonkwo",
    location: "Yaba, Lagos",
    image: "https://images.unsplash.com/photo-1556742212-5b321f3c261d?w=400&h=400&fit=crop",
    category: "Food & Beverages",
  },
  {
    id: "trader-2",
    name: "Bola Stores",
    owner: "Bola Adeyemi",
    location: "Ikeja, Lagos",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    category: "Retail",
  },
  {
    id: "trader-3",
    name: "Kemi Snacks",
    owner: "Kemi Solanke",
    location: "Surulere, Lagos",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    category: "Food & Beverages",
  },
  {
    id: "trader-4",
    name: "Yaba Fresh Mart",
    owner: "Chioma Ejiofor",
    location: "Akoka, Lagos",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    category: "Wholesale",
  },
  {
    id: "trader-5",
    name: "Chinedu Provisions",
    owner: "Chinedu Nwosu",
    location: "Victoria Island, Lagos",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    category: "General Store",
  },
];

// Worker Data
export const WORKERS = [
  {
    id: "worker-1",
    name: "Tobi Ade",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
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
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
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
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
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
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
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
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
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
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
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

// Image URLs
export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&h=600&fit=crop",
  marketplace: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&h=600&fit=crop",
  payment: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&h=600&fit=crop",
  jobs: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&h=600&fit=crop",
};
