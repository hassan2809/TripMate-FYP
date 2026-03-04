import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  BadgeCheck,
  PlusCircle,
  Search,
  Home,
  Trash2,
  Bed,
  DollarSign,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DefaultImage from "../components/assets/login.jpg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MyRoomListings = () => {
  const [myRooms, setMyRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const userEmail = localStorage.getItem("email");
  const id = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/roomListing/getRoomByUser/${id}`
        );
        setMyRooms(response.data.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, [userEmail]);

  const handleDeleteRoomListing = async () => {
    if (!roomToDelete) return;
      const token = localStorage.getItem("token");

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/roomListing/deleteRoomListing/${roomToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setMyRooms(myRooms.filter((room) => room._id !== roomToDelete));
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
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.log(error);
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

  const openDeleteDialog = (roomId) => {
    setRoomToDelete(roomId);
    setIsDeleteDialogOpen(true);
  };

  const filteredRooms = myRooms.filter((room) => {
    if (!searchTerm) return true;

    return (
      room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.furnished.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const RoomCard = ({ room }) => {
    const imageUrl =
      room.images && room.images.length > 0 ? room.images[0] : DefaultImage;

    return (
      <Card className="overflow-hidden border rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <div className="aspect-video overflow-hidden w-full">
            <img
              src={imageUrl}
              alt={room.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white capitalize">
              {room.furnished}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-white text-blue-600 border border-blue-200">
              {room.roomType || "Room"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold line-clamp-1">{room.title}</h3>
          </div>

          <div className="flex items-center text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm capitalize">{room.location}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Bed className="w-4 h-4 mr-2 text-blue-500" />
              {room.bedrooms || 1} {room.bedrooms > 1 ? "bedrooms" : "bedroom"}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              {room.maxOccupancy || 1}{" "}
              {room.maxOccupancy > 1 ? "guests" : "guest"}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-blue-600">
                Rs {room.price?.toLocaleString() || "N/A"}
                <span className="text-sm font-normal text-gray-500">
                  /month
                </span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(room._id);
                }}
                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate(`/accomodation/${room._id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-16 bg-white rounded-lg shadow">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Home className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Rooms Listed Yet</h3>
      <p className="text-gray-500 mb-6">
        Start listing your rooms to attract guests and earn income.
      </p>
      <Button
        onClick={() => navigate("/room-listing")}
        className="bg-blue-600 hover:bg-blue-700 gap-2"
      >
        <PlusCircle className="w-4 h-4" />
        Add New Room
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
        {/* Hero Section */}
        <div className="container flex flex-col justify-center items-center mx-auto px-4 py-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            My Room Listings
          </h1>
          <p className="text-md md:text-xl mb-6 text-center opacity-90">
            Manage your properties and attract guests to your spaces
          </p>
          <div className="max-w-xl bg-white rounded-full shadow-lg p-2 flex flex-wrap">
            <div className="flex-grow w-48 md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search your listings..."
                  className="pl-10 py-6 text-gray-800 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 rounded-full"
              onClick={() => navigate("/room-listing")}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-700">
            {filteredRooms.length}{" "}
            {filteredRooms.length === 1 ? "listing" : "listings"} found
          </div>
        </div>

        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room listing? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoomListing}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRoomListings;
