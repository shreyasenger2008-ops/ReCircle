import { WastePicker, User, PickupRequest } from "./mock-data";

export interface MatchScoreDetails {
  pickerId: string;
  pickerName: string;
  rating: number;
  verificationStatus: string;
  distanceKm: number;
  distanceScore: number;
  wageScore: number;
  incomeBalanceScore: number;
  availabilityScore: number;
  reliabilityScore: number;
  finalFairMatchScore: number;
  explanation: string;
}

// Haversine formula to calculate distance between two coordinates
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

export function findFairMatch(
  request: PickupRequest,
  pickers: WastePicker[],
  users: User[]
): MatchScoreDetails | null {
  if (pickers.length === 0) return null;

  let bestMatch: MatchScoreDetails | null = null;

  const candidateScores: MatchScoreDetails[] = pickers.map(picker => {
    const user = users.find(u => u.id === picker.userId);
    const pickerName = user ? user.name : "Unknown Picker";

    // 1. Distance Score (Closer = Higher)
    const distanceKm = getDistance(
      request.location.lat, request.location.lng,
      picker.currentLocation.lat, picker.currentLocation.lng
    );
    const distanceScore = Math.max(0, 100 - (distanceKm * 10)); // 0km = 100, 10km+ = 0

    // 2. Wage / Expertise Score (Relevant materials = Boost)
    // Assume wasteType might contain words like "Plastic", "Cardboard"
    let expertiseMatches = 0;
    picker.materialsHandled.forEach(material => {
      if (request.wasteType.toLowerCase().includes(material.toLowerCase())) {
        expertiseMatches += 1;
      }
    });
    const wageScore = expertiseMatches > 0 ? 100 : 50;

    // 3. Income Balance Score (Lower earnings = Higher score)
    // Targeting ₹1000 as a theoretical healthy daily wage cap for scoring
    const incomeBalanceScore = Math.max(0, 100 - (picker.dailyEarnings / 10));

    // 4. Availability Score (Online = 100, Busy = 40, Offline = 0)
    let availabilityScore = 0;
    if (picker.availability === "online") availabilityScore = 100;
    else if (picker.availability === "busy") availabilityScore = 40;

    // 5. Reliability Score (Rating + Trust Score)
    const trustScore = user ? user.trustScore : 4.0;
    // (4.5 rating / 5) * 50 + (4.8 trust / 5) * 50
    const reliabilityScore = ((picker.rating / 5) * 50) + ((trustScore / 5) * 50);

    // Calculate Final Weighted Score
    const finalFairMatchScore = 
      (0.25 * distanceScore) + 
      (0.25 * wageScore) + 
      (0.20 * incomeBalanceScore) + 
      (0.15 * availabilityScore) + 
      (0.15 * reliabilityScore);

    // Generate Explanation
    const reasons = [];
    if (distanceScore > 80) reasons.push("is nearby");
    if (availabilityScore === 100) reasons.push("is available");
    if (expertiseMatches > 0) reasons.push(`is experienced with ${request.wasteType} pickups`);
    if (incomeBalanceScore > 70) reasons.push("has received fewer earning opportunities today");
    if (reliabilityScore > 85) reasons.push("has a highly reliable rating");

    const explanation = `${pickerName} was selected because they ${reasons.join(", ")}.`;

    return {
      pickerId: picker.id,
      pickerName,
      rating: picker.rating,
      verificationStatus: user ? user.verificationStatus : "pending",
      distanceKm,
      distanceScore,
      wageScore,
      incomeBalanceScore,
      availabilityScore,
      reliabilityScore,
      finalFairMatchScore,
      explanation
    };
  });

  // Find the picker with the highest score
  candidateScores.forEach(score => {
    if (!bestMatch || score.finalFairMatchScore > bestMatch.finalFairMatchScore) {
      bestMatch = score;
    }
  });

  return bestMatch;
}
