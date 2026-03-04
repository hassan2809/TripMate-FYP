import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Reviews from "@/components/Reviews";

const AccommodationDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const [room, setRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const windowWidth = Dimensions.get("window").width;
  const mainImageScrollViewRef = useRef(null);

  // Fetch user email from AsyncStorage
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        setUserEmail(email || "");
      } catch (error) {
        console.error("Error getting email from storage:", error);
      }
    };

    getUserEmail();
  }, []);

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
        setLoading(false);
        Alert.alert("Error", "Failed to load room details");
      }
    };

    if (id) {
      fetchRoomDetails();
    }
  }, [id]);

  const handleBookNow = () => {
    navigation.navigate("AccommodationBooking", { id });
  };

  const handleMessageCreator = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You need to be logged in to message the host");
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/v1/chat/ensureConversation`,
        { creatorId: room.user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigation.navigate("Chat", { contactId: room.user._id });
    } catch (error) {
      console.error("Failed to create or find conversation:", error);
      Alert.alert("Error", "Failed to start conversation");
    }
  };

  const handleDeleteRoomListing = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this room listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await axios.delete(
                `http://localhost:8000/api/v1/roomListing/deleteRoomListing/${room._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.data.success) {
                Alert.alert("Success", response.data.message);
                navigation.goBack();
              }
            } catch (error) {
              console.error("Error deleting room:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete room"
              );
            }
          },
        },
      ]
    );
  };

  const handleEditRoomListing = () => {
    navigation.navigate("RoomListing", { roomId: room._id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={styles.errorText}>Room not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back to Accommodations</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Split amenities string into array
  const amenitiesList = room.amenities
    ? room.amenities.split(",").map((item) => item.trim())
    : [];

  const renderImageIndicators = (images) => {
    return (
      <View style={styles.indicatorContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeImageIndex ? styles.activeIndicator : null,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Gallery */}
      <View style={styles.imageGalleryContainer}>
        <ScrollView
          horizontal
          ref={mainImageScrollViewRef}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const x = event.nativeEvent.contentOffset.x;
            setActiveImageIndex(Math.round(x / windowWidth));
          }}
          scrollEventThrottle={16}
        >
          {room.images && room.images.length > 0 ? (
            room.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[styles.mainImage, { width: windowWidth }]}
                resizeMode="cover"
              />
            ))
          ) : (
            <View style={[styles.noImageView, { width: windowWidth }]}>
              <Ionicons name="home-outline" size={60} color="#ccc" />
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
        </ScrollView>

        {/* Image Indicators */}
        {room.images &&
          room.images.length > 0 &&
          renderImageIndicators(room.images)}

        {/* Edit/Delete buttons for owner */}
        {room.user.email === userEmail && (
          <View style={styles.ownerButtonsContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditRoomListing}
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.ownerButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteRoomListing}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.ownerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Thumbnail Strip */}
      {room.images && room.images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
        >
          {room.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setActiveImageIndex(index);
                mainImageScrollViewRef.current?.scrollTo({
                  x: index * windowWidth,
                  animated: true,
                });
              }}
              style={[
                styles.thumbnailWrapper,
                activeImageIndex === index ? styles.activeThumbnail : null,
              ]}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Room title and location */}
        <Text style={styles.roomTitle}>{room.title}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={18} color="#6B7280" />
          <Text style={styles.locationText}>{room.location}</Text>
        </View>

        {/* Room details card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="home-outline" size={18} color="#3B82F6" />
              <Text style={styles.detailText}>{room.roomType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#3B82F6"
              />
              <Text style={styles.detailText}>{room.furnished}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="wallet-outline" size={18} color="#3B82F6" />
              <Text style={styles.detailText}>Rs {room.price}/night</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{room.description}</Text>
        </View>

        {/* Amenities */}
        {amenitiesList.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {amenitiesList.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#3B82F6"
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Booking Card */}
        <View style={styles.bookingCard}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>Rs {room.price}</Text>
            <Text style={styles.perNightText}>per night</Text>
          </View>

          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={handleBookNow}
          >
            <Text style={styles.bookNowButtonText}>Book Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactHostButton}
            onPress={handleMessageCreator}
          >
            <Text style={styles.contactHostButtonText}>Contact Host</Text>
          </TouchableOpacity>

          <View style={styles.instantBookingContainer}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.instantBookingText}>
              Instant booking available
            </Text>
          </View>
        </View>

        {/* Reviews Section */}
        {room.user.email !== userEmail && (
          <View style={styles.reviewsContainer}>
            <Reviews itemId={id} itemType="room" />
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EF4444",
    marginVertical: 16,
  },
  backButton: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imageGalleryContainer: {
    position: "relative",
    height: 300,
  },
  mainImage: {
    height: 300,
  },
  noImageView: {
    height: 300,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#9CA3AF",
    marginTop: 8,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: "#fff",
  },
  ownerButtonsContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  ownerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  thumbnailContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
    overflow: "hidden",
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: 16,
  },
  roomTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
    textTransform: "capitalize",
  },
  amenitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  priceText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  perNightText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  bookNowButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  bookNowButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  contactHostButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  contactHostButtonText: {
    color: "#1F2937",
    fontWeight: "bold",
    fontSize: 16,
  },
  instantBookingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  instantBookingText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
  },
  reviewsContainer: {
    marginBottom: 24,
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  addReviewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
});

export default AccommodationDetails;
