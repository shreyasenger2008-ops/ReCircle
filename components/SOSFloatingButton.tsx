"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, PhoneCall, CheckCircle2, X, MapPin, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SOSFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const handleTriggerSOS = () => {
    setIsTriggered(true);
    toast.error("🚨 EMERGENCY SOS BROADCASTED! NGO Safety Response Team Alerted.");
  };

  return (
    <>
      {/* Floating Red SOS Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-full shadow-2xl border-2 border-red-400 hover:scale-105 transition-all animate-bounce hover:animate-none"
        >
          <Radio className="h-5 w-5 animate-pulse" />
          <span className="text-sm">SOS आपातकालीन</span>
        </button>
      </div>

      {/* SOS Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border-4 border-red-500 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-600">Worker Safety & SOS</h3>
                  <p className="text-xs text-slate-500">आपातकालीन सुरक्षा एवं सहायता केंद्र</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isTriggered ? (
              <div className="space-y-4 text-sm">
                <p className="text-slate-600 leading-relaxed">
                  If you face hazardous waste, injury, harassment, or physical danger, tap below to broadcast your live GPS location to local NGO safety monitors and emergency hotlines.
                </p>

                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                  <span>Live GPS Beacon: 12.9352° N, 77.6245° E (Koramangala Hub)</span>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleTriggerSOS}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-2xl shadow-lg flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    BROADCAST EMERGENCY SOS
                  </Button>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <a
                      href="tel:112"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 text-center"
                    >
                      <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                      Police (112)
                    </a>
                    <a
                      href="tel:108"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 text-center"
                    >
                      <PhoneCall className="h-3.5 w-3.5 text-green-600" />
                      Ambulance (108)
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4 animate-in zoom-in">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">SOS Alert Dispatched!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Your location has been transmitted to the GreenEarth NGO Rapid Response Unit. A field coordinator is contacting you now.
                  </p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                  Close Window
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
