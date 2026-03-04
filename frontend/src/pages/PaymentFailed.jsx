import React from "react";
import { XCircle, RefreshCw, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PaymentCancelled = () => {
  return (
    <div>
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 flex-shrink-0">
        <Navbar />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Cancelled Icon */}
          <div className="mx-auto mb-8 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <XCircle className="w-12 h-12 text-orange-600" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Payment Cancelled
          </h1>

          <p className="text-xl text-blue-100 mb-8">
            Your payment process was cancelled
          </p>

          {/* Cancelled Message */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-orange-400" />
              <p className="text-lg font-medium text-white">
                Payment Cancelled
              </p>
            </div>
            <p className="text-blue-100">
              No charges were made to your account. You can continue booking whenever you're ready.
            </p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <XCircle className="w-6 h-6 text-orange-300 mx-auto mb-2" />
              <p className="text-sm text-blue-100">No Charges Made</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <RefreshCw className="w-6 h-6 text-blue-200 mx-auto mb-2" />
              <p className="text-sm text-blue-100">Try Again</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <ArrowLeft className="w-6 h-6 text-blue-200 mx-auto mb-2" />
              <p className="text-sm text-blue-100">Go Back</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              className="w-full md:w-auto bg-white text-blue-900 hover:bg-blue-50 font-medium px-8 py-3"
              onClick={() => window.history.back()}
            >
              Complete Booking
            </Button>
            <Button
              variant="outline"
              className="w-full md:w-auto border-white text-black hover:bg-white/10 font-medium px-8 py-3"
              onClick={() => (window.location.href = "/accomodation")}
            >
              Browse Other Rooms
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentCancelled;