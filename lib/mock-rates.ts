export type RecyclableRate = {
  id: string;
  material: string;
  marketRate: number;
  fairRate: number;
  sortingDifficulty: "low" | "medium" | "high";
  demandLevel: "low" | "normal" | "high";
  lastUpdated: string;
};

export const MOCK_RATES: RecyclableRate[] = [
  { id: "r1", material: "Paper", marketRate: 6, fairRate: 8, sortingDifficulty: "low", demandLevel: "normal", lastUpdated: "2026-10-01" },
  { id: "r2", material: "Cardboard", marketRate: 8, fairRate: 10, sortingDifficulty: "low", demandLevel: "high", lastUpdated: "2026-10-05" },
  { id: "r3", material: "Plastic", marketRate: 9, fairRate: 12, sortingDifficulty: "medium", demandLevel: "high", lastUpdated: "2026-10-08" },
  { id: "r4", material: "Metal", marketRate: 30, fairRate: 35, sortingDifficulty: "medium", demandLevel: "normal", lastUpdated: "2026-10-01" },
  { id: "r5", material: "Glass", marketRate: 3, fairRate: 5, sortingDifficulty: "high", demandLevel: "low", lastUpdated: "2026-09-15" },
  { id: "r6", material: "E-waste", marketRate: 40, fairRate: 50, sortingDifficulty: "high", demandLevel: "high", lastUpdated: "2026-10-09" },
  { id: "r7", material: "Mixed", marketRate: 5, fairRate: 7, sortingDifficulty: "high", demandLevel: "normal", lastUpdated: "2026-09-20" },
];
