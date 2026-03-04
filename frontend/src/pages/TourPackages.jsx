import React, { useState, useEffect } from "react";
import Picture from "../components/assets/cities.jpg";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TourPackages = () => {
  const [tours, setTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
  const UNSPLASH_API_KEY = "wcqsBI0njGP0VM0ObAYOog4vFttbbvWj6436i3EaXn8";
  const [tourImages, setTourImages] = useState({});

  const fetchLiveImage = async (destination) => {
    try {
      const response = await axios.get(UNSPLASH_API_URL, {
        params: {
          query: destination,
          per_page: 1,
          orientation: "landscape",
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].urls.full;
        // small for low Images,thumb .....,full .....
      }
    } catch (error) {
      console.error("Error fetching live image:", error);
    }
  };

  const fetchListings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/tour/getTourPackages"
      );
      if (response.data.success) {
        setTours(response.data.data);

        const imagePromises = response.data.data.map(async (tour) => {
          const imageUrl = await fetchLiveImage(tour.destination);
          return { tourId: tour._id, imageUrl };
        });

        const images = await Promise.all(imagePromises);
        const imageMap = {};
        images.forEach((item) => {
          if (item.imageUrl) {
            imageMap[item.tourId] = item.imageUrl;
          }
        });

        setTourImages(imageMap);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tour.createdBy &&
        tour.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
        {/* Hero Section */}
        <div className="px-4 flex flex-col justify-center items-center py-16 text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Discover Amazing Tours
          </h1>
          <p className="text-sm md:text-2xl mb-8 text-center max-w-2xl opacity-90">
            Explore breathtaking destinations and create unforgettable memories
          </p>
          <div className="bg-white rounded-full shadow-lg p-2 flex flex-wrap">
            <div className="flex-grow w-48 md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Where do you want to go?"
                  className="pl-10 py-6 text-gray-800 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-full"
              onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
            >
              Search Tours
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {filteredTours.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredTours.map((tour) => (
              <Card
                key={tour._id}
                className="overflow-hidden border rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/tour/${tour._id}`)}
              >
                <div className="relative">
                  <div className="aspect-video overflow-hidden w-full">
                    <img
                      src={tourImages[tour._id] || Picture}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                      alt={tour.destination}
                    />
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white capitalize">
                      {tour.transportMode}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white text-blue-600 border border-blue-200">
                      {tour.numberOfDays} Days
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold capitalize">
                      {tour.destination}
                    </h3>
                  </div>
                  <div className="flex items-center text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm capitalize">
                      {tour.destination}, Pakistan
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Experience the beauty of {tour.destination} with our{" "}
                    {tour.numberOfDays}-day journey. Perfect for adventure
                    seekers and culture enthusiasts.
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-6 pt-0 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="text-xl font-bold text-blue-600">
                      Rs {tour.totalBudget.toLocaleString()}
                    </p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No tours found</h3>
            <p className="text-gray-500 mb-6">
              We couldn't find any tours matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourPackages;
