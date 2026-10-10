"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PickupRequest } from "@/lib/mock-data";

interface AdminDispatchMapProps {
  pickups: PickupRequest[];
  onSelectPickup: (pickup: PickupRequest) => void;
}

export default function AdminDispatchMap({ pickups, onSelectPickup }: AdminDispatchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.9352, 77.635],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    pickups.forEach((p) => {
      const lat = p.location?.lat || 12.9352;
      const lng = p.location?.lng || 77.6245;

      const color = 
        p.status === "completed" ? "#10b981" :
        p.status === "on_the_way" ? "#3b82f6" :
        p.status === "accepted" ? "#8b5cf6" :
        p.status === "disputed" ? "#ef4444" : "#f59e0b";

      const emoji = p.wasteType.toLowerCase().includes("metal") ? "🥫" :
                    p.wasteType.toLowerCase().includes("paper") ? "📦" :
                    p.wasteType.toLowerCase().includes("e-waste") ? "💻" : "🧴";

      const customIcon = L.divIcon({
        className: "custom-dispatch-pin",
        html: `
          <div style="
            background-color: ${color};
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            cursor: pointer;
          ">
            ${emoji}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 2px; min-width: 190px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: monospace; font-weight: 800; font-size: 12px; color: #0f172a;">#${p.id.replace("req", "")}</span>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${p.status.replace("_", " ")}</span>
          </div>
          <div style="font-weight: 700; font-size: 12px; color: #0f172a;">${p.wasteType} (${p.estimatedWeight} kg)</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${p.address}</div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 6px; font-size: 11px; color: #334155; line-height: 1.4;">
            <div>👤 <strong>Generator:</strong> ${p.generatorName}</div>
            <div>👷 <strong>Picker:</strong> ${p.pickerName || "Unassigned"}</div>
            <div style="color: #059669; font-weight: 800; margin-top: 2px;">💰 Payout: ₹${p.finalPrice || p.estimatedPrice}</div>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on("click", () => {
        onSelectPickup(p);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [pickups, onSelectPickup]);

  return (
    <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200 z-0 relative">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
