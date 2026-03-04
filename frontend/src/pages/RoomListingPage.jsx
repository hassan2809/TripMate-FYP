import React from "react";
import Navbar from "../components/Navbar";
import RoomListingForm from "../components/RoomListing";
import { CheckCircle2 } from "lucide-react";

const RoomListingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              List Your Space and Start Earning
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Join thousands of hosts making the most of their extra space
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-8 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Create Your Room Listing
              </h2>
              <p className="opacity-90">
                Fill in the details below to get started with your listing
              </p>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start">
                <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Pro Tip:</span> Listings with
                  clear photos and detailed descriptions get up to 3x more
                  inquiries. Be sure to highlight all amenities and nearby
                  attractions!
                </p>
              </div>
              <RoomListingForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomListingPage;
