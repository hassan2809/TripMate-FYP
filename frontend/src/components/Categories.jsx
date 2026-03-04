import React from "react";
import Category1 from './assets/category1.png';
import Category2 from './assets/category2.png';

const Categories = () => {
  return (
    // <section className="bg-white py-16">
      <div className="container mx-auto text-center py-16">
        <p className="text-blue-600 uppercase font-semibold">Category</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-2">
          We Offer Best Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
          {/* Guided Tours */}
          <div className="text-center p-6 bg-white lg:hover:rounded-lg lg:hover:shadow-lg">
            <div className="flex justify-center mb-4">
              <img
                src={Category1}
                alt="Guided Tours"
                className="h-12 w-12"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Guided Tours</h3>
            <p className="text-sm text-gray-500 mt-2">
              sunt qui repellat saepe quo velit operiam id aliquam placeat.
            </p>
          </div>

          {/* Best Flights Options */}
          <div className="text-center p-6 bg-white lg:hover:rounded-lg lg:hover:shadow-lg">
            <div className="flex justify-center mb-4">
              <img
                src={Category2}
                alt="Best Flights Options"
                className="h-12 w-12"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              Tour Plan
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              sunt qui repellat saepe quo velit operiam id aliquam placeat.
            </p>
            {/* <div className="absolute -left-4 bottom-4 h-8 w-8 bg-orange-100 rounded-full"></div> */}
          </div>

          {/* Religious Tours */}
          <div className="text-center p-6 bg-white lg:hover:rounded-lg lg:hover:shadow-lg">
            <div className="flex justify-center mb-4">
              <img
                src={Category1}
                alt="Religious Tours"
                className="h-12 w-12"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              Religious Tours
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              sunt qui repellat saepe quo velit operiam id aliquam placeat.
            </p>
          </div>

          {/* Medical Insurance */}
          <div className="text-center p-6 bg-white lg:hover:rounded-lg lg:hover:shadow-lg">
            <div className="flex justify-center mb-4">
              <img
                src={Category2}
                alt="Medical Insurance"
                className="h-12 w-12"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              Best Accomodation
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              sunt qui repellat saepe quo velit operiam id aliquam placeat.
            </p>
          </div>
        </div>
      </div>
    // </section>
  );
};

export default Categories;
