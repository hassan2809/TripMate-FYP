import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Star, Send, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const Review = ({ itemId, itemType }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("name");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/review/getReviews/${itemId}`
      );
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error(`Error fetching ${itemType} reviews:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchReviews();
    }
  }, [itemId, itemType]);

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error("Please select a rating", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      const reviewData = {
        ...data,
        rating,
        userName: username,
        itemType,
        date: new Date().toISOString(),
      };

      const response = await axios.post(
        `http://localhost:8000/api/v1/review/addReview/${itemId}`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Review added successfully", {
          position: "top-right",
          autoClose: 2000,
        });
        reset();
        setRating(0);
        // Add the new review to the list or refresh the list
        fetchReviews();
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to add review", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleSetRating = (value) => {
    setRating(value);
  };

  const getItemTypeLabel = () => {
    return itemType.charAt(0).toUpperCase() + itemType.slice(1);
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Add Review Form */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-700">
            Write a {getItemTypeLabel()} Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    onClick={() => handleSetRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`cursor-pointer ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Summarize your experience"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Review Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Details *
              </label>
              <textarea
                {...register("content", {
                  required: "Review content is required",
                  minLength: {
                    value: 10,
                    message: "Review should be at least 10 characters",
                  },
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Share your experience with this ${itemType}...`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-700">
            {getItemTypeLabel()} Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-3 text-blue-500 mr-4">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold">
                          {review.userName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      <h4 className="font-medium text-gray-800 mb-2">
                        {review.title}
                      </h4>
                      <p className="text-gray-600">{review.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Be the first to review this {itemType}!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Review;
