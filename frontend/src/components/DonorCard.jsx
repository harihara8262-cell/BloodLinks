import React from "react";

/**
 * DonorCard Component
 * Displays a single donor's information in a card format
 */
const DonorCard = ({ donor, onCall }) => {
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{donor.name}</h3>
          <p className="text-sm text-gray-600">{donor.city}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBloodGroupColor(donor.blood_group)}`}>
          {donor.blood_group}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-700">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V8M10.5 1.5v5.75h5.75" />
          </svg>
          <span className="text-sm">{donor.address}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.482 1.448 1.4 2.915 2.683 4.198 1.283 1.283 2.75 2.201 4.198 2.683l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <a href={`tel:${donor.phone}`} className="text-blue-600 hover:underline font-semibold">
            {donor.phone}
          </a>
        </div>

        {donor.distance && (
          <div className="flex items-center text-green-700">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">{donor.distance} km away</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onCall(donor)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        📞 Call Donor
      </button>
    </div>
  );
};

export default DonorCard;
