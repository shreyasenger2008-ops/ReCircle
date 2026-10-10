export type Role = "generator" | "picker" | "admin";

export type Location = {
  lat: number;
  lng: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  address: string;
  location: Location;
  trustScore: number;
  verificationStatus: "verified" | "pending" | "rejected";
  createdAt: string;
  balance: number;
  greenKarmaPoints: number;
};

export type WastePicker = {
  id: string;
  userId: string;
  name: string;
  serviceAreas: string[];
  materialsHandled: string[];
  availability: "online" | "offline" | "busy";
  currentLocation: Location;
  dailyEarnings: number;
  weeklyEarnings: number;
  completedJobsToday: number;
  rating: number;
  fairnessPriorityScore: number;
};

export type PickupRequest = {
  id: string;
  generatorId: string;
  generatorName: string;
  items: { type: string; weight: number }[];
  wasteType: string;
  estimatedWeight: number;
  finalWeight?: number;
  imageUrl?: string;
  address: string;
  location: Location;
  distanceKm?: number;
  preferredTime: string;
  urgency: "low" | "medium" | "high";
  status: "pending" | "accepted" | "on_the_way" | "picked_up" | "completed" | "cancelled" | "disputed";
  estimatedPrice: number;
  finalPrice?: number;
  paymentMode: "upi";
  matchedPickerId?: string;
  pickerName?: string;
  payoutAmount: number;
  createdAt: string;
  completedAt?: string;
};

export type Match = {
  id: string;
  pickupId: string;
  pickerId: string;
  fairMatchScore: number;
  distanceScore: number;
  wageScore: number;
  incomeBalanceScore: number;
  availabilityScore: number;
  reliabilityScore: number;
  explanation: string;
  status: "offered" | "accepted" | "rejected" | "expired";
};

export type Payment = {
  id: string;
  pickupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
  method: "upi";
  status: "completed" | "pending" | "failed";
  paidAt: string;
  notes?: string;
};

export type WalletTransaction = {
  id: string;
  userId: string;
  type: "credit" | "withdrawal";
  amount: number;
  description: string;
  timestamp: string;
  status: "completed" | "processing";
  referenceId: string;
};

export type Dispute = {
  id: string;
  pickupId: string;
  raisedBy: string;
  generatorName: string;
  reason: string;
  description: string;
  proofUrl?: string;
  status: "open" | "investigating" | "resolved";
  adminNote?: string;
  resolution?: string;
  createdAt: string;
};

export type Impact = {
  id: string;
  pickupId: string;
  generatorId: string;
  wasteKg: number;
  co2Saved: number;
  incomeGenerated: number;
  landfillAvoided: number;
  createdAt: string;
};

export type RecyclableRate = {
  material: string;
  pricePerKg: number;
  category: string;
  trend: "up" | "stable" | "down";
  benchmarkGovtRate: number;
};

// --- Standardized Scientific ESG Factor ---
export const CO2_PER_KG_RECYCLED = 1.5; // 1.5 kg CO2 saved per 1 kg diverted

// --- Standardized Municipal Macro Aggregates (Ward 150 Projected) ---
export const CITY_WIDE_STATS = {
  totalPickups: 8453,
  totalKgRecycled: 125000,
  totalWealthDisbursed: 4200000, // ₹42 Lakhs
  verifiedPickers: 343,
  activeWards: 1,
  co2OffsetTons: 187.5, // 125,000 * 1.5 / 1000
};

// --- Benchmark Scrap Rates ---
export const MOCK_RATES: RecyclableRate[] = [
  { material: "Plastic (PET Bottles)", pricePerKg: 16.0, category: "Polymers", trend: "up", benchmarkGovtRate: 14.0 },
  { material: "Cardboard & Paper", pricePerKg: 14.5, category: "Fibre", trend: "up", benchmarkGovtRate: 12.0 },
  { material: "Metal (Scrap Iron)", pricePerKg: 35.0, category: "Metals", trend: "stable", benchmarkGovtRate: 30.0 },
  { material: "E-Waste (Electronics)", pricePerKg: 50.0, category: "E-Waste", trend: "up", benchmarkGovtRate: 45.0 },
  { material: "Glass Containers", pricePerKg: 6.0, category: "Inorganics", trend: "stable", benchmarkGovtRate: 5.0 },
];

// --- Platform Users ---
export const MOCK_USERS: User[] = [
  { 
    id: "g1", 
    name: "Rajesh Kumar", 
    email: "rajesh.kumar@example.com", 
    phone: "+91 98765 43210", 
    role: "generator", 
    address: "12, 100ft Road, Indiranagar, Bengaluru", 
    location: { lat: 12.9716, lng: 77.5946 }, 
    trustScore: 4.9, 
    verificationStatus: "verified", 
    createdAt: "2026-01-10T10:00:00Z", 
    balance: 0,
    greenKarmaPoints: 1450
  },
  { 
    id: "g2", 
    name: "Anjali Gupta", 
    email: "anjali.gupta@example.com", 
    phone: "+91 98765 43211", 
    role: "generator", 
    address: "45, 80ft Road, Koramangala, Bengaluru", 
    location: { lat: 12.9352, lng: 77.6245 }, 
    trustScore: 4.7, 
    verificationStatus: "verified", 
    createdAt: "2026-02-15T12:30:00Z", 
    balance: 0,
    greenKarmaPoints: 850
  },
  { 
    id: "p1", 
    name: "Suresh (Picker)", 
    email: "suresh.mitra@recircle.org", 
    phone: "+91 98765 43212", 
    role: "picker", 
    address: "Koramangala Ward 150 Hub, Bengaluru", 
    location: { lat: 12.9352, lng: 77.6245 }, 
    trustScore: 4.9, 
    verificationStatus: "verified", 
    createdAt: "2025-11-20T08:00:00Z", 
    balance: 1450, // ₹2,800 earned this week - ₹1,350 withdrawn = ₹1,450 wallet balance
    greenKarmaPoints: 782
  },
  { 
    id: "p2", 
    name: "Ramesh (Picker)", 
    email: "ramesh.picker@recircle.org", 
    phone: "+91 98765 43213", 
    role: "picker", 
    address: "Jayanagar 4th Block, Bengaluru", 
    location: { lat: 12.9299, lng: 77.5834 }, 
    trustScore: 4.7, 
    verificationStatus: "verified", 
    createdAt: "2026-05-10T09:15:00Z", 
    balance: 850,
    greenKarmaPoints: 640
  },
  { 
    id: "a1", 
    name: "GreenEarth NGO Oversight", 
    email: "oversight@greenearth.org", 
    phone: "+91 98765 43214", 
    role: "admin", 
    address: "Ward 150 Governance Office, Bengaluru", 
    location: { lat: 12.9352, lng: 77.6245 }, 
    trustScore: 5.0, 
    verificationStatus: "verified", 
    createdAt: "2024-01-01T10:00:00Z", 
    balance: 0,
    greenKarmaPoints: 0
  },
];

// --- Waste Picker Profiles ---
export const MOCK_PICKERS: WastePicker[] = [
  {
    id: "wp1", 
    userId: "p1", 
    name: "Suresh Kumar",
    serviceAreas: ["Koramangala", "HSR Layout", "Indiranagar"], 
    materialsHandled: ["Plastic", "Cardboard", "Metal", "Glass"], 
    availability: "online", 
    currentLocation: { lat: 12.9352, lng: 77.6245 }, 
    dailyEarnings: 450, 
    weeklyEarnings: 2800, 
    completedJobsToday: 3, 
    rating: 4.9, 
    fairnessPriorityScore: 85
  },
  {
    id: "wp2", 
    userId: "p2", 
    name: "Ramesh Kumar",
    serviceAreas: ["Jayanagar", "JP Nagar", "BTM Layout"], 
    materialsHandled: ["Plastic", "Cardboard", "Glass", "Metal", "Electronics"], 
    availability: "online", 
    currentLocation: { lat: 12.9299, lng: 77.5834 }, 
    dailyEarnings: 368, 
    weeklyEarnings: 2150, 
    completedJobsToday: 1, 
    rating: 4.7, 
    fairnessPriorityScore: 92
  }
];

// --- Centralized Pickup Requests (Consistent Bangalore Locations) ---
export const MOCK_REQUESTS: PickupRequest[] = [
  {
    id: "req1", 
    generatorId: "g1", 
    generatorName: "Rajesh Kumar", 
    items: [{ type: "Cardboard", weight: 12 }],
    wasteType: "Cardboard & Paper", 
    estimatedWeight: 12, 
    address: "12, 100ft Road, Indiranagar, Bengaluru", 
    location: { lat: 12.9716, lng: 77.5946 }, 
    distanceKm: 0.8,
    preferredTime: "10:00 AM - 01:00 PM", 
    urgency: "medium", 
    status: "pending", 
    estimatedPrice: 174, 
    payoutAmount: 174,
    paymentMode: "upi",
    createdAt: "2026-10-10T08:00:00Z"
  },
  {
    id: "req2", 
    generatorId: "g2", 
    generatorName: "Anjali Gupta", 
    items: [{ type: "Plastic", weight: 5 }, { type: "Glass", weight: 3 }], 
    wasteType: "Plastic & Glass", 
    estimatedWeight: 8, 
    address: "45, 80ft Road, Koramangala, Bengaluru", 
    location: { lat: 12.9352, lng: 77.6245 }, 
    distanceKm: 0.4,
    preferredTime: "02:00 PM - 05:00 PM", 
    urgency: "high", 
    status: "accepted", 
    estimatedPrice: 125, 
    payoutAmount: 125,
    paymentMode: "upi",
    matchedPickerId: "p1", 
    pickerName: "Suresh (Picker)", 
    createdAt: "2026-10-10T09:30:00Z"
  },
  {
    id: "req3", 
    generatorId: "g1", 
    generatorName: "Rajesh Kumar", 
    items: [{ type: "Metal", weight: 10.5 }], 
    wasteType: "Metal & Scrap Iron", 
    estimatedWeight: 10.5, 
    finalWeight: 10.5,
    address: "12, 100ft Road, Indiranagar, Bengaluru", 
    location: { lat: 12.9716, lng: 77.5946 }, 
    distanceKm: 0.8,
    preferredTime: "Morning", 
    urgency: "low", 
    status: "completed", 
    estimatedPrice: 368, 
    finalPrice: 368, 
    payoutAmount: 368,
    paymentMode: "upi",
    matchedPickerId: "p2", 
    pickerName: "Ramesh (Picker)", 
    createdAt: "2026-10-09T10:00:00Z",
    completedAt: "2026-10-09T11:45:00Z"
  },
  {
    id: "req4", 
    generatorId: "g2", 
    generatorName: "Anjali Gupta", 
    items: [{ type: "Mixed", weight: 10 }], 
    wasteType: "Mixed Recyclables", 
    estimatedWeight: 10, 
    finalWeight: 10,
    address: "45, 80ft Road, Koramangala, Bengaluru", 
    location: { lat: 12.9352, lng: 77.6245 }, 
    distanceKm: 0.4,
    preferredTime: "08:00 AM", 
    urgency: "medium", 
    status: "completed", 
    estimatedPrice: 150, 
    finalPrice: 150, 
    payoutAmount: 150,
    paymentMode: "upi",
    matchedPickerId: "p1", 
    pickerName: "Suresh (Picker)", 
    createdAt: "2026-10-10T06:30:00Z",
    completedAt: "2026-10-10T07:45:00Z"
  },
  {
    id: "req5", 
    generatorId: "g1", 
    generatorName: "Society Villa 12", 
    items: [{ type: "Cardboard", weight: 12 }], 
    wasteType: "Cardboard & Paper", 
    estimatedWeight: 12, 
    finalWeight: 12,
    address: "Society Villa 12, Koramangala 4th Block", 
    location: { lat: 12.9340, lng: 77.6250 }, 
    distanceKm: 0.5,
    preferredTime: "09:00 AM", 
    urgency: "medium", 
    status: "completed", 
    estimatedPrice: 180, 
    finalPrice: 180, 
    payoutAmount: 180,
    paymentMode: "upi",
    matchedPickerId: "p1", 
    pickerName: "Suresh (Picker)", 
    createdAt: "2026-10-10T08:15:00Z",
    completedAt: "2026-10-10T09:10:00Z"
  },
  {
    id: "req6", 
    generatorId: "g2", 
    generatorName: "Green Heights Apt", 
    items: [{ type: "Plastic", weight: 8 }], 
    wasteType: "Plastic Bottles", 
    estimatedWeight: 8, 
    finalWeight: 8,
    address: "Green Heights 402, Koramangala", 
    location: { lat: 12.9360, lng: 77.6220 }, 
    distanceKm: 0.6,
    preferredTime: "10:30 AM", 
    urgency: "low", 
    status: "completed", 
    estimatedPrice: 120, 
    finalPrice: 120, 
    payoutAmount: 120,
    paymentMode: "upi",
    matchedPickerId: "p1", 
    pickerName: "Suresh (Picker)", 
    createdAt: "2026-10-10T10:00:00Z",
    completedAt: "2026-10-10T10:50:00Z"
  }
];

// --- Suresh's 3 completed jobs today sum: ₹150 + ₹180 + ₹120 = ₹450 ---

// --- Match Algorithm History ---
export const MOCK_MATCHES: Match[] = [
  {
    id: "m1", 
    pickupId: "req1", 
    pickerId: "p1", 
    fairMatchScore: 94, 
    distanceScore: 92, 
    wageScore: 98, 
    incomeBalanceScore: 95, 
    availabilityScore: 90, 
    reliabilityScore: 95, 
    explanation: "Prioritized due to close downhill proximity (0.8 km) and high reliability.", 
    status: "offered"
  }
];

// --- 100% Direct UPI Payments ---
export const MOCK_PAYMENTS: Payment[] = [
  { id: "pay1", pickupId: "req3", payerId: "g1", receiverId: "p2", amount: 368, method: "upi", status: "completed", paidAt: "2026-10-09T11:46:00Z", notes: "100% Direct UPI Settlement" },
  { id: "pay2", pickupId: "req4", payerId: "g2", receiverId: "p1", amount: 150, method: "upi", status: "completed", paidAt: "2026-10-10T07:46:00Z", notes: "100% Direct UPI Settlement" },
  { id: "pay3", pickupId: "req5", payerId: "g1", receiverId: "p1", amount: 180, method: "upi", status: "completed", paidAt: "2026-10-10T09:11:00Z", notes: "100% Direct UPI Settlement" },
  { id: "pay4", pickupId: "req6", payerId: "g2", receiverId: "p1", amount: 120, method: "upi", status: "completed", paidAt: "2026-10-10T10:51:00Z", notes: "100% Direct UPI Settlement" },
];

// --- Suresh's Reconciled Wallet Transaction Ledger ---
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx_104",
    userId: "p1",
    type: "credit",
    amount: 120,
    description: "UPI Direct Payout: Green Heights 402 (#req6)",
    timestamp: "10 Oct 2026, 10:51 AM",
    status: "completed",
    referenceId: "UPI/261010/88491"
  },
  {
    id: "tx_103",
    userId: "p1",
    type: "credit",
    amount: 180,
    description: "UPI Direct Payout: Society Villa 12 (#req5)",
    timestamp: "10 Oct 2026, 09:11 AM",
    status: "completed",
    referenceId: "UPI/261010/77219"
  },
  {
    id: "tx_102",
    userId: "p1",
    type: "credit",
    amount: 150,
    description: "UPI Direct Payout: Anjali Gupta (#req4)",
    timestamp: "10 Oct 2026, 07:46 AM",
    status: "completed",
    referenceId: "UPI/261010/66104"
  },
  {
    id: "tx_101",
    userId: "p1",
    type: "withdrawal",
    amount: 1350,
    description: "Instant Bank Transfer (HDFC A/C **8821)",
    timestamp: "09 Oct 2026, 06:30 PM",
    status: "completed",
    referenceId: "IMPS/261009/11942"
  },
  {
    id: "tx_100",
    userId: "p1",
    type: "credit",
    amount: 2350,
    description: "Prior Week Verified Collections",
    timestamp: "08 Oct 2026, 05:00 PM",
    status: "completed",
    referenceId: "UPI/261008/55021"
  }
];

// --- Formal Arbitration Dispute Cases ---
export const MOCK_DISPUTES: Dispute[] = [
  {
    id: "d1", 
    pickupId: "req2", 
    raisedBy: "g2", 
    generatorName: "Anjali Gupta",
    reason: "Weight Calibration Verification", 
    description: "Digital scale measured 8.0 kg vs estimated 8.5 kg. Fair floor price adjustment requested.", 
    status: "open", 
    adminNote: "NGO field arbiter assigned to verify calibrated scale receipt.",
    createdAt: "2026-10-10T09:45:00Z"
  }
];

// --- Environmental & Socio-Economic Impacts ---
export const MOCK_IMPACTS: Impact[] = [
  { id: "imp1", pickupId: "req3", generatorId: "g1", wasteKg: 10.5, co2Saved: 15.75, incomeGenerated: 368, landfillAvoided: 10.5, createdAt: "2026-10-09T11:45:00Z" },
  { id: "imp2", pickupId: "req4", generatorId: "g2", wasteKg: 10.0, co2Saved: 15.00, incomeGenerated: 150, landfillAvoided: 10.0, createdAt: "2026-10-10T07:45:00Z" },
  { id: "imp3", pickupId: "req5", generatorId: "g1", wasteKg: 12.0, co2Saved: 18.00, incomeGenerated: 180, landfillAvoided: 12.0, createdAt: "2026-10-10T09:10:00Z" },
  { id: "imp4", pickupId: "req6", generatorId: "g2", wasteKg: 8.0, co2Saved: 12.00, incomeGenerated: 120, landfillAvoided: 8.0, createdAt: "2026-10-10T10:50:00Z" },
];

export const MOCK_ANALYTICS = [
  { name: 'Jan', plastic: 400, cardboard: 240, glass: 240 },
  { name: 'Feb', plastic: 300, cardboard: 139, glass: 221 },
  { name: 'Mar', plastic: 200, cardboard: 980, glass: 229 },
  { name: 'Apr', plastic: 278, cardboard: 390, glass: 200 },
  { name: 'May', plastic: 189, cardboard: 480, glass: 218 },
  { name: 'Jun', plastic: 239, cardboard: 380, glass: 250 },
  { name: 'Jul', plastic: 349, cardboard: 430, glass: 210 },
];
