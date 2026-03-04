import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { format, addDays, differenceInDays } from "date-fns";
import { BallTriangle } from "react-loader-spinner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { toast } from "react-toastify";
import { Separator } from "@/components/ui/separator";
import Navbar from "../components/Navbar";
import { CreditCard, MapPin } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const AccommodationBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      checkInDate: format(new Date(), "yyyy-MM-dd"),
      checkOutDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      numGuests: 1,
      specialRequests: "",
      paymentMethod: "payOnSite",
    },
  });

  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");
  const numGuests = watch("numGuests");
  const paymentMethod = watch("paymentMethod");

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/v1/roomListing/getRoomById/${id}`
        );
        if (response.data.success) {
          setRoom(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching room details:", error);
        toast.error("Failed to load room details");
        setLoading(false);
      }
    };

    if (id) {
      fetchRoomDetails();
    }
  }, [id]);

  // Calculate total price when dates or guests change
  useEffect(() => {
    if (room && checkInDate && checkOutDate) {
      try {
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        const nights = Math.max(1, differenceInDays(endDate, startDate));

        // Base price calculation
        let price = room.price * nights;

        // Add extra guest fee if applicable (assuming base price is for 1 guest)
        const extraGuests = Math.max(0, numGuests - 1);
        if (extraGuests > 0) {
          // Assume 10% extra per additional guest (adjust as needed)
          price += price * 0.1 * extraGuests;
        }

        setTotalPrice(price);
      } catch (error) {
        console.error("Error calculating total price:", error);
      }
    }
  }, [room, checkInDate, checkOutDate, numGuests]);

  const onSubmit = async (data) => {
    // Create booking data object
    const bookingData = {
      ...data,
      roomId: id,
      totalPrice,
      status: "pending",
    };

    setIsSubmitting(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      // Replace with your actual booking API endpoint
      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/createBooking",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (response.data.url) {
          window.location.href = response.data.url;
          return;
        }

        toast.success(response.data.message);
        reset();
        // Redirect to a booking confirmation page or dashboard
        // navigate("/bookings", {
        //   state: {
        //     bookingSuccess: true
        //   }
        // });
      } else {
        toast.error(response.data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.response?.data?.message || "Error creating booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="bg-blue-900">
          <Navbar />
        </div>
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
      </div>
    );
  }

  if (!room) {
    return (
      <div>
        <div className="bg-blue-900">
          <Navbar />
        </div>
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <p className="text-lg text-red-600">Room not found</p>
            <Button
              className="mt-4 bg-blue-900"
              onClick={() => navigate("/accomodation")}
            >
              Back to Accommodations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Split amenities string into array if it exists
  const amenitiesList = room.amenities
    ? room.amenities.split(",").map((item) => item.trim())
    : [];

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-800 to-blue-600">
        <Navbar />
      </div>
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Room Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={10}
                    slidesPerView={1}
                    className="rounded-lg overflow-hidden mb-4"
                  >
                    {room.images &&
                      room.images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={image}
                            alt={`Image ${index + 1} of ${room.title}`}
                            className="w-full h-48 object-cover"
                          />
                        </SwiperSlide>
                      ))}
                  </Swiper>

                  <h2 className="text-xl font-bold capitalize">{room.title}</h2>
                  <p className="text-gray-600 capitalize">{room.location}</p>

                  <div className="flex justify-between text-sm">
                    <span className="capitalize">
                      Room Type: {room.roomType}
                    </span>
                    <span className="capitalize">Status: {room.furnished}</span>
                  </div>

                  <p className="text-lg font-semibold">Rs {room.price}/night</p>

                  {room.description && (
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {room.description}
                      </p>
                    </div>
                  )}

                  {amenitiesList.length > 0 && (
                    <div>
                      <h3 className="font-medium">Amenities</h3>
                      <div className="text-sm text-gray-600">
                        {amenitiesList.map((amenity, index) => (
                          <span key={index} className="block capitalize">
                            • {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
                <CardDescription>
                  Fill in your details to complete your booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          {...register("name", {
                            required: "Name is required",
                          })}
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                          placeholder="Enter your email"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          {...register("phone", {
                            required: "Phone number is required",
                          })}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="checkInDate">Check-in Date</Label>
                        <Input
                          id="checkInDate"
                          type="date"
                          {...register("checkInDate", {
                            required: "Check-in date is required",
                          })}
                          min={format(new Date(), "yyyy-MM-dd")}
                        />
                        {errors.checkInDate && (
                          <p className="text-sm text-red-500">
                            {errors.checkInDate.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="checkOutDate">Check-out Date</Label>
                        <Input
                          id="checkOutDate"
                          type="date"
                          {...register("checkOutDate", {
                            required: "Check-out date is required",
                            validate: (value) =>
                              new Date(value) > new Date(checkInDate) ||
                              "Check-out date must be after check-in date",
                          })}
                          min={checkInDate}
                        />
                        {errors.checkOutDate && (
                          <p className="text-sm text-red-500">
                            {errors.checkOutDate.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="numGuests">Number of Guests</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("numGuests", parseInt(value))
                          }
                          defaultValue="1"
                        >
                          <SelectTrigger id="numGuests">
                            <SelectValue placeholder="Select number of guests" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "Guest" : "Guests"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">
                      Special Requests (Optional)
                    </Label>
                    <Textarea
                      id="specialRequests"
                      {...register("specialRequests")}
                      placeholder="Any special requests or requirements..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium">
                      Payment Method
                    </Label>
                    <RadioGroup
                      value={paymentMethod || "payOnSite"}
                      onValueChange={(value) => {
                        setValue("paymentMethod", value);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                    >
                      {/* Pay on Site Option */}
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="payOnSite"
                          className={`flex items-center space-x-3 w-full border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            (paymentMethod || "payOnSite") === "payOnSite"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="payOnSite"
                                id="payOnSite"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Pay on Site
                                </div>
                                <p className="text-sm text-gray-600">
                                  Pay cash when you arrive at the property
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Stripe Payment Option */}
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor="stripe"
                          className={`flex items-center space-x-3 w-full border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            paymentMethod === "stripe"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="stripe" id="stripe" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Pay with Card
                                </div>
                                <p className="text-sm text-gray-600">
                                  Secure payment via Stripe
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator className="my-6" />

                  {/* Price Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      Price Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Room rate:</span>
                        <span>Rs {room.price}/night</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of nights:</span>
                        <span>
                          {checkInDate && checkOutDate
                            ? Math.max(
                                1,
                                differenceInDays(
                                  new Date(checkOutDate),
                                  new Date(checkInDate)
                                )
                              )
                            : 0}
                        </span>
                      </div>
                      {numGuests > 1 && (
                        <div className="flex justify-between">
                          <span>Additional guest fee:</span>
                          <span>10% per extra guest</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>Rs {totalPrice.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-900"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationBooking;
