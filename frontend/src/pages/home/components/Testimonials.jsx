import React, { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import axios from "axios";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/review/getAllReviews"
      );
      if (response.data.success) {
        setReviews(response.data.reviews.slice(0, 3));
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // If no reviews are fetched, use these as fallback
  const fallbackTestimonials = [
    {
      id: 1,
      name: "Ahmed Khan",
      location: "Islamabad",
      avatar: "https://i.pravatar.cc/100?img=1",
      rating: 5,
      title: "Amazing Experience",
      content:
        "TripMate made our group vacation planning so much easier. The platform helped us coordinate everything from accommodations to daily activities. Highly recommended for anyone planning travel with friends!",
      featured: true,
    },
    {
      id: 2,
      name: "Fatima Ali",
      location: "Lahore",
      avatar: "https://i.pravatar.cc/100?img=2",
      rating: 5,
      title: "Great Service",
      content:
        "The accommodation booking process was seamless, and the tour planning feature saved us hours of research. Will definitely use it for all our future trips.",
      featured: false,
    },
    {
      id: 3,
      name: "Zain Malik",
      location: "Karachi",
      avatar: "https://i.pravatar.cc/100?img=3",
      rating: 4,
      title: "Affordable Options",
      content:
        "Great platform for finding affordable and high-quality accommodations. The verified reviews were particularly helpful in making our decision.",
      featured: false,
    },
  ];

  // Determine which testimonials to display
  const testimonialsToDisplay =
    reviews.length > 0 ? reviews : fallbackTestimonials;

  // Format review location based on itemType
  const getReviewLocation = (review) => {
    if (!review.itemDetails) return "";
    return review.itemType === "tour"
      ? review.itemDetails.destination
      : review.itemDetails.location || "";
  };

  // Get avatar based on name
  const getAvatar = (name) => {
    // Create a deterministic number from the name
    const hash =
      name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70;
    return `https://i.pravatar.cc/100?img=${hash}`;
  };

  // Check if review is featured (in this case, we're marking the first one as featured)
  const isFeatured = (index) => index === 0;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold uppercase tracking-wider mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What Our Users Say
          </h2>
          <div className="mt-3 mx-auto w-24 h-1 bg-blue-600 rounded"></div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading testimonials...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsToDisplay.map((review, index) => {
              // Determine if this is an API review or fallback
              const isApiReview = "itemType" in review;

              // Get relevant data based on review type
              const name = isApiReview ? review.userName : review.name;
              const rating = review.rating;
              const text = isApiReview ? review.content : review.content;
              const title = isApiReview ? review.title : review.title;
              const location = isApiReview
                ? getReviewLocation(review)
                : review.location;
              const avatar = isApiReview ? getAvatar(name) : review.avatar;
              const featured = isApiReview
                ? isFeatured(index)
                : review.featured;

              return (
                <div
                  key={isApiReview ? review._id : review.id}
                  className={`bg-white p-6 rounded-xl shadow-lg relative ${
                    featured ? "border-2 border-blue-500" : ""
                  }`}
                >
                  {featured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                      Featured
                    </div>
                  )}

                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                      />
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{name}</h3>
                        <p className="text-gray-500 text-sm">{location}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {title && (
                    <h4 className="font-medium text-gray-800 mb-2">{title}</h4>
                  )}

                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-100 rotate-180" />
                    <p className="text-gray-600 relative z-10 pl-6">{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
