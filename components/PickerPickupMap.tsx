"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/lib/language-context";
import { PickupRequest } from "@/lib/mock-data";

interface PickerPickupMapProps {
  pickups: PickupRequest[];
  pickerLocation: { lat: number; lng: number };
  onAcceptPickup: (id: string) => void;
  height?: string;
}

export default function PickerPickupMap({
  pickups = [],
  pickerLocation = { lat: 12.935, lng: 77.624 },
  onAcceptPickup,
  height = "480px"
}: PickerPickupMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { lang } = useLanguage();

  const getEmoji = (type: string) => {
    const l = (type || "").toLowerCase();
    if (l.includes("plastic")) return "🧴";
    if (l.includes("cardboard") || l.includes("paper")) return "📦";
    if (l.includes("metal") || l.includes("scrap")) return "🔩";
    if (l.includes("e-waste") || l.includes("electronic")) return "🔌";
    if (l.includes("glass")) return "🍾";
    return "♻️";
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [pickerLocation.lat, pickerLocation.lng],
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Free OpenStreetMap Standard Tiles - 100% Free, No API Key Required
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const boundsPoints: [number, number][] = [[pickerLocation.lat, pickerLocation.lng]];

    // 1. Add Picker's Live Location Beacon Marker
    const pickerIconHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background: #2563eb; color: white; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 800; white-space: nowrap; margin-bottom: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1.5px solid white;">
          🚶 ${lang === "hi" ? "आप यहाँ हैं" : lang === "kn" ? "ನೀವು ಇಲ್ಲಿದ್ದೀರಿ" : "You (Suresh)"}
        </div>
        <div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 6px rgba(59,130,246,0.35); animation: pulse 2s infinite;"></div>
      </div>
    `;

    const pickerIcon = L.divIcon({
      className: "custom-picker-location-marker",
      html: pickerIconHtml,
      iconSize: [80, 50],
      iconAnchor: [40, 40],
    });

    L.marker([pickerLocation.lat, pickerLocation.lng], { icon: pickerIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; font-size: 12px;">
          <strong>🚶 ${lang === "hi" ? "सफाई मित्र लाइव जीपीएस" : "Worker Live GPS Position"}</strong><br/>
          <span style="color: #64748b;">${pickerLocation.lat.toFixed(4)}° N, ${pickerLocation.lng.toFixed(4)}° E</span>
        </div>
      `);

    // 2. Add Pickup Pins
    pickups.forEach((pickup) => {
      const lat = pickup.location?.lat || pickerLocation.lat + (Math.random() - 0.5) * 0.02;
      const lng = pickup.location?.lng || pickerLocation.lng + (Math.random() - 0.5) * 0.02;
      boundsPoints.push([lat, lng]);

      const emoji = getEmoji(pickup.wasteType);
      const price = Math.round(pickup.estimatedPrice || pickup.payoutAmount || 150);

      const pinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #059669; color: white; padding: 2px 7px; border-radius: 8px; font-size: 11px; font-weight: 900; box-shadow: 0 3px 8px rgba(5,150,105,0.4); border: 2px solid white; margin-bottom: 2px; white-space: nowrap;">
            ₹${price}
          </div>
          <div style="width: 32px; height: 32px; background: white; border-radius: 50%; border: 3px solid #059669; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
            ${emoji}
          </div>
        </div>
      `;

      const pinIcon = L.divIcon({
        className: "custom-pickup-radar-marker",
        html: pinHtml,
        iconSize: [60, 60],
        iconAnchor: [30, 50],
      });

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="background: #ecfdf5; color: #065f46; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1px solid #a7f3d0;">
              ${emoji} ${pickup.wasteType}
            </span>
            <strong style="color: #059669; font-size: 15px; font-weight: 900;">₹${price}</strong>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${pickup.generatorName}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px; line-height: 1.3;">
            📍 ${pickup.address}
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 8px; font-size: 11px; margin-bottom: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
            <span>⚖️ <strong>${pickup.estimatedWeight} kg</strong></span>
            <span>🕒 <strong>${pickup.preferredTime || "Today"}</strong></span>
          </div>
          <button 
            id="map-accept-btn-${pickup.id}"
            style="width: 100%; background: #0f172a; color: white; border: none; padding: 8px 12px; border-radius: 10px; font-weight: 800; font-size: 12px; cursor: pointer;"
          >
            ✅ ${lang === "hi" ? "पिकअप स्वीकार करें" : lang === "kn" ? "ಪಿಕಪ್ ಸ್ವೀಕರಿಸಿ" : "Accept Pickup"}
          </button>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map).bindPopup(popupHtml);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`map-accept-btn-${pickup.id}`);
        if (btn) {
          btn.onclick = () => {
            onAcceptPickup(pickup.id);
          };
        }
      });
    });

    if (boundsPoints.length > 1) {
      const bounds = L.latLngBounds(boundsPoints);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [pickups, pickerLocation, lang, onAcceptPickup]);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: "100%", zIndex: 1 }} />
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-800 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{pickups.length} {lang === "hi" ? "लाइव पिन उपलब्ध" : lang === "kn" ? "ಲೈವ್ ಪಿನ್‌ಗಳು" : "Active Radar Pins"}</span>
      </div>
    </div>
  );
}
