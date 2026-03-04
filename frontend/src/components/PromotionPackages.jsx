import React from "react";
import Nature from './assets/nature.jpg';
import Cities from './assets/cities.jpg';

const PromotionPackages = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-full">
      {/* Card 1 - Explore Nature */}
      <div className="relative h-[200px] md:h-[300px]">
        <img
          src={Nature} // Replace with Nature Image URL
          alt="Explore Nature"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <p className="text-white text-sm uppercase tracking-widest">Promotion</p>
          <h2 className="text-white text-3xl md:text-4xl font-bold mt-2">
            Explore Nature
          </h2>
          <button className="mt-4 px-6 py-2 bg-white text-gray-800 font-medium rounded-full shadow-lg hover:bg-gray-100">
            View Packages
          </button>
        </div>
      </div>

      {/* Card 2 - Explore Cities */}
      <div className="relative h-[200px] md:h-[300px]">
        <img
          src={Cities} // Replace with City Image URL
          alt="Explore Cities"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          <p className="text-white text-sm uppercase tracking-widest">Promotion</p>
          <h2 className="text-white text-3xl md:text-4xl font-bold mt-2">
            Explore Cities
          </h2>
          <button className="mt-4 px-6 py-2 bg-white text-gray-800 font-medium rounded-full shadow-lg hover:bg-gray-100">
            View Packages
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionPackages;
