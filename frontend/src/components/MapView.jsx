import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * MapView Component
 * Displays interactive Leaflet map with user and donor locations
 */
const MapView = ({ userLocation, donors, selectedDonor }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const donorMarkers = useRef([]);
  const routeLayer = useRef(null);
  const routeAbortController = useRef(null);
  const [routeSummary, setRouteSummary] = useState(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    if (routeAbortController.current) {
      routeAbortController.current.abort();
      routeAbortController.current = null;
    }

    if (routeLayer.current) {
      map.current.removeLayer(routeLayer.current);
      routeLayer.current = null;
    }
    setRouteSummary(null);

    if (!userLocation || !selectedDonor) return;

    const controller = new AbortController();
    routeAbortController.current = controller;

    const fetchRoute = async () => {
      try {
        const startLng = userLocation.longitude;
        const startLat = userLocation.latitude;
        const endLng = selectedDonor.longitude;
        const endLat = selectedDonor.latitude;

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Route service error (${response.status})`);
        }

        const data = await response.json();
        const route = data?.routes?.[0];
        const geometry = route?.geometry?.coordinates;

        if (!route || !Array.isArray(geometry) || geometry.length < 2) {
          throw new Error("No route returned");
        }

        const latLngs = geometry.map(([lng, lat]) => [lat, lng]);

        routeLayer.current = L.polyline(latLngs, {
          color: "#1d4ed8",
          weight: 5,
          opacity: 0.92,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map.current);

        const routeBounds = routeLayer.current.getBounds();
        if (routeBounds.isValid()) {
          map.current.fitBounds(routeBounds.pad(0.12));
        }

        setRouteSummary({
          distanceKm: route.distance ? (route.distance / 1000).toFixed(1) : null,
          durationMin: route.duration ? Math.max(1, Math.round(route.duration / 60)) : null,
        });
      } catch (error) {
        if (error.name === "AbortError") return;

        const fallbackLine = L.polyline(
          [
            [userLocation.latitude, userLocation.longitude],
            [selectedDonor.latitude, selectedDonor.longitude],
          ],
          {
            color: "#1d4ed8",
            weight: 4,
            opacity: 0.8,
            dashArray: "8 10",
          }
        ).addTo(map.current);

        routeLayer.current = fallbackLine;
        const fallbackBounds = fallbackLine.getBounds();
        if (fallbackBounds.isValid()) {
          map.current.fitBounds(fallbackBounds.pad(0.12));
        }

        setRouteSummary({
          distanceKm: null,
          durationMin: null,
        });
      }
    };

    fetchRoute();

    return () => {
      controller.abort();
    };
  }, [selectedDonor, userLocation]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    if (userMarker.current) {
      map.current.removeLayer(userMarker.current);
    }
    donorMarkers.current.forEach((marker) => {
      map.current.removeLayer(marker);
    });
    donorMarkers.current = [];

    // Add user location marker
    if (userLocation) {
      userMarker.current = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .bindPopup("<b>Your Location</b><br>Patient")
        .addTo(map.current);

      // Pan to user location
      map.current.setView([userLocation.latitude, userLocation.longitude], 13);
    }

    // Add donor markers
    donors.forEach((donor) => {
      const marker = L.marker([donor.latitude, donor.longitude], {
        icon: L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      })
        .bindPopup(
          `<b>${donor.name}</b><br>Blood: ${donor.blood_group}<br>Phone: ${donor.phone}<br>Distance: ${donor.distance} km`
        )
        .addTo(map.current);

      donorMarkers.current.push(marker);
    });

    // Fit bounds to show all markers when no travel route is active
    if (donors.length > 0 && userLocation && !selectedDonor) {
      const group = new L.featureGroup([userMarker.current, ...donorMarkers.current]);
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [userLocation, donors, selectedDonor]);

  useEffect(() => {
    if (!selectedDonor || !map.current) return;

    const selectedMarker = donorMarkers.current.find((marker) => {
      const pos = marker.getLatLng();
      return (
        Math.abs(pos.lat - selectedDonor.latitude) < 0.000001 &&
        Math.abs(pos.lng - selectedDonor.longitude) < 0.000001
      );
    });

    if (selectedMarker) {
      map.current.setView([selectedDonor.latitude, selectedDonor.longitude], 14, {
        animate: true,
        duration: 0.8,
      });
      selectedMarker.openPopup();
    }
  }, [selectedDonor]);

  return (
    <motion.div
      className="surface-3d relative w-full h-full rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {routeSummary && (
        <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded-xl border border-white/50 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.24em] text-blue-700">Route</div>
          <div className="mt-1 flex gap-3">
            <span>Blue line</span>
            {routeSummary.distanceKm && <span>{routeSummary.distanceKm} km</span>}
            {routeSummary.durationMin && <span>{routeSummary.durationMin} min</span>}
          </div>
        </div>
      )}
      <div
        ref={mapContainer}
        className="w-full"
        style={{ display: "flex", height: "min(72vh, 620px)" }}
      />
    </motion.div>
  );
};

export default MapView;
