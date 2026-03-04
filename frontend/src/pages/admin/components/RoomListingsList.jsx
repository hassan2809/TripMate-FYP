import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  MapPin,
  Check,
  X,
  Image,
  Filter,
  Save,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";

const RoomListingsList = () => {
  const [roomListings, setRoomListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const token = localStorage.getItem("token");

  // Available room types and furnishing options
  const roomTypes = ["entire", "private", "shared"];
  const furnishedOptions = ["furnished", "unfurnished"];

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: "",
      roomType: "private",
      furnished: "furnished",
      amenities: "",
    },
  });

  const fetchRoomListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/admin/getAllRoomListings"
      );
      if (response.data.success) {
        setRoomListings(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch room listings:", error);
      toast.error("Failed to load room listings");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomListings();
  }, []);

  // Filter room listings based on search term and filters
  const filteredRoomListings = roomListings.filter((room) => {
    const matchesSearch =
      room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoomType =
      roomTypeFilter === "" || room.roomType === roomTypeFilter;

    const matchesPrice =
      (minPrice === "" || room.price >= parseInt(minPrice)) &&
      (maxPrice === "" || room.price <= parseInt(maxPrice));

    return matchesSearch && matchesRoomType && matchesPrice;
  });

  // Open dialog for adding new room
  const handleAddRoom = () => {
    setIsEditing(false);
    setCurrentRoom(null);
    reset({
      title: "",
      description: "",
      location: "",
      price: "",
      roomType: "private",
      furnished: "furnished",
      amenities: "",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setIsDialogOpen(true);
  };

  // Open dialog for editing room
  const handleEditRoom = (room) => {
    setIsEditing(true);
    setCurrentRoom(room);

    // Set form values
    setValue("title", room.title);
    setValue("description", room.description);
    setValue("location", room.location);
    setValue("price", room.price);
    setValue("roomType", room.roomType);
    setValue("furnished", room.furnished);
    setValue("amenities", room.amenities);

    // Set image previews if available
    if (room.images && room.images.length > 0) {
      const previews = room.images.map((image) => {
        // If image path starts with http, use it directly, otherwise prepend base URL
        return image.startsWith("http")
          ? image
          : `http://localhost:8000${image}`;
      });
      setImagePreviews(previews);
    } else {
      setImagePreviews([]);
    }

    setImageFiles([]);
    setIsDialogOpen(true);
  };

  // Delete room listing handler
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/admin/deleteRoomListing/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove room from local state
        setRoomListings(roomListings.filter((room) => room._id !== id));
        toast.success("Room listing deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error(
        error.response?.data?.message || "Error deleting room listing"
      );
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Preview images
      const newImagePreviews = filesArray.map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews((prev) => [...prev, ...newImagePreviews]);

      // Store files for upload
      setImageFiles((prev) => [...prev, ...filesArray]);
    }
  };

  // Remove image from preview
  const removeImage = (index) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    // If we're adding a new room or adding new images to an existing room
    if (imageFiles.length > index) {
      const newFiles = [...imageFiles];
      newFiles.splice(index, 1);
      setImageFiles(newFiles);
    }
  };

  // Form submission handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      let response;
      const formData = new FormData();

      // Append form data
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      // Append images if any
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (isEditing) {
        // Update existing room
        response = await axios.put(
          `http://localhost:8000/api/v1/admin/updateRoomListing/${currentRoom._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update room in local state
          fetchRoomListings(); // Refetch to get updated image paths
          toast.success("Room listing updated successfully");
        }
      } else {
        response = await axios.post(
          "http://localhost:8000/api/v1/admin/createRoomListing",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Add new room to local state
          fetchRoomListings(); // Refetch to get image paths
          toast.success("Room listing created successfully");
        }
      }

      // Close dialog and reset form
      setIsDialogOpen(false);
      reset();
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error(error.response?.data?.message || "Error saving room listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get furnishing status icon
  const getFurnishingIcon = (status) => {
    if (status === "furnished") {
      return <Check className="h-4 w-4 text-green-500" />;
    } else if (status === "partially furnished") {
      return (
        <div className="flex items-center">
          <div className="h-4 w-4 text-orange-500 flex items-center justify-center">
            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
          </div>
        </div>
      );
    } else {
      return <X className="h-4 w-4 text-red-500" />;
    }
  };

  const getUserName = (userId) => {
    return "User ID: " + userId.substring(0, 8) + "...";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Room Listings Management
          </h1>
          <p className="text-muted-foreground">
            Manage all available rooms and accommodations
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddRoom}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Listing
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search listings..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Room Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Types</SelectItem>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Room Listings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-6">Loading room listings...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Listing</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Furnished</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoomListings.length > 0 ? (
                  filteredRoomListings.map((room) => (
                    <TableRow key={room._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{room.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                            {room.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">{room.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                          <span className="font-medium">{room.price}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            / night
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          {room.roomType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getFurnishingIcon(room.furnished)}
                          <span className="text-sm ml-1">{room.furnished}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Image className="h-4 w-4 mr-1 text-purple-500" />
                          <span className="text-sm">
                            {room.images?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getUserName(room.user)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditRoom(room)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(room._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-6"
                    >
                      No room listings found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredRoomListings.length}</span>{" "}
            of <span className="font-medium">{roomListings.length}</span>{" "}
            listings
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* Room Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Room Listing" : "Add New Room Listing"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update room listing details below"
                : "Fill in the details to create a new room listing"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title", {
                    required: "Title is required",
                  })}
                  placeholder="Enter listing title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  placeholder="Enter location"
                />
                {errors.location && (
                  <p className="text-sm text-red-500">
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (per night)</Label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" },
                  })}
                  placeholder="Enter price"
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              {/* Room Type */}
              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Controller
                  name="roomType"
                  control={control}
                  rules={{ required: "Room type is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="roomType">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.roomType && (
                  <p className="text-sm text-red-500">
                    {errors.roomType.message}
                  </p>
                )}
              </div>

              {/* Furnished */}
              <div className="space-y-2">
                <Label htmlFor="furnished">Furnished</Label>
                <Controller
                  name="furnished"
                  control={control}
                  rules={{ required: "Furnishing status is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="furnished">
                        <SelectValue placeholder="Select furnishing status" />
                      </SelectTrigger>
                      <SelectContent>
                        {furnishedOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.furnished && (
                  <p className="text-sm text-red-500">
                    {errors.furnished.message}
                  </p>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="amenities">Amenities</Label>
                <Input
                  id="amenities"
                  {...register("amenities")}
                  placeholder="Enter amenities (e.g., WiFi, AC, Kitchen)"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  placeholder="Enter room description"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Images */}
              <div className="space-y-2 md:col-span-2">
                <Label>Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload images
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Upload multiple images
                    </span>
                  </Label>
                </div>

                {/* Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-0 right-0 h-5 w-5 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Listing"
                  : "Create Listing"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomListingsList;
