import React, { useEffect, useRef } from "react";
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

    // Fit bounds to show all markers
    if (donors.length > 0 && userLocation) {
      const group = new L.featureGroup([userMarker.current, ...donorMarkers.current]);
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [userLocation, donors]);

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
      className="surface-3d w-full h-full rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        ref={mapContainer}
        className="w-full"
        style={{ display: "flex", height: "min(72vh, 620px)" }}
      />
    </motion.div>
  );
};

export default MapView;
