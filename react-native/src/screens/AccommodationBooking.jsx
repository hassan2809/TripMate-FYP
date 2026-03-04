import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as WebBrowser from 'expo-web-browser';

const AccommodationBooking = ({ route, navigation }) => {
  const { id } = route.params;
  const windowWidth = Dimensions.get("window").width;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [numGuests, setNumGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("payOnSite");
  
  // For showing date pickers
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  
  // Form validation errors
  const [errors, setErrors] = useState({});

  // Configure WebBrowser for better UX
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
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

  // Calculate total price when dates or guests change
  useEffect(() => {
    if (room) {
      try {
        const nights = Math.max(1, calculateNights(checkInDate, checkOutDate));

        // Base price calculation
        let price = room.price * nights;

        // Add extra guest fee if applicable (assuming base price is for 1 guest)
        const extraGuests = Math.max(0, numGuests - 1);
        if (extraGuests > 0) {
          // Assume 10% extra per additional guest
          price += price * 0.1 * extraGuests;
        }

        setTotalPrice(price);
      } catch (error) {
        console.error("Error calculating total price:", error);
      }
    }
  }, [room, checkInDate, checkOutDate, numGuests]);

  // Load user data from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userEmail = await AsyncStorage.getItem("email");
        const userName = await AsyncStorage.getItem("name");
        if (userEmail) setEmail(userEmail);
        if (userName) setName(userName);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const calculateNights = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      
      // If check-out date is before the new check-in date, update it
      if (checkOutDate <= selectedDate) {
        const newCheckOutDate = new Date(selectedDate);
        newCheckOutDate.setDate(newCheckOutDate.getDate() + 1);
        setCheckOutDate(newCheckOutDate);
      }
    }
  };

  const handleCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }

    if (checkOutDate <= checkInDate) {
      newErrors.checkOutDate = "Check-out date must be after check-in date";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCheckInDate(new Date());
    setCheckOutDate(new Date(new Date().setDate(new Date().getDate() + 1)));
    setNumGuests(1);
    setSpecialRequests("");
    setPaymentMethod("payOnSite");
    setErrors({});
  };

  const handleStripePayment = async (stripeUrl) => {
    try {
      // Show loading indicator for better UX
      Alert.alert(
        "Redirecting to Payment",
        "You will be redirected to complete your payment securely.",
        [
          {
            text: "Continue",
            onPress: async () => {
              try {
                const result = await WebBrowser.openBrowserAsync(stripeUrl, {
                  showTitle: true,
                  toolbarColor: '#1E3A8A',
                  secondaryToolbarColor: '#1E3A8A',
                  enableBarCollapsing: false,
                  showInRecents: true,
                  presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                });

                // Handle the result based on how the browser was closed
                if (result.type === 'cancel') {
                  Alert.alert(
                    "Payment Cancelled", 
                    "You cancelled the payment process. Your booking has not been confirmed.",
                    [
                      { text: "Try Again", style: "default" },
                      { text: "OK", style: "cancel" }
                    ]
                  );
                } else if (result.type === 'dismiss') {
                  Alert.alert(
                    "Payment Process Completed",
                    "Please check your bookings to confirm if the payment was successful.",
                    [
                      {
                        text: "Check Bookings",
                        onPress: () => navigation.navigate("MyBookings"),
                      },
                      { text: "OK", style: "default" }
                    ]
                  );
                }
              } catch (browserError) {
                console.error("Error opening browser:", browserError);
                Alert.alert(
                  "Error",
                  "Could not open payment page. Please check your internet connection and try again."
                );
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error handling Stripe payment:", error);
      Alert.alert("Error", "Could not process payment. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        Alert.alert("Error", "You need to be logged in to book a room");
        setIsSubmitting(false);
        return;
      }

      const bookingData = {
        name,
        email,
        phone,
        checkInDate: formatDate(checkInDate),
        checkOutDate: formatDate(checkOutDate),
        numGuests,
        specialRequests,
        paymentMethod,
        roomId: id,
        totalPrice,
        status: "pending",
      };

      const response = await axios.post(
        "http://localhost:8000/api/v1/auth/createBooking",
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Handle Stripe payment
        if (paymentMethod === "stripe" && response.data.url) {
          setIsSubmitting(false); // Reset submitting state before opening browser
          await handleStripePayment(response.data.url);
          return;
        }

        // Handle Pay on Site - booking created successfully
        Alert.alert(
          "Booking Confirmed!",
          response.data.message || "Your booking has been confirmed successfully!",
          [
            {
              text: "View My Bookings",
              onPress: () => {
                resetForm();
                navigation.navigate("MyBookings");
              },
            },
            {
              text: "Book Another Room",
              onPress: () => {
                resetForm();
                navigation.goBack();
              },
            },
            {
              text: "OK",
              style: "default",
              onPress: () => resetForm(),
            },
          ]
        );

      } else {
        Alert.alert("Error", response.data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      
      // Handle specific error cases
      let errorMessage = "Error creating booking. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "You have already booked this room";
      } else if (error.response?.status === 401) {
        errorMessage = "Please log in to continue";
        // Optional: Navigate to login
        // navigation.navigate("Login");
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add focus listener to refresh bookings when returning from payment
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This will run when the screen comes into focus
      // Useful for when user returns from payment
      console.log('Screen focused - user may have returned from payment');
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading room details...</Text>
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

  return (
    <ScrollView style={styles.container}>
      {/* Room Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Room Details</Text>
        
        {/* Room Images Carousel */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}
        >
          {room.images && room.images.length > 0 ? (
            room.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[styles.roomImage, { width: windowWidth - 64 }]}
                resizeMode="cover"
              />
            ))
          ) : (
            <View style={[styles.noImageView, { width: windowWidth - 64 }]}>
              <Ionicons name="home-outline" size={40} color="#ccc" />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}
        </ScrollView>

        {/* Room Information */}
        <View style={styles.roomInfoContainer}>
          <Text style={styles.roomTitle}>{room.title}</Text>
          <Text style={styles.roomLocation}>{room.location}</Text>

          <View style={styles.roomDetailRow}>
            <Text style={styles.roomDetailLabel}>Room Type:</Text>
            <Text style={styles.roomDetailValue}>{room.roomType}</Text>
          </View>

          <View style={styles.roomDetailRow}>
            <Text style={styles.roomDetailLabel}>Status:</Text>
            <Text style={styles.roomDetailValue}>{room.furnished}</Text>
          </View>

          <View style={styles.roomDetailRow}>
            <Text style={styles.roomDetailLabel}>Rate:</Text>
            <Text style={styles.roomDetailValue}>Rs {room.price}/night</Text>
          </View>

          {room.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{room.description}</Text>
            </View>
          )}

          {amenitiesList.length > 0 && (
            <View style={styles.amenitiesContainer}>
              <Text style={styles.amenitiesLabel}>Amenities</Text>
              {amenitiesList.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#3B82F6" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Booking Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Book Your Stay</Text>
        <Text style={styles.cardSubtitle}>Fill in your details to complete your booking</Text>

        {/* Personal Information */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Check-in Date*</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowCheckInPicker(true)}
            >
              <Text>{checkInDate.toDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
            {showCheckInPicker && (
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display="default"
                onChange={handleCheckInChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Check-out Date*</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowCheckOutPicker(true)}
            >
              <Text>{checkOutDate.toDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
            {showCheckOutPicker && (
              <DateTimePicker
                value={checkOutDate}
                mode="date"
                display="default"
                onChange={handleCheckOutChange}
                minimumDate={new Date(checkInDate.getTime() + 86400000)}
              />
            )}
            {errors.checkOutDate && <Text style={styles.errorText}>{errors.checkOutDate}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Number of Guests*</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={numGuests.toString()}
                onValueChange={(value) => setNumGuests(parseInt(value))}
                style={styles.picker}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Picker.Item
                    key={num}
                    label={`${num} ${num === 1 ? "Guest" : "Guests"}`}
                    value={num.toString()}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Special Requests (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special requests or requirements..."
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Payment Method Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Payment Method*</Text>
            
            {/* Pay on Site Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "payOnSite" && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod("payOnSite")}
            >
              <View style={styles.paymentIconContainer}>
                <View style={[styles.paymentIcon, { backgroundColor: "#D1FAE5" }]}>
                  <Ionicons name="location-outline" size={24} color="#059669" />
                </View>
              </View>
              <View style={styles.paymentContent}>
                <View style={styles.paymentHeader}>
                  <View style={styles.radioButton}>
                    {paymentMethod === "payOnSite" && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.paymentTitle}>Pay on Site</Text>
                </View>
                <Text style={styles.paymentDescription}>
                  Pay cash when you arrive at the property
                </Text>
              </View>
            </TouchableOpacity>

            {/* Stripe Payment Option */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "stripe" && styles.paymentOptionSelected
              ]}
              onPress={() => setPaymentMethod("stripe")}
            >
              <View style={styles.paymentIconContainer}>
                <View style={[styles.paymentIcon, { backgroundColor: "#EDE9FE" }]}>
                  <Ionicons name="card-outline" size={24} color="#7C3AED" />
                </View>
              </View>
              <View style={styles.paymentContent}>
                <View style={styles.paymentHeader}>
                  <View style={styles.radioButton}>
                    {paymentMethod === "stripe" && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.paymentTitle}>Pay with Card</Text>
                </View>
                <Text style={styles.paymentDescription}>
                  Secure payment via Stripe
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Separator Line */}
        <View style={styles.separator} />

        {/* Price Summary */}
        <View style={styles.priceSummaryContainer}>
          <Text style={styles.priceSummaryTitle}>Price Summary</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Room rate:</Text>
            <Text style={styles.priceValue}>Rs {room.price}/night</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Number of nights:</Text>
            <Text style={styles.priceValue}>{calculateNights(checkInDate, checkOutDate)}</Text>
          </View>
          
          {numGuests > 1 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Additional guest fee:</Text>
              <Text style={styles.priceValue}>10% per extra guest</Text>
            </View>
          )}
          
          <View style={styles.separator} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>Rs {Math.round(totalPrice)}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                {paymentMethod === "stripe" ? "Processing..." : "Creating Booking..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {paymentMethod === "stripe" ? "Pay with Card" : "Confirm Booking"}
            </Text>
          )}
        </TouchableOpacity>
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
    color: "#4B5563",
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  imageCarousel: {
    marginBottom: 16,
  },
  roomImage: {
    height: 180,
    borderRadius: 8,
    marginRight: 8,
  },
  noImageView: {
    height: 180,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 8,
  },
  noImageText: {
    color: "#9CA3AF",
    marginTop: 8,
  },
  roomInfoContainer: {
    marginBottom: 16,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  roomLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  roomDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  roomDetailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  roomDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    textTransform: "capitalize",
  },
  descriptionContainer: {
    marginTop: 12,
  },
  descriptionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  amenitiesContainer: {
    marginTop: 12,
  },
  amenitiesLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 6,
    textTransform: "capitalize",
  },
  formSection: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  // Payment Method Styles
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  paymentOptionSelected: {
    borderColor: "#3B82F6",
    backgroundColor: "#EBF8FF",
  },
  paymentIconContainer: {
    marginRight: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentContent: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  paymentDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 24,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  priceSummaryContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  priceSummaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
    color: "#4B5563",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  submitButton: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});

export default AccommodationBooking;