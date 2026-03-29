import React, { memo } from "react";
import { motion } from "framer-motion";
import AnimatedButton from "./AnimatedButton";

/**
 * DonorCard Component
 * Displays a single donor's information in a card format
 */
const DonorCard = ({ donor, onCall, onViewMap }) => {
  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      "A+": "bg-red-100 text-red-800",
      "A-": "bg-red-200 text-red-900",
      "B+": "bg-blue-100 text-blue-800",
      "B-": "bg-blue-200 text-blue-900",
      "AB+": "bg-purple-100 text-purple-800",
      "AB-": "bg-purple-200 text-purple-900",
      "O+": "bg-yellow-100 text-yellow-800",
      "O-": "bg-yellow-200 text-yellow-900",
    };
    return colors[bloodGroup] || "bg-gray-100 text-gray-800";
  };

  return (
    <motion.div
      className="surface-3d app-card"
      layoutId={`donor-${donor.id}`}
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold text-gray-800">{donor.name}</h3>
          <p className="mt-0.5 text-sm text-gray-600">{donor.city}</p>
        </div>
        <span className={`app-chip ${getBloodGroupColor(donor.blood_group)}`}>
          {donor.blood_group}
        </span>
      </div>

      <div className="mb-4 grid gap-3">
        <div className="app-panel flex items-start p-3 text-gray-700">
          <svg className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V8M10.5 1.5v5.75h5.75" />
          </svg>
          <span className="text-sm leading-snug">{donor.address}</span>
        </div>

        <div className="app-panel flex items-center p-3 text-gray-700">
          <svg className="mr-2 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.482 1.448 1.4 2.915 2.683 4.198 1.283 1.283 2.75 2.201 4.198 2.683l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <a href={`tel:${donor.phone}`} className="text-blue-600 hover:underline font-semibold">
            {donor.phone}
          </a>
        </div>

        {donor.distance && (
          <div className="app-panel flex items-center p-3 text-green-700">
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">{donor.distance} km away</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AnimatedButton
          onClick={() => onCall(donor)}
          className="app-pill-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200"
        >
          📞 Call
        </AnimatedButton>
        <AnimatedButton
          onClick={() => onViewMap?.(donor)}
          className="app-pill-btn w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200"
        >
          🗺️ Map
        </AnimatedButton>
      </div>
    </motion.div>
  );
};

export default memo(DonorCard);
