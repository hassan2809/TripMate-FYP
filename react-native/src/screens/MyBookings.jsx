import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

const windowWidth = Dimensions.get('window').width;

const MyBookings = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'You must be logged in to view your bookings');
        navigation.navigate('Profile');
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/v1/auth/userBookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load your bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = (bookingId, roomTitle) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for "${roomTitle}"?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await axios.delete(
                `http://localhost:8000/api/v1/auth/cancelBooking/${bookingId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              if (response.data.success) {
                // Update the list by removing the cancelled booking
                setBookings(bookings.filter(booking => booking._id !== bookingId));
                Alert.alert('Success', 'Booking cancelled successfully');
              }
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking');
            }
          }
        }
      ]
    );
  };

  const renderBookingCard = ({ item }) => {
    const imageUrl = item.roomId?.images && item.roomId.images.length > 0 
      ? item.roomId.images[0]
      : null;
    
    const checkInDate = new Date(item.checkInDate);
    const checkOutDate = new Date(item.checkOutDate);
    
    // Calculate the number of nights
    const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Format dates
    const formattedCheckIn = format(checkInDate, 'MMM dd, yyyy');
    const formattedCheckOut = format(checkOutDate, 'MMM dd, yyyy');
    
    // Check if the booking is upcoming (check-in date is in the future)
    const isUpcoming = checkInDate > new Date();
    
    // Check if booking is active (between check-in and check-out date)
    const isActive = checkInDate <= new Date() && checkOutDate >= new Date();
      
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AccommodationDetails', { id: item.roomId._id })}
        activeOpacity={0.95}
      >
        <View style={styles.cardImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="bed-outline" size={40} color="#CBD5E1" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          
          {/* Price badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>Rs {item.totalPrice}</Text>
          </View>
          
          {/* Status badge */}
          {(isUpcoming || isActive) && (
            <View style={[
              styles.statusBadge,
              isActive ? styles.activeBadge : styles.upcomingBadge
            ]}>
              <Text style={styles.statusText}>
                {isActive ? 'Active Stay' : 'Upcoming'}
              </Text>
            </View>
          )}
          
          {/* Room title overlay */}
          <View style={styles.titleOverlay}>
            <Text style={styles.roomTitle} numberOfLines={1}>{item.roomId?.title || "Room Booking"}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText} numberOfLines={1}>{item.roomId?.location || "Location not available"}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>{item.numGuests} {item.numGuests === 1 ? 'guest' : 'guests'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>{formattedCheckIn}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>{formattedCheckOut}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>{nights} {nights === 1 ? 'night' : 'nights'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>{item.name}</Text>
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => navigation.navigate('AccommodationDetails', { id: item.roomId._id })}
            >
              <Text style={styles.viewButtonText}>View Room</Text>
              <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
            </TouchableOpacity>
            
            {isUpcoming && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(item._id, item.roomId?.title || "Room")}
              >
                <Ionicons name="close-outline" size={16} color="#FFFFFF" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calendar-outline" size={50} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No Bookings Found</Text>
      <Text style={styles.emptySubtitle}>
        You haven't made any bookings yet. Start exploring rooms to book your stay.
      </Text>
      <TouchableOpacity
        style={styles.findRoomsButton}
        onPress={() => navigation.navigate('Accommodation')}
      >
        <Ionicons name="search-outline" size={18} color="#fff" />
        <Text style={styles.findRoomsButtonText}>Find Rooms</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Bookings List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardImageContainer: {
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#94A3B8',
    marginTop: 8,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#059669',
  },
  upcomingBadge: {
    backgroundColor: '#2563EB',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  roomTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginRight: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  findRoomsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  findRoomsButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default MyBookings;