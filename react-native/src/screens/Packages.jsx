import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

// Default tour image if needed
import DefaultTourImage from "../../assets/images/accommodation.jpg";

const windowWidth = Dimensions.get("window").width;

const Packages = () => {
  const [tours, setTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [tourImages, setTourImages] = useState({});

  const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
  const UNSPLASH_API_KEY = "wcqsBI0njGP0VM0ObAYOog4vFttbbvWj6436i3EaXn8";

  const navigation = useNavigation();

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
        return response.data.results[0].urls.regular;
      }
      return null;
    } catch (error) {
      console.error("Error fetching live image:", error);
      return null;
    }
  };

  // Fetch tour packages
  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/v1/tour/getTourPackages"
      );
      if (response.data.success) {
        setTours(response.data.data);

        const imagePromises = response.data.data.map(async (tour) => {
          const imageUrl = await fetchLiveImage(tour.destination);
          return { tourId: tour._id, imageUrl };
        });

        const images = await Promise.all(imagePromises);
        const imageMap = {};
        images.forEach((item) => {
          if (item.imageUrl) {
            imageMap[item.tourId] = item.imageUrl;
          }
        });

        setTourImages(imageMap);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tours:", error);
      setLoading(false);
    }
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTours();
      return () => {
        // Clean up if needed
      };
    }, [])
  );

  // Filter tours based on search term
  const filteredTours = tours.filter((tour) => {
    const matchesSearch =
      tour.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tour.createdBy &&
        tour.createdBy.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  // Navigate to tour details
  const handleTourPress = (tourId) => {
    navigation.navigate("PackageDetails", { id: tourId });
  };

  // Render a tour card
  const renderTourCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleTourPress(item._id)}
      activeOpacity={0.9}
    >
      {/* Tour Image */}
      <View style={styles.imageContainer}>
        <Image
          // source={DefaultTourImage}
          source={tourImages[item._id] ? { uri: tourImages[item._id] } : DefaultTourImage}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {/* Tour Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.numberOfDays} Days</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.tourTitle}>{item.destination}</Text>

        {/* Transport Mode */}
        <View style={styles.infoRow}>
          <Ionicons name="bus-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.transportMode}</Text>
        </View>

        {/* Price */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceLabel}>Total:</Text>
          <Text style={styles.priceValue}>Rs {item.totalBudget}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Tours</Text>
          <Text style={styles.pageSubtitle}>
            Book the ticket of ongoing tour
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("TourPlanning")}>
          <Ionicons name="add-circle-outline" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tours..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9CA3AF"
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm("")}>
            <Ionicons name="close-circle" size={18} color="#6B7280" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tour List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading tours...</Text>
        </View>
      ) : filteredTours.length > 0 ? (
        <FlatList
          data={filteredTours}
          renderItem={renderTourCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.toursList}
          showsVerticalScrollIndicator={false}
          numColumns={windowWidth > 500 ? 2 : 1} // Responsive grid
          columnWrapperStyle={windowWidth > 500 ? styles.row : null}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="earth-outline" size={60} color="#D1D5DB" />
          <Text style={styles.emptyText}>No tours found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
    paddingTop: 40,
  },
  header: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: "#1F2937",
  },
  toursList: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    width: windowWidth > 500 ? (windowWidth - 40) / 2 : "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B5563",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
});

export default Packages;
