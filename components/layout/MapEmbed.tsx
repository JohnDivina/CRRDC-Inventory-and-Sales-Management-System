"use client";

// components/layout/MapEmbed.tsx
// Interactive Google Maps visual tile map for the RET Complex, CLSU.
// Must be dynamically imported (no SSR) because Leaflet requires `window`.

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";

const RET_COORDS: LatLngTuple = [15.728834897932666, 120.92756303784827];
const ZOOM = 17;

// Forces map to properly resize/redraw once mounted inside a flex/grid container.
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export default function MapEmbed() {
  // Fix Leaflet's default icon paths being broken in webpack/Next.js
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require("leaflet");
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <MapContainer
      center={RET_COORDS}
      zoom={ZOOM}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
      className="leaflet-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>'
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
      />
      <Marker position={RET_COORDS}>
        <Popup>
          <strong>CRRDC – RET Complex</strong>
          <br />
          Central Luzon State University
          <br />
          Science City of Muñoz, Nueva Ecija
        </Popup>
      </Marker>
      <MapResizer />
    </MapContainer>
  );
}
