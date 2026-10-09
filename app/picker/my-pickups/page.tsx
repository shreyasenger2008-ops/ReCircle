"use client";

import { useAuth } from "@/lib/auth-context";
import MyPickupsList from "@/components/MyPickupsList";

export default function PickerMyPickups() {
  const { user } = useAuth();

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Job History & Active Pickups</h2>
        <p className="text-slate-500">Manage your active route and view completed jobs.</p>
      </div>
      
      <MyPickupsList user={user} />
    </div>
  );
}