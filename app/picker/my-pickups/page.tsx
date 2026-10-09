"use client";

import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import MyPickupsList from "@/components/MyPickupsList";
import SOSFloatingButton from "@/components/SOSFloatingButton";

export default function PickerMyPickups() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  if (!user || user.role !== "picker") {
    return <div className="p-8">Unauthorized.</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-2xl font-bold text-slate-900">
          {lang === "hi" ? "कार्य इतिहास व सक्रिय पिकअप" : "Job History & Active Pickups"}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {lang === "hi" ? "अपने सक्रिय रूट का प्रबंधन करें और पूरे किए गए काम देखें।" : "Manage your active route and view completed jobs."}
        </p>
      </div>
      
      <MyPickupsList user={user} />
      <SOSFloatingButton />
    </div>
  );
}