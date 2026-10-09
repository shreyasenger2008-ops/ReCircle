"use client";

import { useAuth } from "@/lib/auth-context";
import MyPickupsList from "@/components/MyPickupsList";

export default function GeneratorMyPickups() {
  const { user } = useAuth();

  if (!user || user.role !== "generator") {
    return <div className="p-8">Unauthorized.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Pickups</h2>
        <p className="text-slate-500">Track and manage your recycling history.</p>
      </div>
      
      <MyPickupsList user={user} />
    </div>
  );
}