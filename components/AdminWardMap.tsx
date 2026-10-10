"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface WardActivity {
  id: string;
  name: string;
  wardNo: number;
  lat: number;
  lng: number;
  pickupsToday: number;
  activePickers: number;
  volumeKg: number;
  status: "high" | "normal" | "low";
}

const WARDS_DATA: WardActivity[] = [
  { id: "w150", name: "Bellandur / Green Glen", wardNo: 150, lat: 12.9298, lng: 77.6748, pickupsToday: 48, activePickers: 14, volumeKg: 520, status: "high" },
  { id: "w151", name: "Koramangala 4th Block", wardNo: 151, lat: 12.9352, lng: 77.6245, pickupsToday: 34, activePickers: 9, volumeKg: 380, status: "normal" },
  { id: "w152", name: "Indiranagar 100ft Rd", wardNo: 152, lat: 12.9719, lng: 77.6412, pickupsToday: 29, activePickers: 8, volumeKg: 310, status: "normal" },
  { id: "w174", name: "HSR Layout Sector 2", wardNo: 174, lat: 12.9116, lng: 77.6389, pickupsToday: 42, activePickers: 11, volumeKg: 460, status: "high" },
  { id: "w175", name: "BTM Layout 2nd Stage", wardNo: 175, lat: 12.9166, lng: 77.6101, pickupsToday: 18, activePickers: 5, volumeKg: 190, status: "low" },
];

export default function AdminWardMap({ onSelectWard }: { onSelectWard?: (ward: WardActivity) => void }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.9352, 77.635],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    WARDS_DATA.forEach((ward) => {
      const bgColor = ward.status === "high" ? "#10b981" : ward.status === "normal" ? "#3b82f6" : "#f59e0b";
      
      // Add circle radius
      L.circle([ward.lat, ward.lng], {
        radius: ward.status === "high" ? 1200 : 800,
        color: bgColor,
        fillColor: bgColor,
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: "custom-ward-marker",
        html: `
          <div style="
            background-color: ${bgColor};
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 11px;
            border: 2.5px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          ">
            W${ward.wardNo}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 2px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 4px;">Ward ${ward.wardNo}: ${ward.name}</div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5;">
            <div>📦 <strong>${ward.pickupsToday}</strong> Pickups Today</div>
            <div>👷 <strong>${ward.activePickers}</strong> Active Pickers</div>
            <div>⚖️ <strong>${ward.volumeKg} kg</strong> Recycled Volume</div>
          </div>
        </div>
      `;

      const marker = L.marker([ward.lat, ward.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

      marker.on("click", () => {
        if (onSelectWard) onSelectWard(ward);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onSelectWard]);

  return (
    <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 z-0 relative">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
