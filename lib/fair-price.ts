export type MaterialType = 'Paper' | 'Cardboard' | 'Plastic' | 'Metal' | 'Glass' | 'E-waste' | 'Mixed recyclables' | string;
export type SortingDifficulty = 'low' | 'medium' | 'high';
export type UrgencyLevel = 'normal' | 'urgent';

export interface FairPriceBreakdown {
  basePrice: number;
  travelCompensation: number;
  sortingCompensation: number;
  urgencyBonus: number;
  finalFairPrice: number;
  explanation: string;
}

const MATERIAL_RATES: Record<string, number> = {
  'paper': 8,
  'cardboard': 10,
  'plastic': 12,
  'metal': 35,
  'glass': 5,
  'e-waste': 50,
  'electronics': 50, // alias
  'mixed recyclables': 7,
};

export function calculateFairPrice(
  material: MaterialType,
  weight: number,
  distanceKm: number,
  sortingDifficulty: SortingDifficulty,
  urgency: UrgencyLevel
): FairPriceBreakdown {
  
  // 1. Base Price
  const normalizedMaterial = material.toLowerCase().trim();
  const ratePerKg = MATERIAL_RATES[normalizedMaterial] || 7; // Default to mixed recyclables rate if unknown
  const basePrice = ratePerKg * weight;

  // 2. Travel Compensation
  const travelCompensation = distanceKm * 5;

  // 3. Sorting Compensation
  let sortingCompensation = 0;
  switch (sortingDifficulty) {
    case 'low': sortingCompensation = 5; break;
    case 'medium': sortingCompensation = 15; break;
    case 'high': sortingCompensation = 30; break;
  }

  // 4. Urgency Bonus
  const urgencyBonus = urgency === 'urgent' ? 20 : 0;

  // 5. Total
  const finalFairPrice = basePrice + travelCompensation + sortingCompensation + urgencyBonus;

  // 6. Explanation
  const explanation = `Fair price of ₹${finalFairPrice.toFixed(0)} calculated based on ${weight}kg of ${material} (₹${basePrice.toFixed(0)}), plus logistics: ₹${travelCompensation.toFixed(0)} for ${distanceKm.toFixed(1)}km travel, ₹${sortingCompensation} for ${sortingDifficulty} sorting difficulty, and a ₹${urgencyBonus} urgency bonus. 100% of this goes to the waste-picker.`;

  return {
    basePrice,
    travelCompensation,
    sortingCompensation,
    urgencyBonus,
    finalFairPrice,
    explanation,
  };
}
