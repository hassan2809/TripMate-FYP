import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  File,
  Filter,
  Edit,
  Save,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/admin/getAllReviews"
      );
      if (response.data.success) {
        const formattedReviews = response.data.reviews.map((review) => {
          let itemName = "";
          if (review.itemDetails) {
            if (review.itemType === "tour") {
              itemName = review.itemDetails.destination || "Unknown Tour";
            } else if (review.itemType === "room") {
              itemName = review.itemDetails.title || "Unknown Room";
            }
          }

          return {
            ...review,
            itemName,
          };
        });

        setReviews(formattedReviews);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filter reviews based on search term and filters
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      (review.title &&
        review.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.content &&
        review.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.userName &&
        review.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.itemName &&
        review.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesItemType =
      itemTypeFilter === "" ||
      (review.itemType &&
        review.itemType.toLowerCase() === itemTypeFilter.toLowerCase());

    const matchesRating =
      ratingFilter === "" ||
      (review.rating && review.rating === parseInt(ratingFilter));

    return matchesSearch && matchesItemType && matchesRating;
  });

  // Open edit dialog
  const handleEditClick = (review) => {
    setCurrentReview(review);
    setEditRating(review.rating);

    // Set form values
    setValue("title", review.title);
    setValue("content", review.content);

    setIsEditDialogOpen(true);
  };

  // Handle edit submit
  const onSubmitEdit = async (data) => {
    if (editRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedReview = {
        ...data,
        rating: editRating,
      };

      const response = await axios.put(
        `http://localhost:8000/api/v1/admin/updateReview/${currentReview._id}`,
        updatedReview,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update review in local state
        setReviews(
          reviews.map((review) =>
            review._id === currentReview._id
              ? {
                  ...review,
                  ...updatedReview,
                  updatedAt: new Date().toISOString(),
                }
              : review
          )
        );

        toast.success("Review updated successfully");
        setIsEditDialogOpen(false);
        reset();
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error(error.response?.data?.message || "Error updating review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review handler
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/v1/admin/deleteReview/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove review from local state
        setReviews(reviews.filter((review) => review._id !== id));
        toast.success("Review deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Error deleting review");
    }
  };

  // Handle star rating click
  const handleSetRating = (value) => {
    setEditRating(value);
  };

  // Helper function to render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Helper function to get item type badge color
  const getItemTypeBadgeColor = (type) => {
    const itemType = type ? type.toLowerCase() : "";
    return itemType === "tour"
      ? "bg-blue-100 text-blue-800"
      : "bg-purple-100 text-purple-800";
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "";
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reviews Management</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="border rounded-md px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value)}
            >
              <option value="">All Item Types</option>
              <option value="tour">Tours</option>
              <option value="room">Rooms</option>
            </select>
          </div>
          <div>
            <select
              className="border rounded-md px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6">Loading reviews...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">
                            {review.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-md truncate">
                            {review.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getItemTypeBadgeColor(
                                review.itemType
                              )}`}
                            >
                              {capitalizeFirstLetter(review.itemType)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {review.itemName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {review.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(review.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEditClick(review)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(review._id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No reviews found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Previous
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredReviews.length}</span> of{" "}
              <span className="font-medium">{reviews.length}</span> reviews
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating *</Label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    onClick={() => handleSetRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`cursor-pointer ${
                      star <= (hoveredRating || editRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {editRating > 0
                    ? `${editRating} out of 5 stars`
                    : "Select a rating"}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Review Title *</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Summarize your experience"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Review Details *</Label>
              <Textarea
                id="content"
                {...register("content", {
                  required: "Review content is required",
                  minLength: {
                    value: 10,
                    message: "Review should be at least 10 characters",
                  },
                })}
                rows={4}
                placeholder="Share your experience..."
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsList;
