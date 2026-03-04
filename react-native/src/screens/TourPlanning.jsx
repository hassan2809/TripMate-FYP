import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  AntDesign,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import {
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  differenceInCalendarDays,
} from "date-fns";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomDatePicker from "@/components/CustomDatePicker";

const { width } = Dimensions.get("window");

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const TourPlan = ({ navigation, route }) => {
  const { id } = route.params || {};
  const isEditing = !!id;
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      destination: "",
      transportMode: "",
      travelCost: "",
      foodCost: "",
      accommodationCost: "",
      miscellaneousCost: "",
      startDate: null,
      endDate: null,
    },
  });

  // Watch values
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const travelCost = watch("travelCost") || "0";
  const foodCost = watch("foodCost") || "0";
  const accommodationCost = watch("accommodationCost") || "0";
  const miscellaneousCost = watch("miscellaneousCost") || "0";

  // States for form functionality
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transportMode, setTransportMode] = useState("");
  const [dateError, setDateError] = useState("");
  const [companions, setCompanions] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showTransportPicker, setShowTransportPicker] = useState(false);

  // Companion form states
  const [companionName, setCompanionName] = useState("");
  const [companionEmail, setCompanionEmail] = useState("");

  // Itinerary form states
  const [activity, setActivity] = useState("");
  const [itineraryDate, setItineraryDate] = useState(null);
  const [itineraryDetails, setItineraryDetails] = useState("");

  const totalBudget =
    parseFloat(travelCost || "0") +
    parseFloat(foodCost || "0") +
    parseFloat(accommodationCost || "0") +
    parseFloat(miscellaneousCost || "0");

  useEffect(() => {
    if (startDate && endDate) {
      if (isAfter(new Date(startDate), new Date(endDate))) {
        setDateError("End date must be after start date");
      } else {
        setDateError("");
      }
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (isEditing && id) {
      fetchTourData();
    }
  }, [id]);

  const fetchTourData = async () => {
    try {
      setIsSubmitting(true);
      const currentUserEmail = await AsyncStorage.getItem("email");
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:8000/api/v1/tour/getTourPackage/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data.success &&
        response.data.data.createdBy === currentUserEmail
      ) {
        const tourData = response.data.data;
        setValue("destination", tourData.destination);
        setTransportMode(tourData.transportMode);
        setValue("transportMode", tourData.transportMode);
        setValue("travelCost", tourData.travelCost.toString());
        setValue("foodCost", tourData.foodCost.toString());
        setValue("accommodationCost", tourData.accommodationCost.toString());
        setValue("miscellaneousCost", tourData.miscellaneousCost.toString());
        setValue("startDate", new Date(tourData.startDate));
        setValue("endDate", new Date(tourData.endDate));
        setCompanions(tourData.companions || []);
        setItinerary(
          tourData.itinerary.map((item) => ({
            ...item,
            date: new Date(item.date),
          })) || []
        );
      } else {
        Alert.alert(
          "Not Authorized",
          "You are not authorized to edit this tour.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error("Error fetching tour details:", error);
      Alert.alert("Error", "Failed to fetch tour details. Please try again.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data) => {
    if (dateError) {
      Alert.alert("Date Error", dateError);
      return;
    }

    if (!data.destination) {
      Alert.alert("Missing Information", "Please enter a destination");
      return;
    }

    if (!data.transportMode) {
      Alert.alert("Missing Information", "Please select a transport mode");
      return;
    }

    if (!data.startDate || !data.endDate) {
      Alert.alert("Missing Information", "Please select start and end dates");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      const createdBy = await AsyncStorage.getItem("email");

      const numberOfDays =
        differenceInCalendarDays(
          new Date(data.endDate),
          new Date(data.startDate)
        ) + 1;

      const formData = {
        ...data,
        companions,
        itinerary,
        numberOfDays,
        totalBudget,
        createdBy,
      };

      const url = isEditing
        ? `http://localhost:8000/api/v1/tour/updateTour/${id}`
        : "http://localhost:8000/api/v1/tour/postTourPlan";

      const response = await axios[isEditing ? "put" : "post"](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        Alert.alert(
          "Success!",
          isEditing
            ? "Tour updated successfully!"
            : "Tour created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to tour details or back to previous screen
                if (isEditing) {
                  navigation.goBack();
                } else if (response.data.tourId) {
                  navigation.navigate("TourDetails", {
                    id: response.data.tourId,
                  });
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );

        // Reset form state
        reset();
        setCompanions([]);
        setItinerary([]);
        setTransportMode("");
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransportSelect = (value) => {
    setTransportMode(value);
    setValue("transportMode", value);
    setShowTransportPicker(false);
  };

  const handleCompanionSave = () => {
    if (!companionName.trim()) {
      Alert.alert("Missing Information", "Please enter companion name");
      return;
    }
    if (!companionEmail.trim()) {
      Alert.alert("Missing Information", "Please enter companion email");
      return;
    }

    setCompanions([
      ...companions,
      { name: companionName, email: companionEmail },
    ]);
    setCompanionName("");
    setCompanionEmail("");
    setShowCompanionModal(false);
  };

  const handleCompanionDelete = (index) => {
    Alert.alert(
      "Remove Companion",
      "Are you sure you want to remove this companion?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            setCompanions(companions.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  const validateItineraryDate = (date) => {
    if (!startDate || !endDate) {
      Alert.alert(
        "Missing Information",
        "Please select trip start and end dates first"
      );
      return false;
    }

    if (!date) {
      Alert.alert(
        "Missing Information",
        "Please select a date for this activity"
      );
      return false;
    }

    if (
      !isWithinInterval(date, {
        start: new Date(startDate),
        end: new Date(endDate),
      })
    ) {
      Alert.alert(
        "Invalid Date",
        "Activity date must be between trip start and end dates"
      );
      return false;
    }

    return true;
  };

  const handleItinerarySave = () => {
    if (!activity.trim()) {
      Alert.alert("Missing Information", "Please enter an activity name");
      return;
    }

    if (!validateItineraryDate(itineraryDate)) {
      return;
    }

    setItinerary([
      ...itinerary,
      { activity, date: itineraryDate, details: itineraryDetails || "" },
    ]);

    setActivity("");
    setItineraryDate(null);
    setItineraryDetails("");
    setShowItineraryModal(false);
  };

  const handleItineraryDelete = (index) => {
    Alert.alert(
      "Remove Activity",
      "Are you sure you want to remove this activity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setItinerary(itinerary.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  // UI Components
  const renderSectionTitle = (icon, title) => (
    <View style={styles.sectionTitleContainer}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderCard = (title, icon, content) => (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={styles.card}
    >
      <LinearGradient colors={["#f0f9ff", "#e0f2fe"]} style={styles.cardHeader}>
        {renderSectionTitle(icon, title)}
      </LinearGradient>
      <View style={styles.cardContent}>{content}</View>
    </Animated.View>
  );

  const renderTransportOptions = () => (
    <Modal
      visible={showTransportPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Transport Mode</Text>

          <TouchableOpacity
            style={[
              styles.transportOption,
              transportMode === "flight" && styles.selectedTransport,
            ]}
            onPress={() => handleTransportSelect("flight")}
          >
            <FontAwesome5
              name="plane"
              size={20}
              color={transportMode === "flight" ? "#2563eb" : "#64748b"}
            />
            <Text
              style={[
                styles.transportText,
                transportMode === "flight" && styles.selectedTransportText,
              ]}
            >
              Flight
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.transportOption,
              transportMode === "train" && styles.selectedTransport,
            ]}
            onPress={() => handleTransportSelect("train")}
          >
            <FontAwesome5
              name="train"
              size={20}
              color={transportMode === "train" ? "#2563eb" : "#64748b"}
            />
            <Text
              style={[
                styles.transportText,
                transportMode === "train" && styles.selectedTransportText,
              ]}
            >
              Train
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.transportOption,
              transportMode === "bus" && styles.selectedTransport,
            ]}
            onPress={() => handleTransportSelect("bus")}
          >
            <FontAwesome5
              name="bus"
              size={20}
              color={transportMode === "bus" ? "#2563eb" : "#64748b"}
            />
            <Text
              style={[
                styles.transportText,
                transportMode === "bus" && styles.selectedTransportText,
              ]}
            >
              Bus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.transportOption,
              transportMode === "car" && styles.selectedTransport,
            ]}
            onPress={() => handleTransportSelect("car")}
          >
            <FontAwesome5
              name="car"
              size={20}
              color={transportMode === "car" ? "#2563eb" : "#64748b"}
            />
            <Text
              style={[
                styles.transportText,
                transportMode === "car" && styles.selectedTransportText,
              ]}
            >
              Car
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowTransportPicker(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCompanionModal = () => (
    <Modal
      visible={showCompanionModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Travel Companion</Text>

          <View style={styles.inputContainer}>
            <FontAwesome5
              name="user"
              size={18}
              color="#64748b"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Companion Name"
              value={companionName}
              onChangeText={setCompanionName}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="email"
              size={18}
              color="#64748b"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Companion Email"
              value={companionEmail}
              onChangeText={setCompanionEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => setShowCompanionModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveModalButton]}
              onPress={handleCompanionSave}
            >
              <Text style={styles.saveModalButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderItineraryModal = () => (
    <Modal
      visible={showItineraryModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Activity</Text>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={18}
              color="#64748b"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Activity Name"
              value={activity}
              onChangeText={setActivity}
            />
          </View>

          <View style={{ marginVertical: 12 }}>
            <CustomDatePicker
              label="Activity Date"
              value={itineraryDate}
              onDateChange={setItineraryDate}
              placeholder="Select Activity Date"
              minimumDate={startDate ? new Date(startDate) : undefined}
              maximumDate={endDate ? new Date(endDate) : undefined}
              error={null}
            />
          </View>

          <View style={styles.textareaContainer}>
            <TextInput
              style={styles.textareaInput}
              placeholder="Activity Details"
              value={itineraryDetails}
              onChangeText={setItineraryDetails}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={() => setShowItineraryModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.saveModalButton]}
              onPress={handleItinerarySave}
            >
              <Text style={styles.saveModalButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar style="light" />

      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Tour Plan" : "Create Tour Plan"}
        </Text>
        <View style={styles.headerRight} />
      </View> */}

      {/* Main Content */}
      <AnimatedScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Destination Card */}
        {renderCard(
          "Destination Details",
          <FontAwesome5
            name="map-marker-alt"
            size={16}
            color="#1e40af"
            style={{ marginRight: 8 }}
          />,
          <View style={styles.destinationContent}>
            <Controller
              control={control}
              name="destination"
              rules={{ required: "Destination is required" }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={18}
                    color="#64748b"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Where are you going?"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.destination && (
              <Text style={styles.errorText}>
                <FontAwesome5
                  name="exclamation-circle"
                  size={14}
                  color="#ef4444"
                />{" "}
                {errors.destination.message}
              </Text>
            )}

            <View style={styles.dateContainer}>
              <View style={styles.datePickerWrapper}>
                <CustomDatePicker
                  label="Start Date"
                  value={startDate}
                  onDateChange={(date) => {
                    setValue("startDate", date);
                    // If end date exists and is before the new start date, clear it
                    if (endDate && isAfter(date, new Date(endDate))) {
                      setValue("endDate", null);
                    }
                  }}
                  placeholder="Select start date"
                  minimumDate={new Date()}
                  error={errors.startDate?.message}
                />
              </View>

              <View style={styles.datePickerWrapper}>
                <CustomDatePicker
                  label="End Date"
                  value={endDate}
                  onDateChange={(date) => setValue("endDate", date)}
                  placeholder="Select end date"
                  minimumDate={startDate ? new Date(startDate) : new Date()}
                  error={errors.endDate?.message || dateError}
                />
              </View>
            </View>

            {startDate && endDate && !dateError && (
              <View style={styles.tripDurationInfo}>
                <FontAwesome5
                  name="info-circle"
                  size={16}
                  color="#1e40af"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.tripDurationText}>
                  Trip duration:{" "}
                  {differenceInCalendarDays(
                    new Date(endDate),
                    new Date(startDate)
                  ) + 1}{" "}
                  days
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Transport Details Card */}
        {renderCard(
          "Travel Details",
          <FontAwesome5
            name="plane"
            size={16}
            color="#1e40af"
            style={{ marginRight: 8 }}
          />,
          <View>
            <View style={styles.transportContent}>
              <View style={styles.transportSection}>
                <Text style={styles.inputLabel}>Transport Mode</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowTransportPicker(true)}
                >
                  {transportMode ? (
                    <View style={styles.selectedTransportDisplay}>
                      {transportMode === "flight" && (
                        <FontAwesome5 name="plane" size={18} color="#2563eb" />
                      )}
                      {transportMode === "train" && (
                        <FontAwesome5 name="train" size={18} color="#2563eb" />
                      )}
                      {transportMode === "bus" && (
                        <FontAwesome5 name="bus" size={18} color="#2563eb" />
                      )}
                      {transportMode === "car" && (
                        <FontAwesome5 name="car" size={18} color="#2563eb" />
                      )}
                      <Text style={styles.selectedTransportText}>
                        {transportMode.charAt(0).toUpperCase() +
                          transportMode.slice(1)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.selectButtonText}>
                      Select transport mode
                    </Text>
                  )}
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#64748b"
                  />
                </TouchableOpacity>
                {errors.transportMode && (
                  <Text style={styles.errorText}>
                    <FontAwesome5
                      name="exclamation-circle"
                      size={14}
                      color="#ef4444"
                    />{" "}
                    {errors.transportMode.message}
                  </Text>
                )}
              </View>

              <View style={styles.transportSection}>
                <Text style={styles.inputLabel}>Travel Cost (Rs)</Text>
                <Controller
                  control={control}
                  name="travelCost"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <FontAwesome5
                        name="money-bill-wave"
                        size={18}
                        color="#64748b"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Estimated cost"
                        value={value}
                        onChangeText={(text) => {
                          // Ensure only numbers are entered
                          if (/^\d*$/.test(text)) {
                            onChange(text);
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </View>
            </View>
          </View>
        )}
        {/* Companions Card */}
        {renderCard(
          "Travel Companions",
          <FontAwesome5
            name="users"
            size={16}
            color="#1e40af"
            style={{ marginRight: 8 }}
          />,
          <View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCompanionModal(true)}
            >
              <AntDesign name="plus" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Companion</Text>
            </TouchableOpacity>

            {companions.length > 0 ? (
              <View style={styles.companionsList}>
                {companions.map((companion, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInRight.delay(index * 100)}
                    style={styles.companionItem}
                  >
                    <View style={styles.companionInfo}>
                      <View style={styles.companionAvatar}>
                        <Text style={styles.companionInitial}>
                          {companion.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.companionDetails}>
                        <Text style={styles.companionName}>
                          {companion.name}
                        </Text>
                        <Text style={styles.companionEmail}>
                          {companion.email}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleCompanionDelete(index)}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={22}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome5 name="users" size={24} color="#94a3b8" />
                <Text style={styles.emptyStateText}>
                  No companions added yet
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Itinerary Card */}
        {renderCard(
          "Trip Itinerary",
          <MaterialCommunityIcons
            name="calendar-text"
            size={16}
            color="#1e40af"
            style={{ marginRight: 8 }}
          />,
          <View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (!startDate || !endDate) {
                  Alert.alert(
                    "Missing Information",
                    "Please select trip start and end dates first"
                  );
                  return;
                }
                setShowItineraryModal(true);
              }}
            >
              <AntDesign name="plus" size={20} color="white" />
              <Text style={styles.addButtonText}>Add Activity</Text>
            </TouchableOpacity>

            {itinerary.length > 0 ? (
              <View style={styles.itineraryList}>
                {itinerary.map((item, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInRight.delay(index * 100)}
                    style={styles.itineraryItem}
                  >
                    <View style={styles.itineraryDateBadge}>
                      <Text style={styles.itineraryDateText}>
                        {format(new Date(item.date), "MMM d")}
                      </Text>
                    </View>
                    <View style={styles.itineraryContent}>
                      <Text style={styles.itineraryActivity}>
                        {item.activity}
                      </Text>
                      {item.details ? (
                        <Text style={styles.itineraryDetails} numberOfLines={2}>
                          {item.details}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleItineraryDelete(index)}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={22}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={24}
                  color="#94a3b8"
                />
                <Text style={styles.emptyStateText}>
                  No activities added yet
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Budget Card */}
        {renderCard(
          "Budget Planning",
          <FontAwesome5
            name="credit-card"
            size={16}
            color="#1e40af"
            style={{ marginRight: 8 }}
          />,
          <View style={styles.budgetContent}>
            <View style={styles.budgetRow}>
              <View style={styles.budgetItem}>
                <Text style={styles.inputLabel}>Travel Cost (Rs)</Text>
                <Controller
                  control={control}
                  name="travelCost"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <FontAwesome5
                        name="plane"
                        size={16}
                        color="#64748b"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={value}
                        onChangeText={(text) => {
                          if (/^\d*$/.test(text)) {
                            onChange(text);
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </View>

              <View style={styles.budgetItem}>
                <Text style={styles.inputLabel}>Food Cost (Rs)</Text>
                <Controller
                  control={control}
                  name="foodCost"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons
                        name="food-fork-drink"
                        size={18}
                        color="#64748b"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={value}
                        onChangeText={(text) => {
                          if (/^\d*$/.test(text)) {
                            onChange(text);
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </View>
            </View>

            <View style={styles.budgetRow}>
              <View style={styles.budgetItem}>
                <Text style={styles.inputLabel}>Accommodation (Rs)</Text>
                <Controller
                  control={control}
                  name="accommodationCost"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <FontAwesome5
                        name="hotel"
                        size={16}
                        color="#64748b"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={value}
                        onChangeText={(text) => {
                          if (/^\d*$/.test(text)) {
                            onChange(text);
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </View>

              <View style={styles.budgetItem}>
                <Text style={styles.inputLabel}>Miscellaneous (Rs)</Text>
                <Controller
                  control={control}
                  name="miscellaneousCost"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputContainer}>
                      <Feather
                        name="more-horizontal"
                        size={18}
                        color="#64748b"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="0"
                        value={value}
                        onChangeText={(text) => {
                          if (/^\d*$/.test(text)) {
                            onChange(text);
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                />
              </View>
            </View>

            <View style={styles.totalBudgetContainer}>
              <LinearGradient
                colors={["#dbeafe", "#bfdbfe"]}
                style={styles.totalBudgetGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.totalBudgetContent}>
                  <Text style={styles.totalBudgetLabel}>
                    Total Estimated Budget
                  </Text>
                  <Text style={styles.totalBudgetAmount}>
                    Rs {totalBudget.toLocaleString()}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (dateError || isSubmitting) && styles.disabledButton,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={dateError || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.submitButtonText}>
                {isEditing ? "Updating..." : "Creating..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? "Update Tour Plan" : "Create Tour Plan"}
            </Text>
          )}
        </TouchableOpacity>
      </AnimatedScrollView>

      {/* Modals */}
      {renderTransportOptions()}
      {renderCompanionModal()}
      {renderItineraryModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0f2fe",
  },
  cardContent: {
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
  },
  destinationContent: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#334155",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  datePickerWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  datePickerButtonText: {
    color: "#94a3b8",
    flex: 1,
  },
  dateSelected: {
    color: "#334155",
  },
  tripDurationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tripDurationText: {
    color: "#1e40af",
    fontSize: 14,
  },
  transportContent: {
    gap: 16,
  },
  transportSection: {
    gap: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  selectButtonText: {
    color: "#94a3b8",
  },
  selectedTransportDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedTransportText: {
    color: "#334155",
    fontWeight: "500",
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  emptyStateText: {
    color: "#94a3b8",
    marginTop: 8,
    fontSize: 14,
  },
  companionsList: {
    gap: 12,
  },
  companionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  companionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  companionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#bfdbfe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  companionInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
  },
  companionDetails: {
    flex: 1,
  },
  companionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
  },
  companionEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  deleteButton: {
    padding: 4,
  },
  itineraryList: {
    gap: 12,
  },
  itineraryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  itineraryDateBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 70,
  },
  itineraryDateText: {
    color: "#1e40af",
    fontWeight: "600",
    fontSize: 14,
  },
  itineraryContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itineraryActivity: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 2,
  },
  itineraryDetails: {
    fontSize: 14,
    color: "#64748b",
  },
  budgetContent: {
    gap: 16,
  },
  budgetRow: {
    flexDirection: "row",
    gap: 12,
  },
  budgetItem: {
    flex: 1,
    gap: 8,
  },
  totalBudgetContainer: {
    marginTop: 8,
  },
  totalBudgetGradient: {
    borderRadius: 12,
    overflow: "hidden",
  },
  totalBudgetContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  totalBudgetLabel: {
    fontSize: 14,
    color: "#1e40af",
    marginBottom: 4,
  },
  totalBudgetAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e40af",
  },
  submitButton: {
    backgroundColor: "#1e40af",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#1e40af",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    flex: 1,
    color: "#334155",
    fontSize: 16,
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    height: 120,
  },
  textareaInput: {
    flex: 1,
    textAlignVertical: "top",
    color: "#334155",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButton: {
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  cancelModalButtonText: {
    color: "#475569",
    fontWeight: "600",
  },
  saveModalButton: {
    backgroundColor: "#2563eb",
    marginLeft: 8,
  },
  saveModalButtonText: {
    color: "white",
    fontWeight: "600",
  },
  transportOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "#f8fafc",
  },
  selectedTransport: {
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#93c5fd",
  },
  transportText: {
    fontSize: 16,
    marginLeft: 16,
    color: "#64748b",
  },
  selectedTransportText: {
    fontWeight: "600",
    color: "#2563eb",
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cancelButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default TourPlan;
