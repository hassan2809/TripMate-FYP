import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Image from "../components/assets/cities.jpg";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  PlusCircle,
  ChevronRight,
  CarFront,
  TrainFront,
  Bus,
  Plane,
  Search,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";

const MyTours = () => {
  const [createdTours, setCreatedTours] = useState([]);
  const [joinedTours, setJoinedTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userEmail = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/tour/myTours/?email=${userEmail}`
        );
        setCreatedTours(response.data.createdTours);
        setJoinedTours(response.data.joinedTours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchTours();
  }, [userEmail]);

  const handleRemoveTour = async (tourId) => {
    try {
      const email = localStorage.getItem("email");
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:8000/api/v1/tour/removeJoinedTours",
        {
          tourId,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const myToursResponse = await axios.get(
          `http://localhost:8000/api/v1/tour/myTours/?email=${email}`
        );
        setJoinedTours(myToursResponse.data.joinedTours);

        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const filterTours = (tours) => {
    if (!searchTerm) return tours;
    return tours.filter(
      (tour) =>
        tour.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tour.transportMode &&
          tour.transportMode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredCreatedTours = filterTours(createdTours);
  const filteredJoinedTours = filterTours(joinedTours);

  const TourCard = ({ tour, showRemoveButton }) => {
    const transportIcons = {
      flight: <Plane className="w-4 h-4" />,
      train: <TrainFront className="w-4 h-4" />,
      car: <CarFront className="w-4 h-4" />,
      bus: <Bus className="w-4 h-4" />,
    };

    return (
      <Card
        className="overflow-hidden border rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
        onClick={() => navigate(`/tour/${tour._id}`)}
      >
        <div className="relative">
          <div className="aspect-video overflow-hidden w-full">
            <img
              src={Image}
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
          {showRemoveButton && (
            <button
              className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTour(tour._id);
              }}
            >
              <Trash className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold capitalize">{tour.destination}</h3>
          </div>
          <div className="flex items-center text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{tour.destination}, Pakistan</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              {new Date(tour.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              {tour.numberOfDays} days
            </div>
            <div className="flex items-center text-sm text-gray-600">
              {transportIcons[tour.transportMode] || (
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              )}
              <span className="ml-2 capitalize">{tour.transportMode}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              {tour.companions?.length || 0} companions
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-xl font-bold text-blue-600">
                Rs {tour.totalBudget?.toLocaleString() || "N/A"}
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }) => (
    <div className="text-center py-16 bg-white rounded-lg shadow">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No {type} Tours Found</h3>
      <p className="text-gray-500 mb-6">
        {type === "Created"
          ? "Start planning your next adventure and create memories!"
          : "Join some exciting tours to explore new destinations!"}
      </p>
      <Button
        onClick={() =>
          navigate(type === "Created" ? "/tourPlan" : "/tourPackages")
        }
        className="bg-blue-600 hover:bg-blue-700 gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        {type === "Created" ? "Create a Tour" : "Explore Tours"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
        {/* Hero Section */}
        <div className="container flex flex-col justify-center items-center mx-auto px-4 py-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">My Tours</h1>
          <p className="text-md md:text-xl text-center mb-6 opacity-90">
            Manage your travel adventures and discover new destinations
          </p>
          <div className="max-w-xl bg-white rounded-full shadow-lg p-2 flex flex-wrap">
            <div className="flex-grow w-48 md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search your tours..."
                  className="pl-10 py-6 text-gray-800 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-full"
              onClick={() => navigate("/tourPlan")}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Tour
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="created" className="text-sm md:text-base">
              Created Tours
            </TabsTrigger>
            <TabsTrigger value="joined" className="text-sm md:text-base">
              Joined Tours
            </TabsTrigger>
          </TabsList>

          <TabsContent value="created">
            {filteredCreatedTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreatedTours.map((tour) => (
                  <TourCard
                    key={tour._id}
                    tour={tour}
                    showRemoveButton={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="Created" />
            )}
          </TabsContent>

          <TabsContent value="joined">
            {filteredJoinedTours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJoinedTours.map((tour) => (
                  <TourCard
                    key={tour._id}
                    tour={tour}
                    showRemoveButton={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="Joined" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTours;
