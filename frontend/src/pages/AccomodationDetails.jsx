import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  MapPin,
  Home,
  DollarSign,
  User,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import Image from "../components/assets/login.jpg";
import Navbar from "../components/Navbar";
import { BallTriangle } from "react-loader-spinner";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Review from "../components/Review";

const AccommodationDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/roomListing/getRoomById/${id}`
        );
        if (response.data.success) {
          setRoom(response.data.data);
          console.log(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    };

    fetchRoomDetails();
  }, [id]);
  const handleMessageCreator = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8000/api/v1/chat/ensureConversation`,
        { creatorId: room.user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/chat/${room.user._id}`);
    } catch (error) {
      console.error("Failed to create or find conversation:", error);
    }
  };

  const handleDeleteRoomListing = async (roomId) => {
    // console.log(roomId)
      const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/roomListing/deleteRoomListing/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
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
        navigate("/accomodation");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, {
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

  const handleEditRoomListing = () => {
    navigate(`/room-listing/${room._id}`);
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BallTriangle
          height={100}
          width={100}
          radius={5}
          color="rgb(30 58 138)"
          ariaLabel="ball-triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  }

  // Split amenities string into array
  const amenitiesList = room.amenities
    ? room.amenities.split(",").map((item) => item.trim())
    : [];

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative h-96 rounded-lg overflow-hidden">
            {room.images && room.images.length > 0 ? (
              <>
                <img
                  src={room.images[activeImageIndex]}
                  alt={`Room view ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {room.user.email === localStorage.getItem("email") && (
                  <div className="absolute inset-0 flex items-start justify-end">
                    <div className="flex gap-2 p-2 backdrop-blur-sm bg-black/10 rounded-lg">
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                        onClick={() => handleEditRoomListing()}
                      >
                        <Pencil size={16} />
                        Edit Room
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
                        onClick={() => handleDeleteRoomListing(room._id)}
                      >
                        <Trash2 size={16} />
                        Delete Room
                      </button>
                    </div>
                  </div>
                )}
                {/* Thumbnail Navigation */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {room.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        activeImageIndex === index ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Home className="w-12 h-12 text-gray-400" />
                {room.user?.email === localStorage.getItem("email") && (
                  <div className="absolute inset-0 flex items-start justify-end">
                    <div className="flex gap-2 p-2 rounded-lg">
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
                        onClick={() => handleEditRoomListing()}
                      >
                        <Pencil size={16} />
                        Edit Room
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
                        onClick={() => handleDeleteRoomListing(room._id)}
                      >
                        <Trash2 size={16} />
                        Delete Room
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Thumbnail Strip */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {room.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden ${
                  activeImageIndex === index ? "border-2 border-blue-500" : ""
                }`}
              >
                <img
                  src={image}
                  alt={`Room thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-4 capitalize">{room.title}</h1>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="capitalize">{room.location}</span>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-500" />
                    <span className="capitalize">{room.roomType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-blue-500" />
                    <span className="capitalize">{room.furnished}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-500" />
                    <span className="capitalize">Rs {room.price}/night</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed capitalize">
                {room.description}
              </p>
            </div>

            {amenitiesList.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenitiesList.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-blue-500" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Rs {room.price}</h3>
                  <p className="text-gray-600 capitalize">per night</p>
                </div>
                {room.user?.email !== localStorage.getItem("email") && (
                  <div className="space-y-4">
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      // onClick={() => navigate(`/accommodation/${id}/book`)}
                      onClick={() => {
                        const userEmail = localStorage.getItem("email");
                        if (!userEmail) {
                          toast.error("You must be logged in to book a room.");
                        } else {
                          navigate(`/accommodation/${id}/book`);
                        }
                      }}
                    >
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleMessageCreator}
                    >
                      Contact Host
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-5 h-5" />
                    <span>Instant booking available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {room.user?.email !== localStorage.getItem("email") && (
          <Review itemId={id} itemType="room" />
        )}
      </div>
    </div>
  );
};

export default AccommodationDetails;
