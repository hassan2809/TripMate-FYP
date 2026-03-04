import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const RoomListing = () => {
  const [roomType, setRoomType] = useState("");
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      roomType: "",
      location: "",
      amenities: "",
      furnished: "",
    },
  });

  useEffect(() => {
    const fetchRoomData = async () => {
      const currentUserEmail = localStorage.getItem("email");
      if (isEditing && id) {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/v1/roomListing/getRoomById/${id}`
          );
          if (
            response.data.success &&
            response.data.data.user.email === currentUserEmail
          ) {
            const roomData = response.data.data;

            setValue("title", roomData.title);
            setValue("description", roomData.description);
            setValue("price", roomData.price);
            setValue("location", roomData.location);
            setValue("amenities", roomData.amenities);
            setValue("furnished", roomData.furnished);
            setRoomType(roomData.roomType);
            setValue("roomType", roomData.roomType);
            if (roomData.images && Array.isArray(roomData.images)) {
              setImages(roomData.images.map((img) => ({ url: img })));
            }
          } else {
            toast.error("You are not authorized to edit this room.", {
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
          toast.error("Error fetching room details", {
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
      }
    };

    fetchRoomData();
  }, [id, isEditing, setValue]);

  useEffect(() => {
    if (!id) {
      reset();
      setRoomType("");
      setImages([]);
      setImageError("");
    }
  }, [id, reset]);

  // Validate images before form submission
  const validateImages = () => {
    if (images.length === 0) {
      setImageError("At least one image is required");
      return false;
    }
    setImageError("");
    return true;
  };

  const onSubmit = async (data) => {
    // Validate images first
    if (!validateImages()) {
      toast.error("Please upload at least one image", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("roomType", data.roomType);
      formData.append("location", data.location);
      formData.append("amenities", data.amenities);
      formData.append("furnished", data.furnished);
      
      images.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const url = isEditing
        ? `http://localhost:8000/api/v1/roomListing/updateRoomListing/${id}`
        : "http://localhost:8000/api/v1/roomListing/postRoomListing";

      const response = await axios[isEditing ? "put" : "post"](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

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
        
        reset();
        setRoomType("");
        setImages([]);
        setImageError("");
        
        navigate(`/accomodation/${isEditing ? id : response.data.roomId}`);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
    
    // Clear image error when images are uploaded
    if (files.length > 0) {
      setImageError("");
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Show error if no images left
    if (newImages.length === 0) {
      setImageError("At least one image is required");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white max-w-4xl mx-auto"
    >
      {/* Room Title */}
      <div>
        <label className="block text-sm font-medium">
          Room Title <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Cozy Studio in Johar Town"
          {...register("title", {
            required: "Title is required",
            minLength: {
              value: 5,
              message: "Title must be at least 5 characters long",
            },
          })}
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Describe your room and its unique features..."
          {...register("description", {
            required: "Description is required",
            minLength: {
              value: 20,
              message: "Description must be at least 20 characters long",
            },
          })}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      {/* Price and Room Type */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">
            Price per Night (Rs) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="1000"
            {...register("price", {
              required: "Price is required",
              min: { value: 1, message: "Price must be at least 1" },
            })}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium">
            Room Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={roomType}
            onValueChange={(value) => {
              setRoomType(value);
              setValue("roomType", value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select room type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entire">Entire Place</SelectItem>
              <SelectItem value="private">Private Room</SelectItem>
              <SelectItem value="shared">Shared Room</SelectItem>
            </SelectContent>
          </Select>
          {!roomType && (
            <input
              {...register("roomType", {
                required: "Room type is required",
              })}
              style={{ display: "none" }}
            />
          )}
          {errors.roomType && (
            <p className="text-red-500 text-sm">{errors.roomType.message}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium">
          Location <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="City, State, Country"
          {...register("location", {
            required: "Location is required",
            minLength: {
              value: 5,
              message: "Location must be at least 5 characters long",
            },
          })}
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location.message}</p>
        )}
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium">Amenities</label>
        <Input
          placeholder="WiFi, Kitchen, Air Conditioning, etc."
          {...register("amenities")}
        />
        <p className="text-sm text-gray-500 mt-1">
          Optional: List amenities separated by commas
        </p>
      </div>

      {/* Furnishing */}
      <div>
        <label className="block text-sm font-medium">
          Furnishing <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-col space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="furnished"
              value="furnished"
              {...register("furnished", {
                required: "Please select an option",
              })}
            />
            <label htmlFor="furnished" className="text-sm">Furnished</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="unfurnished"
              value="unfurnished"
              {...register("furnished", {
                required: "Please select an option",
              })}
            />
            <label htmlFor="unfurnished" className="text-sm">Unfurnished</label>
          </div>
        </div>
        {errors.furnished && (
          <p className="text-red-500 text-sm">{errors.furnished.message}</p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium">
          Upload Images <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          At least one image is required. You can upload multiple images.
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="file:mr-4 file:mt-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {imageError && (
          <p className="text-red-500 text-sm mt-1">{imageError}</p>
        )}
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Uploaded Images ({images.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative w-20 h-20 overflow-hidden rounded-lg border">
                <img
                  src={
                    image.url
                      ? `${image.url}`
                      : URL.createObjectURL(image)
                  }
                  alt={`Room image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition-colors"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          className="bg-blue-800 hover:bg-blue-900 px-8 py-3 text-white font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isEditing ? "Updating Room..." : "Listing Room...") 
            : (isEditing ? "Update Room Listing" : "List Your Room")
          }
        </Button>
      </div>
    </form>
  );
};

export default RoomListing;