import React from "react";
import Navbar from "../components/Navbar";
import Accomodation from "../components/Accomodation";

const AccommodationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
        {/* Hero Section */}
        <div className="container px-4 flex flex-col justify-center items-center py-16 text-white">
          <h1 className="text-5xl md:text-5xl font-bold mb-4">
            Discover Your Perfect Stay
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-center max-w-2xl opacity-90">
            Unwind in style and comfort with our handpicked accommodations,
            crafted for unforgettable experiences.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-12 -mt-12 relative z-20">
          <Accomodation />
        </div>
      </div>
    </div>
  );
};

export default AccommodationPage;
