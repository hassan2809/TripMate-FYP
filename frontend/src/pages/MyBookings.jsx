import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  CalendarDays,
  Search,
  LogIn,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingToCancelId, setBookingToCancelId] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/auth/userBookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBookings(response.data.bookings);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load your bookings");
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token, navigate]);

  const handleCancelBooking = async () => {
    if (!bookingToCancelId) return;

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/auth/cancelBooking/${bookingToCancelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove the booking from the state
        setBookings(
          bookings.filter((booking) => booking._id !== bookingToCancelId)
        );

        toast.success("Booking cancelled successfully");

        setIsCancelDialogOpen(false);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const openCancelDialog = (bookingId) => {
    setBookingToCancelId(bookingId);
    setIsCancelDialogOpen(true);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;

    // Check if any of the room details match the search term
    const roomTitle = booking.roomId?.title?.toLowerCase() || "";
    const location = booking.roomId?.location?.toLowerCase() || "";
    const guestName = booking.name?.toLowerCase() || "";

    return (
      roomTitle.includes(searchTerm.toLowerCase()) ||
      location.includes(searchTerm.toLowerCase()) ||
      guestName.includes(searchTerm.toLowerCase())
    );
  });

  const BookingCard = ({ booking }) => {
    const imageUrl =
      booking.roomId?.images && booking.roomId.images.length > 0
        ? booking.roomId.images[0]
        : "https://placehold.co/600x400?text=No+Image";

    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);

    const nights = Math.round(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    const formattedCheckIn = format(checkInDate, "MMM dd, yyyy");
    const formattedCheckOut = format(checkOutDate, "MMM dd, yyyy");

    const isUpcoming = checkInDate > new Date();

    const isActive = checkInDate <= new Date() && checkOutDate >= new Date();

    return (
      <Card className="overflow-hidden border rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="relative">
          <div className="aspect-video overflow-hidden w-full">
            <img
              src={imageUrl}
              alt={booking.roomId?.title || "Room"}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
          {(isUpcoming || isActive) && (
            <div className="absolute top-4 right-4">
              <Badge
                className={`${
                  isActive ? "bg-green-600" : "bg-blue-600"
                } text-white`}
              >
                {isActive ? "Active Stay" : "Upcoming"}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold line-clamp-1">
              {booking.roomId?.title || "Room Booking"}
            </h3>
          </div>

          <div className="flex items-center text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm capitalize">
              {booking.roomId?.location || "Location not available"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <LogIn className="w-4 h-4 mr-2 text-blue-500" />
              Check-in: {formattedCheckIn}
            </div>
            <div className="flex items-center">
              <LogOut className="w-4 h-4 mr-2 text-blue-500" />
              Check-out: {formattedCheckOut}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              {nights} {nights === 1 ? "night" : "nights"}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              {booking.numGuests} {booking.numGuests === 1 ? "guest" : "guests"}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-blue-600">
                Rs {booking.totalPrice?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div className="flex space-x-2">
              {isUpcoming && (
                <Button
                  variant="outline"
                  className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => openCancelDialog(booking._id)}
                >
                  Cancel
                </Button>
              )}
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate(`/accomodation/${booking.roomId._id}`)}
              >
                View Room
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
        <CalendarDays className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
      <p className="text-gray-500 mb-6">
        You haven't made any bookings yet. Start exploring rooms to book your
        stay.
      </p>
      <Button
        onClick={() => navigate("/accomodation")}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Find Rooms
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
        {/* Hero Section */}
        <div className="container flex flex-col justify-center items-center mx-auto px-4 py-10 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-md md:text-xl mb-6 text-center opacity-90">
            View and manage all your upcoming, active, and past stays
          </p>
          <div className="max-w-xl bg-white rounded-full shadow-lg p-2 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search your bookings..."
                className="pl-10 py-6 text-gray-800 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-700">
            {filteredBookings.length}{" "}
            {filteredBookings.length === 1 ? "booking" : "bookings"} found
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;
