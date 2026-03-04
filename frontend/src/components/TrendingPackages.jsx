import React, { useState, useEffect } from "react";
import Cities from './assets/cities.jpg';
import Flag from './assets/flag.jpg';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TrendingPackages = () => {
    const [tours, setTours] = useState([])
    const navigate = useNavigate();

    const fetchListings = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/tour/getTourPackages');
            if (response.data.success) {
                setTours(response.data.data.slice(0,3));
            }
        } catch (error) {
            console.error("Error fetching listings:", error);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);
    
    return (
        <div className="px-6 pb-16 lg:px-0 container mx-auto">
            <div className="text-center mb-10">
                <p className="text-blue-600 uppercase tracking-widest font-semibold">Trendy</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                    Our Trending Tour Packages
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((pkg) => (
                    <div
                        key={pkg._id}
                        className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                        <img src={Cities} alt={pkg.destination} className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-800 capitalize">{pkg.destination}</h3>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                                <p>{pkg.numberOfDays} Days</p>
                                <p>{pkg.companions.length} People Going</p>
                            </div>
                            <div className="flex items-center gap-2 text-red-500 font-bold text-xl mt-4">
                                {pkg.price}{" "}
                                <span className="text-gray-400 text-sm line-through">{pkg.originalPrice}</span>
                            </div>
                            <p className="text-gray-600 text-sm mt-2">
                                Nam exercitationem commodi et ducimus quis in dolore animi sit.
                            </p>
                            <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition" onClick={() => navigate(`/tour/${pkg._id}`)}>
                                Explore Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingPackages;
