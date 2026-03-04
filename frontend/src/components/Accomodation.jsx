import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  ChevronDown,
  MapPin,
  Star,
  Wifi,
  Tv,
  Bath,
  Home,
  Coffee,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Cities from "../components/assets/cities.jpg";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

const Accomodation = () => {
  const [listings, setListings] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      minPrice: 0,
      maxPrice: 10000,
      roomType: "",
      location: "",
      furnished: "",
    },
  });

  const minPrice = watch("minPrice");
  const maxPrice = watch("maxPrice");

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/roomListing/getRoomListings"
      );
      if (response.data.success) {
        setListings(response.data.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/roomListing/filterRoomListings",
        data
      );
      setListings(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error applying filters:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Desktop Filters */}
      <div className="hidden md:block w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white p-6 rounded-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Find Your Perfect Accommodation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <Slider
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={([min]) => {
                    setValue("minPrice", min);
                  }}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Rs {minPrice}</span>
                  <span>Rs {maxPrice}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <Select
                  onValueChange={(value) => {
                    setValue("roomType", value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="entire">Entire Place</SelectItem>
                    <SelectItem value="private">Private Room</SelectItem>
                    <SelectItem value="shared">Shared Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="Enter location"
                  className="h-10"
                  {...register("location")}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Furnished
                </label>
                <Select
                  onValueChange={(value) => {
                    setValue("furnished", value);
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Furnished status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="Furnished">Furnished</SelectItem>
                    <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => {
                  reset({
                    minPrice: 0,
                    maxPrice: 10000,
                    roomType: "",
                    location: "",
                    furnished: "",
                  });
                  fetchListings();
                }}
              >
                Reset
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Filters */}
      <div className="block md:hidden w-full">
        <Button
          className="w-full justify-between bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          Filters{" "}
          <ChevronDown
            className={`ml-2 h-4 w-4 transition-transform ${
              isFilterOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
        {isFilterOpen && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white p-6 mt-2 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Range
                  </label>
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={([min]) => {
                      setValue("minPrice", min);
                    }}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs {minPrice}</span>
                    <span>Rs {maxPrice}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <Select
                    onValueChange={(value) => {
                      setValue("roomType", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="entire">Entire Place</SelectItem>
                      <SelectItem value="private">Private Room</SelectItem>
                      <SelectItem value="shared">Shared Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter location"
                    className="mb-2"
                    {...register("location")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Furnished
                  </label>
                  <Select
                    onValueChange={(value) => {
                      setValue("furnished", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Furnished status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="Furnished">Furnished</SelectItem>
                      <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    reset({
                      minPrice: 0,
                      maxPrice: 10000,
                      roomType: "",
                      location: "",
                      furnished: "",
                    });
                    fetchListings();
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Apply
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && listings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">No accommodations found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We couldn't find any accommodations matching your criteria. Try
            adjusting your filters.
          </p>
          <Button
            onClick={() => {
              reset({
                minPrice: 0,
                maxPrice: 10000,
                roomType: "",
                location: "",
                furnished: "",
              });
              fetchListings();
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card
              key={listing._id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200"
            >
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  // navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  spaceBetween={0}
                  slidesPerView={1}
                  className="w-full h-64"
                >
                  {listing.images && listing.images.length > 0 ? (
                    listing.images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={image}
                          alt={`Image ${index + 1} of ${listing.title}`}
                          className="w-full h-64 object-cover"
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide>
                      <img
                        src={Cities}
                        alt="Default property image"
                        className="w-full h-64 object-cover"
                      />
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">
                    {listing.title}
                  </h3>
                  <div className="flex items-center text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{listing.location}</span>
                  </div>

                  {/* Listing features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className="font-normal text-gray-600 flex items-center gap-1"
                    >
                      <Check className="h-3 w-3 text-green-600" />{" "}
                      {listing.furnished}
                    </Badge>

                    {/* Random amenities for demo */}
                    {/* {getAmenities().map((amenity, index) => (
                      <Badge key={index} variant="outline" className="font-normal text-gray-600 flex items-center gap-1">
                        {amenity.icon} {amenity.name}
                      </Badge>
                    ))} */}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-gray-500 text-sm">Per night</span>
                    <p className="text-2xl font-bold text-blue-600">
                      Rs {listing.price}
                    </p>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate(`/accomodation/${listing._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accomodation;
