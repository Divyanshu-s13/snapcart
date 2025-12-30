"use client";

import { useEffect, useMemo } from "react";
import { Marker, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";

interface DraggableMarkerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}

export default function DraggableMarker({ position, setPosition }: DraggableMarkerProps) {
  const map = useMap();

  const markerIcon = useMemo(() => {
    return new L.Icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  }, []);

  useEffect(() => {
    if (position) {
      map.setView(position as LatLngExpression, 15, { animate: true });
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable={true}
      icon={markerIcon}
      eventHandlers={{
        dragend: (event: L.LeafletEvent) => {
          const marker = event.target as L.Marker;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
        },
      }}
    />
  );
}
