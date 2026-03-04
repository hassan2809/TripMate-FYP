import React from "react";
import Navbar from "../components/Navbar";
import TourPlan from "../components/TourPlan";
import {
  Compass,
  Calendar,
  CreditCard,
  Users,
  MapPin,
  Clock,
} from "lucide-react";

const TourPlanPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with gradient background */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar className="text-white" />

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Plan Your Perfect Journey
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Create a personalized tour plan, manage your budget, and organize
              your itinerary all in one place.
            </p>
            <div className="flex justify-center space-x-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="text-sm">Choose Destination</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="text-sm">Plan Itinerary</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <CreditCard className="h-6 w-6" />
                </div>
                <span className="text-sm">Set Budget</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-sm">Invite Friends</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tour plan form card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-16">
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  Tour Details
                </h2>
                <p className="text-blue-700">
                  Fill in the details to create your perfect tour
                </p>
              </div>
              <Compass className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          {/* TourPlan component */}
          <div className="px-2 py-4">
            <TourPlan />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourPlanPage;
