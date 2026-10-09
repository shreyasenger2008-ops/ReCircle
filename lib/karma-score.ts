export interface KarmaProfile {
  score: number; // 300 to 900
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  tierColor: string;
  totalKgRecycled: number;
  totalPickupsCompleted: number;
  onTimePunctualityPercent: number;
  weightAccuracyPercent: number;
  zeroContaminationScore: number;
  unlockedLoanAmount: number;
  microLoanInterestRate: number; // e.g. 2% subsidized
  badges: KarmaBadge[];
}

export interface KarmaBadge {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface HealthFundClaim {
  id: string;
  pickerId: string;
  pickerName: string;
  type: "injury" | "illness" | "equipment_damage";
  title: string;
  amount: number;
  description: string;
  status: "approved" | "disbursed" | "pending";
  date: string;
}

export const INITIAL_KARMA_PROFILE: KarmaProfile = {
  score: 782,
  tier: "Gold",
  tierColor: "text-amber-500 bg-amber-50 border-amber-200",
  totalKgRecycled: 1420,
  totalPickupsCompleted: 58,
  onTimePunctualityPercent: 96,
  weightAccuracyPercent: 98,
  zeroContaminationScore: 94,
  unlockedLoanAmount: 25000,
  microLoanInterestRate: 2.0,
  badges: [
    {
      id: "b1",
      title: "Century Diverter",
      titleHi: "1 टन कबाड़ रक्षक",
      description: "Diverted over 1,000 kg of recyclables from landfills",
      icon: "🌍",
      unlocked: true,
      unlockedAt: "2026-02-14",
    },
    {
      id: "b2",
      title: "Pure Sort Champion",
      titleHi: "शुद्ध छँटाई मास्टर",
      description: "Maintained >95% zero-contamination sorting record",
      icon: "✨",
      unlocked: true,
      unlockedAt: "2026-03-01",
    },
    {
      id: "b3",
      title: "Flash Responder",
      titleHi: "तेज़ सेवा योद्धा",
      description: "Arrived within 20 mins for 25 consecutive pickups",
      icon: "⚡",
      unlocked: true,
      unlockedAt: "2026-03-20",
    },
    {
      id: "b4",
      title: "E-Waste Specialist",
      titleHi: "ई-कचरा विशेषज्ञ",
      description: "Certified for safe electronic and battery handling",
      icon: "🔋",
      unlocked: false,
    },
  ],
};

export const MOCK_HEALTH_CLAIMS: HealthFundClaim[] = [
  {
    id: "clm-101",
    pickerId: "p1",
    pickerName: "Suresh (Picker)",
    type: "injury",
    title: "Glass Cut First-Aid Clinic Visit",
    amount: 850,
    description: "Emergency stitch & tetanus injection from broken glass bottle during collection.",
    status: "disbursed",
    date: "2026-03-28",
  },
  {
    id: "clm-102",
    pickerId: "p2",
    pickerName: "Ramesh (Picker)",
    type: "equipment_damage",
    title: "Pushcart Axle Emergency Welder",
    amount: 1200,
    description: "Cart wheel bearing snapped on steep road, instant repair aid disbursed.",
    status: "disbursed",
    date: "2026-04-02",
  },
];

export let SURAKSHA_HEALTH_POOL_BALANCE = 54200; // in INR
