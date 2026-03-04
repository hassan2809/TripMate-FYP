import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Plane, Star } from "lucide-react";
import Image from "../components/assets/login.jpg";
import { ChartNoAxesGantt } from "lucide-react";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Bus,
  Activity,
  UserPlus,
  CarFront,
  TrainFront,
  Wallet,
  Home,
  Navigation,
} from "lucide-react";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Review from "../components/Review";

const TourDetails = () => {
  const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
  const UNSPLASH_API_KEY = "wcqsBI0njGP0VM0ObAYOog4vFttbbvWj6436i3EaXn8";
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [liveImage, setLiveImage] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleMessageCreator = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/chat/ensureConversation`,
        { creatorId: tour.creatorId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/chat/${tour.creatorId}`);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleEditTour = () => {
    navigate(`/tourPlan/${tour._id}`);
  };

  const handleDeleteTour = async (tourId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/tour/deleteTour/${tourId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/tourPackages");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleJoinTour = async () => {
    const user = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("email"),
    };
    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/tour/addCompanion/${id}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setTour(response.data.data);
        navigate("/my-tours");
      } else {
        console.log("Error");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchTourDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/tour/getTourPackage/${id}`
      );
      if (response.data.success) {
        setTour(response.data.data);
        fetchLiveImage(response.data.data.destination);
        fetchNearbyPlaces(response.data.data.destination);
      }
    } catch (error) {
      console.error("Error fetching tour details:", error);
    }
  };

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
        setLiveImage(response.data.results[0].urls.full);
        // small for low Images,thumb .....,full .....
      }
    } catch (error) {
      console.error("Error fetching live image:", error);
    }
  };

  const fetchNearbyPlaces = async (destination) => {
    setLoadingPlaces(true);
    try {
      const options = {
        method: "GET",
        url: "https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json",
        params: {
          query: `top restaurants in ${destination}`,
          radius: "1000",
          opennow: "true",
          location: "40,-110",
          language: "en",
          region: "en",
        },
        headers: {
          "x-rapidapi-key":
            "6337e77448msh1d317c8e05b1edap13d700jsnf170a1b6726f",
          "x-rapidapi-host": "google-map-places.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      if (response.data.results) {
        const places = response.data.results.slice(0, 4);
        // Fetch detailed information for each place
        const detailedPlaces = await Promise.all(
          places.map((place) => fetchPlaceDetails(place.place_id))
        );
        setNearbyPlaces(detailedPlaces);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const options = {
        method: "GET",
        url: "https://google-map-places.p.rapidapi.com/maps/api/place/details/json",
        params: {
          place_id: placeId,
          region: "en",
          fields: "name,formatted_address,opening_hours,rating,photos",
          language: "en",
        },
        headers: {
          "x-rapidapi-key":
            "6337e77448msh1d317c8e05b1edap13d700jsnf170a1b6726f",
          "x-rapidapi-host": "google-map-places.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      return response.data.result; // Return detailed information
    } catch (error) {
      console.error(`Error fetching details for place ID ${placeId}:`, error);
      return null; // Return null if there's an error
    }
  };

  useEffect(() => {
    fetchTourDetails();
  }, [id]);

  if (!tour) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
      </div>
      {/* Tour Header */}
      <div className="relative h-64 sm:h-80 md:h-96">
        <img
          src={liveImage || Image}
          alt={tour.destination}
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center capitalize">
            {tour.destination}
          </h1>
          {tour.createdBy !== localStorage.getItem("email") && (
            <div className="flex gap-4">
              <Button
                onClick={handleMessageCreator}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <MessageCircle className="w-4 h-4" />
                Message Creator
              </Button>
              {!tour.companions?.some(
                (companion) =>
                  companion.email.trim().toLowerCase() ===
                  localStorage.getItem("email")?.trim().toLowerCase()
              ) && (
                <Button
                  onClick={handleJoinTour}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                >
                  <UserPlus className="w-4 h-4" />
                  Join Tour
                </Button>
              )}
            </div>
          )}
          {tour.createdBy === localStorage.getItem("email") && (
            <div className="flex gap-2 p-2 backdrop-blur-sm rounded-lg">
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                onClick={() => handleEditTour(tour._id)}
              >
                <Pencil size={16} />
                Edit Tour
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
                onClick={() => handleDeleteTour(tour._id)}
              >
                <Trash2 size={16} />
                Delete Tour
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartNoAxesGantt className="w-5 h-5" />
                  Tour Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>{tour.numberOfDays} Days Trip</span>
                  </div>
                  <div className="flex items-center space-x-2 capitalize">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span>{tour.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>{tour.companions.length} Companions</span>
                  </div>
                  <div className="flex items-center space-x-2 capitalize">
                    <Navigation className="w-5 h-5 text-blue-500" />
                    <span>From {tour.startingPoint}</span>
                  </div>
                  <div className="flex items-center space-x-2 capitalize">
                    <Home className="w-5 h-5 text-blue-500" />
                    <span>{tour.accommodationType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    <span>Rs {tour.totalBudget}</span>
                  </div>
                  <div className="flex items-center space-x-2 capitalize">
                    {tour.transportMode === "flight" && (
                      <Plane className="w-5 h-5 text-blue-500" />
                    )}
                    {tour.transportMode === "train" && (
                      <TrainFront className="w-5 h-5 text-blue-500" />
                    )}
                    {tour.transportMode === "car" && (
                      <CarFront className="w-5 h-5 text-blue-500" />
                    )}
                    {tour.transportMode === "bus" && (
                      <Bus className="w-5 h-5 text-blue-500" />
                    )}
                    <span>{tour.transportMode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tour Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" />
                  Tour Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Start Date</p>
                    <p>
                      {new Date(tour.startDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">End Date</p>
                    <p>
                      {new Date(tour.endDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* itineraries */}
            {tour.itinerary.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tour.itinerary.map((item, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold capitalize">
                              {item.activity}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(item.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-700 capitalize">
                          {item.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Nearby Places */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Attractions</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPlaces ? (
                  <p>Loading nearby attractions...</p>
                ) : nearbyPlaces.length > 0 ? (
                  <ul className="space-y-4">
                    {nearbyPlaces.map((place, index) => (
                      <li
                        key={index}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <h3 className="font-semibold">{place?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {place?.formatted_address}
                        </p>
                        {place?.rating && (
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm">{place?.rating}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No nearby attractions found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {tour.createdBy !== localStorage.getItem("email") && (
          <Review itemId={id} itemType="tour" />
        )}
      </main>
    </div>
  );
};

export default TourDetails;
