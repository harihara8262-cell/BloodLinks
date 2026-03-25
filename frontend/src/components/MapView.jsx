import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * MapView Component
 * Displays interactive Leaflet map with user and donor locations
 */
const MapView = ({ userLocation, donors }) => {
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
    donors.forEach((donor, index) => {
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

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <div
        ref={mapContainer}
        className="w-full h-96"
        style={{ display: "flex", height: "400px" }}
      />
    </div>
  );
};

export default MapView;
