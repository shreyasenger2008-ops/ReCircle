"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useLanguage } from "@/lib/language-context";
import { Navigation } from "lucide-react";

export interface MapStop {
  id: string;
  name: string;
  address: string;
  wasteType: string;
  weight: number;
  payout: number;
  elevation: number;
  lat: number;
  lng: number;
  isStart?: boolean;
  isFinish?: boolean;
}

interface LiveRouteMapProps {
  stops?: MapStop[];
  height?: string;
  zoom?: number;
}

export default function LiveRouteMap({ stops = [], height = "400px", zoom = 14 }: LiveRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { lang } = useLanguage();
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter: [number, number] = stops.length > 0 
      ? [stops[0].lat, stops[0].lng] 
      : [12.935, 77.624];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    const latLngs: [number, number][] = [];

    stops.forEach((stop, index) => {
      latLngs.push([stop.lat, stop.lng]);

      let iconHtml = "";
      if (stop.isStart) {
        iconHtml = `
          <div style="background: #0f172a; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            🚩
          </div>
        `;
      } else if (stop.isFinish) {
        iconHtml = `
          <div style="background: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; border: 3px solid white; box-shadow: 0 4px 10px rgba(5,150,105,0.4);">
            🏁
          </div>
        `;
      } else {
        iconHtml = `
          <div style="background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; border: 3px solid white; box-shadow: 0 4px 10px rgba(16,185,129,0.4);">
            ${index}
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px; min-width: 170px;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            ${stop.isStart ? (lang === "hi" ? "शुरुआत (शीर्ष)" : "Start (Hilltop)") : stop.isFinish ? (lang === "hi" ? "समापन डिपो" : "Scrap Depot") : stop.name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${stop.address}</div>
          ${!stop.isStart && !stop.isFinish ? `
            <div style="background: #f1f5f9; padding: 6px 8px; border-radius: 8px; font-size: 11px; margin-bottom: 6px;">
              <div><strong>${lang === "hi" ? "कचरा" : "Waste"}:</strong> ${stop.wasteType} (+${stop.weight}kg)</div>
              <div style="color: #059669; font-weight: 700; margin-top: 2px;"><strong>${lang === "hi" ? "कमाई" : "Payout"}:</strong> ₹${stop.payout}</div>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; font-weight: 600;">
            <span>⛰️ Elev: ${stop.elevation}m</span>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 700;">Google Maps ↗</a>
          </div>
        </div>
      `;

      L.marker([stop.lat, stop.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    if (stops.length >= 2) {
      const coordinatesString = stops.map(s => `${s.lng},${s.lat}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.code === "Ok" && data.routes?.[0]?.geometry?.coordinates) {
            const routeCoordinates = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            const polyline = L.polyline(routeCoordinates, {
              color: "#059669",
              weight: 5,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);

            setRouteInfo({
              distanceKm: Number((data.routes[0].distance / 1000).toFixed(1)),
              durationMin: Math.round(data.routes[0].duration / 60),
            });

            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
          } else {
            const fallbackPolyline = L.polyline(latLngs, {
              color: "#10b981",
              weight: 4,
              opacity: 0.8,
              dashArray: "6, 8",
            }).addTo(map);
            map.fitBounds(fallbackPolyline.getBounds(), { padding: [40, 40] });
          }
        })
        .catch(() => {
          const fallbackPolyline = L.polyline(latLngs, {
            color: "#10b981",
            weight: 4,
            opacity: 0.8,
            dashArray: "6, 8",
          }).addTo(map);
          map.fitBounds(fallbackPolyline.getBounds(), { padding: [40, 40] });
        });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [stops, lang, zoom]);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: "100%", zIndex: 1 }} />

      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-700">
          <Navigation className="h-4 w-4" />
          <span>{routeInfo ? `${routeInfo.distanceKm} km OSRM Route` : (lang === "hi" ? "स्मार्ट डाउनहिल रूट" : "Downhill Smart Route")}</span>
        </div>
        {routeInfo && (
          <span className="text-[11px] text-slate-500 font-semibold">
            ~{routeInfo.durationMin} min
          </span>
        )}
      </div>

      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[11px] font-bold text-slate-700 flex items-center gap-3">
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-900"></span> {lang === "hi" ? "शुरुआत" : "Start"}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span> {lang === "hi" ? "पिकअप" : "Pickup"}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-700"></span> {lang === "hi" ? "डिपो" : "Depot"}</span>
      </div>
    </div>
  );
}
