import React from "react";
import Destination from './assets/booking.jpg';

const Bookings = () => {
  return (
    <div className="container mx-auto flex flex-col md:flex-row justify-around items-center py-16 px-6 md:px-0 ">
      {/* Left Section */}
      <div className="flex flex-col gap-6 max-w-lg mb-5 md:mb-0">
        <h2 className="text-md font-bold text-gray-800 text-left">
          Fast & Easy <br />
          <span className="text-blue-900 text-3xl md:text-4xl">Get Your Favourite Resort Bookings</span>
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-500 text-white flex items-center justify-center rounded-full flex-shrink-0">
              📍
            </div>
            <div className="text-left">
              <h3 className="text-md font-bold text-gray-800">Choose Destination</h3>
              <p className="text-gray-600 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Urna, tortor tempus.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-500 text-white flex items-center justify-center rounded-full flex-shrink-0">
              ✅
            </div>
            <div className="text-left">
              <h3 className="text-md font-bold text-gray-800">Check Availability</h3>
              <p className="text-gray-600 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Urna, tortor tempus.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full flex-shrink-0">
              ✈️
            </div>
            <div className="text-left">
              <h3 className="text-md font-bold text-gray-800">Let's Go</h3>
              <p className="text-gray-600 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Urna, tortor tempus.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="">
        <img
          src={Destination}
          alt="Couple"
          className="w-full md:w-[50vw]"
        />
      </div>
    </div>
  );
};

export default Bookings;
