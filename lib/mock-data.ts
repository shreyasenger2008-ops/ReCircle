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
  balance: number; // Extended for UI compatibility
};

export type WastePicker = {
  id: string;
  userId: string;
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

// Adapted to support the UI expectation of multiple items, while fulfilling the prompt's request for wasteType/estimatedWeight
export type PickupRequest = {
  id: string;
  generatorId: string;
  generatorName?: string; // Extended for UI compatibility
  items: { type: string; weight: number }[]; // Extended for UI compatibility
  wasteType: string;
  estimatedWeight: number;
  finalWeight?: number;
  imageUrl?: string;
  address: string;
  location: Location;
  preferredTime: string;
  urgency: "low" | "medium" | "high";
  status: "pending" | "accepted" | "on_the_way" | "picked_up" | "completed" | "cancelled" | "disputed";
  estimatedPrice: number;
  finalPrice?: number;
  paymentMode?: "upi" | "cash";
  matchedPickerId?: string;
  pickerName?: string; // Extended for UI compatibility
  payoutAmount: number; // Extended for UI compatibility (same as estimatedPrice/finalPrice)
  createdAt: string;
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
  method: "cash" | "upi" | "bank_transfer";
  status: "pending" | "completed" | "failed";
  paidAt?: string;
};

export type Dispute = {
  id: string;
  pickupId: string;
  raisedBy: string;
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
  wasteKg: number;
  co2Saved: number;
  incomeGenerated: number;
  landfillAvoided: number;
  createdAt: string;
};

export type RecyclableRate = {
  material: string;
  pricePerKg: number;
};

export const MOCK_RATES: RecyclableRate[] = [
  { material: "Plastic", pricePerKg: 15 },
  { material: "Cardboard", pricePerKg: 10 },
  { material: "Glass", pricePerKg: 5 },
  { material: "Electronics", pricePerKg: 50 },
  { material: "Metal", pricePerKg: 35 },
];

export const MOCK_USERS: User[] = [
  { 
    id: "g1", name: "Rajesh Kumar", email: "rajesh@example.com", phone: "+91-9876543210", 
    role: "generator", address: "12, MG Road, Bengaluru", location: { lat: 12.9716, lng: 77.5946 }, 
    trustScore: 4.8, verificationStatus: "verified", createdAt: "2026-01-10T10:00:00Z", balance: 0 
  },
  { 
    id: "g2", name: "Anjali Gupta", email: "anjali@example.com", phone: "+91-9876543211", 
    role: "generator", address: "45, Indiranagar, Bengaluru", location: { lat: 12.9784, lng: 77.6408 }, 
    trustScore: 4.5, verificationStatus: "verified", createdAt: "2026-02-15T12:30:00Z", balance: 0 
  },
  { 
    id: "p1", name: "Suresh (Picker)", email: "suresh@example.com", phone: "+91-9876543212", 
    role: "picker", address: "Koramangala, Bengaluru", location: { lat: 12.9352, lng: 77.6245 }, 
    trustScore: 4.9, verificationStatus: "verified", createdAt: "2025-11-20T08:00:00Z", balance: 1450.0 
  },
  { 
    id: "p2", name: "Ramesh (Picker)", email: "ramesh@example.com", phone: "+91-9876543213", 
    role: "picker", address: "Jayanagar, Bengaluru", location: { lat: 12.9299, lng: 77.5834 }, 
    trustScore: 4.2, verificationStatus: "pending", createdAt: "2026-05-10T09:15:00Z", balance: 850.0 
  },
  { 
    id: "a1", name: "NGO Admin - GreenEarth", email: "admin@greenearth.org", phone: "+91-9876543214", 
    role: "admin", address: "Central Office, Bengaluru", location: { lat: 12.9716, lng: 77.5946 }, 
    trustScore: 5.0, verificationStatus: "verified", createdAt: "2024-01-01T10:00:00Z", balance: 0 
  },
];

export const MOCK_PICKERS: WastePicker[] = [
  {
    id: "wp1", userId: "p1", serviceAreas: ["Koramangala", "HSR Layout"], 
    materialsHandled: ["Plastic", "Cardboard", "Metal"], availability: "online", 
    currentLocation: { lat: 12.9352, lng: 77.6245 }, dailyEarnings: 450, weeklyEarnings: 2800, 
    completedJobsToday: 3, rating: 4.8, fairnessPriorityScore: 85
  },
  {
    id: "wp2", userId: "p2", serviceAreas: ["Jayanagar", "JP Nagar"], 
    materialsHandled: ["Plastic", "Cardboard", "Glass", "Electronics"], availability: "online", 
    currentLocation: { lat: 12.9299, lng: 77.5834 }, dailyEarnings: 200, weeklyEarnings: 1500, 
    completedJobsToday: 1, rating: 4.1, fairnessPriorityScore: 92 // High priority due to low earnings
  }
];

export const MOCK_REQUESTS: PickupRequest[] = [
  {
    id: "req1", generatorId: "g1", generatorName: "Rajesh Kumar", 
    items: [{ type: "Plastic", weight: 5 }, { type: "Cardboard", weight: 2 }],
    wasteType: "Mixed Recyclables", estimatedWeight: 7, address: "12, MG Road, Bengaluru", 
    location: { lat: 12.9716, lng: 77.5946 }, preferredTime: "Morning", urgency: "medium", 
    status: "pending", estimatedPrice: 95, payoutAmount: 95, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: "req2", generatorId: "g2", generatorName: "Anjali Gupta", 
    items: [{ type: "Electronics", weight: 2 }], wasteType: "E-Waste", estimatedWeight: 2, 
    address: "45, Indiranagar, Bengaluru", location: { lat: 12.9784, lng: 77.6408 }, 
    preferredTime: "Evening", urgency: "high", status: "accepted", estimatedPrice: 100, payoutAmount: 100,
    matchedPickerId: "p1", pickerName: "Suresh (Picker)", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: "req3", generatorId: "g1", generatorName: "Rajesh Kumar", 
    items: [{ type: "Metal", weight: 10 }], wasteType: "Scrap Metal", estimatedWeight: 10, finalWeight: 10.5,
    address: "12, MG Road, Bengaluru", location: { lat: 12.9716, lng: 77.5946 }, 
    preferredTime: "Anytime", urgency: "low", status: "completed", estimatedPrice: 350, finalPrice: 367.5, payoutAmount: 367.5,
    matchedPickerId: "p2", pickerName: "Ramesh (Picker)", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

export const MOCK_MATCHES: Match[] = [
  {
    id: "m1", pickupId: "req1", pickerId: "p2", fairMatchScore: 92, distanceScore: 85, 
    wageScore: 98, incomeBalanceScore: 95, availabilityScore: 90, reliabilityScore: 88, 
    explanation: "Selected due to low recent earnings, prioritizing income fairness.", status: "offered"
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: "pay1", pickupId: "req3", payerId: "g1", receiverId: "p2", amount: 367.5, method: "upi", status: "completed", paidAt: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString() }
];

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: "d1", pickupId: "req2", raisedBy: "g2", reason: "Delayed Pickup", 
    description: "Picker did not arrive at the agreed time.", status: "open", 
    createdAt: new Date().toISOString()
  }
];

export const MOCK_IMPACTS: Impact[] = [
  { id: "imp1", pickupId: "req3", wasteKg: 10.5, co2Saved: 21.0, incomeGenerated: 367.5, landfillAvoided: 10.5, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString() }
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
