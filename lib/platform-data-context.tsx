"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  MOCK_REQUESTS, 
  MOCK_PICKERS, 
  MOCK_USERS, 
  MOCK_DISPUTES, 
  MOCK_PAYMENTS,
  PickupRequest, 
  WastePicker, 
  User, 
  Dispute, 
  Payment 
} from "./mock-data";
import { MOCK_RATES, RecyclableRate } from "./mock-rates";
import { toast } from "sonner";

interface PlatformDataContextType {
  requests: PickupRequest[];
  pickers: WastePicker[];
  users: User[];
  disputes: Dispute[];
  payments: Payment[];
  rates: RecyclableRate[];

  // Real-time Action Dispatchers
  addPickupRequest: (request: PickupRequest) => void;
  acceptPickupRequest: (requestId: string, pickerId: string, pickerName: string) => void;
  startPickupRoute: (requestId: string) => void;
  confirmPickupWeighed: (requestId: string, finalWeight: number, finalPrice: number) => void;
  cancelPickup: (requestId: string, reason?: string) => void;
  reschedulePickup: (requestId: string, newTime: string) => void;
  ratePicker: (requestId: string, rating: number, tip?: number) => void;
  reassignPickup: (requestId: string, newPickerId: string) => void;
  forceMatchPickup: (requestId: string) => void;
  resolveDispute: (disputeId: string, outcome: string, notes: string) => void;
  verifyUser: (userId: string) => void;
  rejectUser: (userId: string, reason: string) => void;
  updateMaterialRate: (rateId: string, fairRate: number, marketRate: number, difficulty?: string, demand?: string) => void;
  withdrawPickerBalance: (userId: string, amount: number) => void;
  resetToDefaults: () => void;
}

const PlatformDataContext = createContext<PlatformDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  REQUESTS: "recircle_requests_v3",
  PICKERS: "recircle_pickers_v3",
  USERS: "recircle_users_v3",
  DISPUTES: "recircle_disputes_v3",
  PAYMENTS: "recircle_payments_v3",
  RATES: "recircle_rates_v3",
};

export function PlatformDataProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<PickupRequest[]>(MOCK_REQUESTS);
  const [pickers, setPickers] = useState<WastePicker[]>(MOCK_PICKERS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [rates, setRates] = useState<RecyclableRate[]>(MOCK_RATES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedRequests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      const savedPickers = localStorage.getItem(STORAGE_KEYS.PICKERS);
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const savedDisputes = localStorage.getItem(STORAGE_KEYS.DISPUTES);
      const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      const savedRates = localStorage.getItem(STORAGE_KEYS.RATES);

      if (savedRequests) setRequests(JSON.parse(savedRequests));
      if (savedPickers) setPickers(JSON.parse(savedPickers));
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedDisputes) setDisputes(JSON.parse(savedDisputes));
      if (savedPayments) setPayments(JSON.parse(savedPayments));
      if (savedRates) setRates(JSON.parse(savedRates));
    } catch (e) {
      console.error("Error loading persisted data", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
      localStorage.setItem(STORAGE_KEYS.PICKERS, JSON.stringify(pickers));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(disputes));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));

      // Keep in-memory mock variables in sync as well
      MOCK_REQUESTS.length = 0;
      MOCK_REQUESTS.push(...requests);
      MOCK_PICKERS.length = 0;
      MOCK_PICKERS.push(...pickers);
      MOCK_USERS.length = 0;
      MOCK_USERS.push(...users);
      MOCK_DISPUTES.length = 0;
      MOCK_DISPUTES.push(...disputes);
      MOCK_PAYMENTS.length = 0;
      MOCK_PAYMENTS.push(...payments);
      MOCK_RATES.length = 0;
      MOCK_RATES.push(...rates);

      // Broadcast custom event for cross-component real-time sync
      window.dispatchEvent(new CustomEvent("recircle-data-sync", {
        detail: { timestamp: Date.now() }
      }));
    } catch (e) {
      console.error("Error persisting data", e);
    }
  }, [requests, pickers, users, disputes, payments, rates, isHydrated]);

  // Listen for storage events across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.REQUESTS && e.newValue) setRequests(JSON.parse(e.newValue));
      if (e.key === STORAGE_KEYS.PICKERS && e.newValue) setPickers(JSON.parse(e.newValue));
      if (e.key === STORAGE_KEYS.DISPUTES && e.newValue) setDisputes(JSON.parse(e.newValue));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Action 1: Add new pickup request (Generator -> Real-Time Picker Radar)
  const addPickupRequest = useCallback((newReq: PickupRequest) => {
    setRequests(prev => [newReq, ...prev]);
    toast.success("Pickup scheduled and broadcast to nearby verified waste pickers in real-time!");
  }, []);

  // Action 2: Accept pickup request (Picker -> Generator Timeline)
  const acceptPickupRequest = useCallback((requestId: string, pickerId: string, pickerName: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: "accepted",
          matchedPickerId: pickerId,
          pickerName: pickerName,
        };
      }
      return r;
    }));

    setPickers(prev => prev.map(p => {
      if (p.id === pickerId || p.userId === pickerId) {
        return {
          ...p,
          completedJobsToday: (p.completedJobsToday || 0) + 1,
        };
      }
      return p;
    }));

    toast.success(`Job accepted! Matched with ${pickerName}`);
  }, []);

  // Action 3: Start pickup navigation route
  const startPickupRoute = useCallback((requestId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: "on_the_way",
        };
      }
      return r;
    }));
    toast.info("Status updated: On the way to pickup location 🚚");
  }, []);

  // Action 4: Confirm weight & finalize payout (Picker -> Instant UPI Payout to Picker)
  const confirmPickupWeighed = useCallback((requestId: string, finalWeight: number, finalPrice: number) => {
    let reqObj: PickupRequest | undefined;

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        reqObj = {
          ...r,
          status: "completed",
          finalWeight,
          finalPrice,
          completedAt: new Date().toISOString(),
        };
        return reqObj;
      }
      return r;
    }));

    // Create payment entry
    if (reqObj) {
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        pickupId: requestId,
        payerId: reqObj.generatorId || "g1",
        receiverId: reqObj.matchedPickerId || "p1",
        amount: finalPrice,
        method: "upi",
        status: "completed",
        paidAt: new Date().toISOString(),
        notes: `100% Direct Fair Wage for ${finalWeight} kg ${reqObj.wasteType}`,
      };
      setPayments(prev => [newPayment, ...prev]);

      // Credit picker metrics
      setPickers(prev => prev.map(p => {
        if (p.id === reqObj?.matchedPickerId || p.userId === reqObj?.matchedPickerId || p.name === reqObj?.pickerName || p.id === "p1") {
          return {
            ...p,
            dailyEarnings: (p.dailyEarnings || 450) + finalPrice,
            weeklyEarnings: (p.weeklyEarnings || 2850) + finalPrice,
            completedJobsToday: (p.completedJobsToday || 0) + 1,
          };
        }
        return p;
      }));

      // Update User balances:
      // - Waste Picker (Suresh) receives 100% direct UPI balance credit
      // - Citizen Generator (Rajesh) earns Green Karma Points
      setUsers(prev => prev.map(u => {
        if (u.id === "p1" || u.id === reqObj?.matchedPickerId || u.name === reqObj?.pickerName || u.role === "picker") {
          return {
            ...u,
            balance: (u.balance || 1450) + finalPrice,
          };
        }
        if (u.id === "g1" || u.id === reqObj?.generatorId || u.name === reqObj?.generatorName) {
          return {
            ...u,
            greenKarmaPoints: (u.greenKarmaPoints || 1450) + Math.round(finalWeight * 2),
          };
        }
        return u;
      }));
    }

    toast.success(`Weight confirmed (${finalWeight} kg). ₹${finalPrice} disbursed directly to Suresh's UPI Wallet!`);
  }, []);

  // Action 4b: Withdraw picker balance
  const withdrawPickerBalance = useCallback((userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId || (userId === "p1" && u.role === "picker")) {
        return {
          ...u,
          balance: Math.max(0, (u.balance || 1450) - amount),
        };
      }
      return u;
    }));
  }, []);

  // Action 5: Cancel pickup
  const cancelPickup = useCallback((requestId: string, reason?: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: "cancelled",
        };
      }
      return r;
    }));
    toast.error(reason ? `Pickup cancelled: ${reason}` : "Pickup cancelled.");
  }, []);

  // Action 6: Reschedule pickup
  const reschedulePickup = useCallback((requestId: string, newTime: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          preferredTime: newTime,
        };
      }
      return r;
    }));
    toast.success(`Pickup rescheduled for ${newTime}`);
  }, []);

  // Action 7: Rate picker and add tip
  const ratePicker = useCallback((requestId: string, rating: number, tip: number = 0) => {
    const req = requests.find(r => r.id === requestId);
    if (req && req.matchedPickerId) {
      setPickers(prev => prev.map(p => {
        if (p.id === req.matchedPickerId || p.name === req.pickerName) {
          return {
            ...p,
            rating: Number(((p.rating * 4 + rating) / 5).toFixed(1)),
            dailyEarnings: p.dailyEarnings + tip,
          };
        }
        return p;
      }));
    }
    toast.success(`Feedback submitted! ⭐ ${rating} Stars${tip > 0 ? ` + ₹${tip} tip added` : ""}`);
  }, [requests]);

  // Action 8: Admin reassign pickup
  const reassignPickup = useCallback((requestId: string, newPickerId: string) => {
    const chosenPicker = pickers.find(p => p.id === newPickerId);
    if (!chosenPicker) return;

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          matchedPickerId: chosenPicker.id,
          pickerName: chosenPicker.name,
          status: "accepted",
        };
      }
      return r;
    }));
    toast.success(`Reassigned #${requestId.replace("req", "")} to ${chosenPicker.name}`);
  }, [pickers]);

  // Action 9: Force match
  const forceMatchPickup = useCallback((requestId: string) => {
    const bestPicker = pickers[0];
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          matchedPickerId: bestPicker.id,
          pickerName: bestPicker.name,
          status: "accepted",
        };
      }
      return r;
    }));
    toast.success(`Algorithmic match enforced with ${bestPicker.name}`);
  }, [pickers]);

  // Action 10: Resolve dispute
  const resolveDispute = useCallback((disputeId: string, outcome: string, notes: string) => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          status: "resolved",
        };
      }
      return d;
    }));

    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
      setRequests(prev => prev.map(r => {
        if (r.id === dispute.pickupId) {
          return {
            ...r,
            status: "completed",
          };
        }
        return r;
      }));
    }

    toast.success(`Dispute #${disputeId} officially resolved! Outcome: ${outcome}`);
  }, [disputes]);

  // Action 11: Verify user ID
  const verifyUser = useCallback((userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: "verified" } : u));
    toast.success("User identity certified!");
  }, []);

  // Action 12: Reject user ID
  const rejectUser = useCallback((userId: string, reason: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: "rejected" } : u));
    toast.error(`Verification rejected: ${reason}`);
  }, []);

  // Action 13: Update material rate
  const updateMaterialRate = useCallback((rateId: string, fairRate: number, marketRate: number, difficulty?: string, demand?: string) => {
    setRates(prev => prev.map(r => {
      if (r.id === rateId) {
        return {
          ...r,
          fairRate,
          marketRate,
          sortingDifficulty: (difficulty as any) || r.sortingDifficulty,
          demandLevel: (demand as any) || r.demandLevel,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return r;
    }));
    toast.success("Fair Price Board calibrated!");
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setRequests(MOCK_REQUESTS);
    setPickers(MOCK_PICKERS);
    setUsers(MOCK_USERS);
    setDisputes(MOCK_DISPUTES);
    setPayments(MOCK_PAYMENTS);
    setRates(MOCK_RATES);
    try {
      localStorage.clear();
    } catch (e) {}
    toast.info("Reset all platform data to initial state.");
  }, []);

  return (
    <PlatformDataContext.Provider
      value={{
        requests,
        pickers,
        users,
        disputes,
        payments,
        rates,
        addPickupRequest,
        acceptPickupRequest,
        startPickupRoute,
        confirmPickupWeighed,
        cancelPickup,
        reschedulePickup,
        ratePicker,
        reassignPickup,
        forceMatchPickup,
        resolveDispute,
        verifyUser,
        rejectUser,
        updateMaterialRate,
        withdrawPickerBalance,
        resetToDefaults,
      }}
    >
      {children}
    </PlatformDataContext.Provider>
  );
}

export function usePlatformData() {
  const context = useContext(PlatformDataContext);
  if (!context) {
    throw new Error("usePlatformData must be used within a PlatformDataProvider");
  }
  return context;
}
