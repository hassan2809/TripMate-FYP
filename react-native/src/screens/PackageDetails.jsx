import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DefaultTourImage from "../../assets/images/accommodation.jpg";
import Reviews from "@/components/Reviews";

const windowWidth = Dimensions.get("window").width;

const PackageDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [liveImage, setLiveImage] = useState(null);

  // Unsplash API for destination images
  const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
  const UNSPLASH_API_KEY = "wcqsBI0njGP0VM0ObAYOog4vFttbbvWj6436i3EaXn8";

  // Get user info from AsyncStorage
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        setUserEmail(email || "");
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };
    getUserInfo();
  }, []);

  // Fetch tour details
  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8000/api/v1/tour/getTourPackage/${id}`
        );
        if (response.data.success) {
          setTour(response.data.data);
          fetchLiveImage(response.data.data.destination);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tour details:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to load package details");
      }
    };

    fetchTourDetails();
  }, [id]);

  // Fetch live image from Unsplash
  const fetchLiveImage = async (destination) => {
    try {
      const response = await axios.get(UNSPLASH_API_URL, {
        params: {
          query: destination,
          per_page: 1,
          orientation: "landscape",
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_API_KEY}`,
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        setLiveImage(response.data.results[0].urls.regular);
      }
    } catch (error) {
      console.error("Error fetching live image:", error);
    }
  };

  // Handle joining tour
  const handleJoinTour = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const name = await AsyncStorage.getItem("name");
      const email = await AsyncStorage.getItem("email");

      if (!token || !name || !email) {
        Alert.alert("Error", "You need to be logged in to join this tour");
        return;
      }

      const user = { name, email };

      const response = await axios.post(
        `http://localhost:8000/api/v1/tour/addCompanion/${id}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "You have successfully joined this tour!");
        setTour(response.data.data);
      }
    } catch (error) {
      console.error("Error joining tour:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to join the tour"
      );
    }
  };

  // Handle contacting tour creator
  const handleMessageCreator = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "You need to be logged in to message the creator");
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/v1/chat/ensureConversation`,
        { creatorId: tour.creatorId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigation.navigate("Chat", { contactId: tour.creatorId });
    } catch (error) {
      console.error("Error creating conversation:", error);
      Alert.alert("Error", "Failed to start conversation");
    }
  };

  // Handle editing tour
  const handleEditTour = () => {
    navigation.navigate("TourPlanning", { id: tour._id });
  };

  // Handle deleting tour
  const handleDeleteTour = async () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this tour package?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await axios.delete(
                `http://localhost:8000/api/v1/tour/deleteTour/${tour._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                Alert.alert("Success", "Tour package deleted successfully");
                navigation.goBack();
              }
            } catch (error) {
              console.error("Error deleting tour:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete the tour"
              );
            }
          },
        },
      ]
    );
  };

  // Handle sharing tour package
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing tour to ${tour.destination}! ${tour.numberOfDays} days trip for Rs ${tour.totalBudget}.`,
        title: `${tour.destination} Tour Package`,
      });
    } catch (error) {
      console.error("Error sharing tour:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading package details...</Text>
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorText}>Package not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Packages</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image
          source={liveImage ? { uri: liveImage } : DefaultTourImage}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />

        {/* Back Button */}
        {/* <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity> */}

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Destination Name */}
        <View style={styles.destinationContainer}>
          <Text style={styles.destinationName}>{tour.destination}</Text>

          {/* Action Buttons for non-owners */}
          {tour.createdBy !== userEmail && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.messageButton]}
                onPress={handleMessageCreator}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#FFF" />
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>

              {!tour.companions?.some(
                (companion) =>
                  companion.email.trim().toLowerCase() === userEmail
              ) && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.joinButton]}
                  onPress={handleJoinTour}
                >
                  <Ionicons name="person-add-outline" size={16} color="#FFF" />
                  <Text style={styles.actionButtonText}>Join Tour</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Owner Controls */}
          {tour.createdBy === userEmail && (
            <View style={styles.ownerButtonsContainer}>
              <TouchableOpacity
                style={[styles.ownerButton, styles.editButton]}
                onPress={handleEditTour}
              >
                <Ionicons name="create-outline" size={16} color="#FFF" />
                <Text style={styles.ownerButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ownerButton, styles.deleteButton]}
                onPress={handleDeleteTour}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.ownerButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Tour Details */}
      <View style={styles.detailsContainer}>
        {/* Tour Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart-outline" size={20} color="#1E3A8A" />
            <Text style={styles.cardTitle}>Tour Overview</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
                <Text style={styles.overviewText}>
                  {tour.numberOfDays} Days Trip
                </Text>
              </View>

              <View style={styles.overviewItem}>
                <Ionicons name="location-outline" size={18} color="#3B82F6" />
                <Text style={styles.overviewText}>{tour.destination}</Text>
              </View>

              <View style={styles.overviewItem}>
                <Ionicons name="people-outline" size={18} color="#3B82F6" />
                <Text style={styles.overviewText}>
                  {tour.companions.length} Companions
                </Text>
              </View>

              <View style={styles.overviewItem}>
                <Ionicons name="wallet-outline" size={18} color="#3B82F6" />
                <Text style={styles.overviewText}>Rs {tour.totalBudget}</Text>
              </View>

              <View style={styles.overviewItem}>
                {tour.transportMode === "flight" && (
                  <Ionicons name="airplane-outline" size={18} color="#3B82F6" />
                )}
                {tour.transportMode === "train" && (
                  <Ionicons name="train-outline" size={18} color="#3B82F6" />
                )}
                {tour.transportMode === "car" && (
                  <Ionicons name="car-outline" size={18} color="#3B82F6" />
                )}
                {tour.transportMode === "bus" && (
                  <Ionicons name="bus-outline" size={18} color="#3B82F6" />
                )}
                <Text style={styles.overviewText}>{tour.transportMode}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tour Dates Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color="#1E3A8A" />
            <Text style={styles.cardTitle}>Tour Dates</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.datesContainer}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.dateValue}>
                  {formatDate(tour.startDate)}
                </Text>
              </View>

              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>{formatDate(tour.endDate)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Itinerary Card */}
        {tour.itinerary.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="map-outline" size={20} color="#1E3A8A" />
              <Text style={styles.cardTitle}>Itinerary</Text>
            </View>

            <View style={styles.cardContent}>
              {tour.itinerary.map((item, index) => (
                <View key={index} style={styles.itineraryItem}>
                  <View style={styles.itineraryHeader}>
                    <Text style={styles.itineraryActivity}>
                      {item.activity}
                    </Text>
                    <Text style={styles.itineraryDate}>
                      {formatDate(item.date)}
                    </Text>
                  </View>

                  {item.details ? (
                    <Text style={styles.itineraryDetails}>{item.details}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Companions Card */}
        {tour.companions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people-outline" size={20} color="#1E3A8A" />
              <Text style={styles.cardTitle}>Travel Companions</Text>
            </View>

            <View style={styles.cardContent}>
              {tour.companions.map((companion, index) => (
                <View key={index} style={styles.companionItem}>
                  <View style={styles.companionAvatar}>
                    <Text style={styles.companionInitial}>
                      {companion.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.companionInfo}>
                    <Text style={styles.companionName}>{companion.name}</Text>
                    <Text style={styles.companionEmail}>{companion.email}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cost Breakdown Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={20} color="#1E3A8A" />
            <Text style={styles.cardTitle}>Cost Breakdown</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Travel</Text>
              <Text style={styles.costValue}>Rs {tour.travelCost}</Text>
            </View>

            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Food</Text>
              <Text style={styles.costValue}>Rs {tour.foodCost}</Text>
            </View>

            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Accommodation</Text>
              <Text style={styles.costValue}>Rs {tour.accommodationCost}</Text>
            </View>

            {tour.miscellaneousCost > 0 && (
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Miscellaneous</Text>
                <Text style={styles.costValue}>
                  Rs {tour.miscellaneousCost}
                </Text>
              </View>
            )}

            <View style={styles.totalCostItem}>
              <Text style={styles.totalCostLabel}>Total Budget</Text>
              <Text style={styles.totalCostValue}>Rs {tour.totalBudget}</Text>
            </View>
          </View>
        </View>

        {/* Add Review Button (if not the creator) */}
        {tour.createdBy !== userEmail && (
          <View style={styles.reviewsContainer}>
            <Reviews itemId={id} itemType="tour" />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF4444",
    marginVertical: 12,
  },
  backButton: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  headerImageContainer: {
    height: 300,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  shareBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  destinationContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  destinationName: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  messageButton: {
    backgroundColor: "#3B82F6",
  },
  joinButton: {
    backgroundColor: "#10B981",
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  ownerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  ownerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#3B82F6",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  ownerButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  detailsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#1F2937",
  },
  cardContent: {
    padding: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  overviewItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 12,
  },
  overviewText: {
    marginLeft: 8,
    color: "#4B5563",
    textTransform: "capitalize",
  },
  datesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateItem: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: "#4B5563",
  },
  itineraryItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
    paddingLeft: 12,
    marginBottom: 16,
    paddingVertical: 4,
  },
  itineraryHeader: {
    marginBottom: 4,
  },
  itineraryActivity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    textTransform: "capitalize",
  },
  itineraryDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  itineraryDetails: {
    fontSize: 14,
    color: "#4B5563",
    textTransform: "capitalize",
  },
  companionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  companionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  companionInitial: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  companionInfo: {
    flex: 1,
  },
  companionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  companionEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  costItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  costLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  costValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  totalCostItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E3A8A",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  reviewButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PackageDetails;
