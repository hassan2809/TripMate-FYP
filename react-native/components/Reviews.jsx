import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Reviews = ({ itemId, itemType }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState({
    title: "",
    content: "",
    rating: "",
  });

  // Fetch user name from AsyncStorage
  useEffect(() => {
    const getUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("name");
        setUserName(name || "");
      } catch (error) {
        console.error("Error getting name from storage:", error);
      }
    };

    getUserName();
  }, []);

  // Fetch reviews
  useEffect(() => {
    if (itemId) {
      fetchReviews();
    }
  }, [itemId]);

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
      Alert.alert("Error", "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newError = { title: "", content: "", rating: "" };

    if (!title.trim()) {
      newError.title = "Title is required";
      isValid = false;
    }

    if (!content.trim()) {
      newError.content = "Review content is required";
    } else if (content.trim().length < 10) {
      newError.content = "Review should be at least 10 characters";
      isValid = false;
    }

    if (rating === 0) {
      newError.rating = "Please select a rating";
      isValid = false;
    }

    setError(newError);
    return isValid;
  };

  const handleSubmitReview = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "You need to be logged in to submit a review");
        return;
      }

      const reviewData = {
        title,
        content,
        rating,
        userName,
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
        Alert.alert("Success", "Review added successfully");
        setTitle("");
        setContent("");
        setRating(0);
        setShowAddReview(false);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getItemTypeLabel = () => {
    return itemType.charAt(0).toUpperCase() + itemType.slice(1);
  };

  const renderStars = (selectedRating, interactive = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setRating(star)}
          >
            <Ionicons
              name={star <= selectedRating ? "star" : "star-outline"}
              size={interactive ? 28 : 16}
              color={star <= selectedRating ? "#FBBF24" : "#D1D5DB"}
              style={{ marginRight: interactive ? 8 : 4 }}
            />
          </TouchableOpacity>
        ))}
        {interactive && (
          <Text style={styles.ratingText}>
            {rating > 0 ? `${rating} out of 5 stars` : "Select a rating"}
          </Text>
        )}
      </View>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Review button */}
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>
          {getItemTypeLabel()} Reviews ({reviews.length})
        </Text>
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => setShowAddReview(!showAddReview)}
        >
          <Ionicons
            name={showAddReview ? "close-outline" : "star-outline"}
            size={16}
            color="#fff"
          />
          <Text style={styles.addReviewButtonText}>
            {showAddReview ? "Cancel" : "Add Review"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Write Review Section (Togglable) */}
      {showAddReview && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : null}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Write a {getItemTypeLabel()} Review
            </Text>

            {/* Rating Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rating *</Text>
              {renderStars(rating, true)}
              {error.rating ? (
                <Text style={styles.errorText}>{error.rating}</Text>
              ) : null}
            </View>

            {/* Review Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Review Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Summarize your experience"
                value={title}
                onChangeText={setTitle}
              />
              {error.title ? (
                <Text style={styles.errorText}>{error.title}</Text>
              ) : null}
            </View>

            {/* Review Content */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Review Details *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder={`Share your experience with this ${itemType}...`}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {error.content ? (
                <Text style={styles.errorText}>{error.content}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={16} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Reviews List Section */}
      <View style={styles.reviewsListContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E3A8A" />
          </View>
        ) : reviews.length > 0 ? (
          <View style={styles.reviewsList}>
            {reviews.map((review, index) => (
              <View
                key={index}
                style={[
                  styles.reviewItem,
                  index !== reviews.length - 1 && styles.reviewItemBorder,
                ]}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.userIconContainer}>
                    <Ionicons name="person" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.reviewHeaderText}>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>
                      {formatDate(review.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.reviewRating}>
                  {renderStars(review.rating)}
                </View>

                <Text style={styles.reviewTitle}>{review.title}</Text>
                <Text style={styles.reviewContent}>{review.content}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyReviews}>
            <Text style={styles.emptyReviewsText}>
              No reviews yet. Be the first to review this {itemType}!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addReviewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  reviewsListContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  reviewsList: {
    marginTop: 8,
  },
  reviewItem: {
    paddingVertical: 16,
  },
  reviewItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reviewHeaderText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewRating: {
    marginBottom: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  reviewContent: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  emptyReviews: {
    padding: 20,
    alignItems: "center",
  },
  emptyReviewsText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Reviews;
