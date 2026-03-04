import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const Accommodation = () => {
  const [listings, setListings] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigation = useNavigation();
  const windowWidth = Dimensions.get("window").width;

  const { control, handleSubmit, watch, setValue } = useForm({
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
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/roomListing/getRoomListings"
      );
      if (response.data.success) {
        setListings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchListings();
      return () => {
        // Clean up if needed
      };
    }, [])
  );

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/roomListing/filterRoomListings",
        data
      );
      if (response.data.success) {
        setListings(response.data.data);
        setIsFilterOpen(false); // Close filter modal after applying
      }
    } catch (error) {
      console.error("Error filtering listings:", error);
    }
  };

  const navigateToDetails = (id) => {
    navigation.navigate("AccommodationDetails", { id });
  };

  const renderImageIndicators = (images, activeIndex) => {
    return (
      <View style={styles.indicatorContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeIndex ? styles.activeIndicator : null,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigateToDetails(item._id)}
        activeOpacity={0.9}
      >
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const x = event.nativeEvent.contentOffset.x;
              setActiveImageIndex(Math.round(x / windowWidth));
            }}
            scrollEventThrottle={16}
          >
            {item.images && item.images.length > 0 ? (
              item.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={[styles.image, { width: windowWidth - 32 }]}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[styles.noImage, { width: windowWidth - 32 }]}>
                <Ionicons name="home-outline" size={50} color="#ccc" />
                <Text style={styles.noImageText}>No image available</Text>
              </View>
            )}
          </ScrollView>

          {/* Image Indicators */}
          {item.images &&
            item.images.length > 0 &&
            renderImageIndicators(item.images, activeImageIndex)}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location}>{item.location}</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="home-outline" size={16} color="#555" />
              <Text style={styles.detailText}>{item.roomType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#555"
              />
              <Text style={styles.detailText}>{item.furnished}</Text>
            </View>
          </View>

          <View style={styles.priceBookContainer}>
            <Text style={styles.price}>Rs {item.price}/night</Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigateToDetails(item._id)}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setIsFilterOpen(true)}
      >
        <Ionicons name="options-outline" size={18} color="#fff" />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={isFilterOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Price Range */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Price Range</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={10000}
                  step={100}
                  value={minPrice}
                  onValueChange={(value) => setValue("minPrice", value)}
                  minimumTrackTintColor="#2563EB"
                  maximumTrackTintColor="#D1D5DB"
                  thumbTintColor="#2563EB"
                  style={styles.slider}
                />
                <View style={styles.priceRangeLabels}>
                  <Text style={styles.priceText}>Rs {minPrice}</Text>
                  <Text style={styles.priceText}>Rs {maxPrice}</Text>
                </View>
              </View>

              {/* Room Type */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Room Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={watch("roomType")}
                    onValueChange={(itemValue) =>
                      setValue("roomType", itemValue)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Any" value="any" />
                    <Picker.Item label="Entire Place" value="entire" />
                    <Picker.Item label="Private Room" value="private" />
                    <Picker.Item label="Shared Room" value="shared" />
                  </Picker>
                </View>
              </View>

              {/* Location */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter location"
                  value={watch("location")}
                  onChangeText={(text) => setValue("location", text)}
                />
              </View>

              {/* Furnished Status */}
              <View style={styles.filterItem}>
                <Text style={styles.filterLabel}>Furnished Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={watch("furnished")}
                    onValueChange={(itemValue) =>
                      setValue("furnished", itemValue)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Any" value="any" />
                    <Picker.Item label="Furnished" value="Furnished" />
                    <Picker.Item label="Unfurnished" value="Unfurnished" />
                  </Picker>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setValue("minPrice", 0);
                  setValue("maxPrice", 10000);
                  setValue("roomType", "");
                  setValue("location", "");
                  setValue("furnished", "");
                }}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Listings */}
      {listings.length > 0 ? (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listingsContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={50} color="#ccc" />
          <Text style={styles.noResultsText}>No accommodations found</Text>
          <Text style={styles.noResultsSubText}>
            Try adjusting your filters
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
    paddingTop: 40,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E3A8A", // dark blue
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  filterItem: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  slider: {
    height: 40,
  },
  priceRangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceText: {
    color: "#6B7280",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  picker: {
    height: 50,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "transparent",
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#6B7280",
    fontWeight: "bold",
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1E3A8A", // dark blue
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listingsContainer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    height: 200,
    position: "relative",
  },
  image: {
    height: 200,
  },
  noImage: {
    height: 200,
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
    bottom: 10,
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
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
    textTransform: "capitalize",
  },
  priceBookContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bookButton: {
    backgroundColor: "#1E3A8A", // dark blue
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    color: "#6B7280",
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});

export default Accommodation;
