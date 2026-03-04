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

const windowWidth = Dimensions.get('window').width;

const MyRoomListings = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('userId');
      if (!email) {
        Alert.alert('Error', 'You must be logged in to view your listings');
        navigation.navigate('Profile');
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/api/v1/roomListing/getRoomByUser/${userId}`
      );
      
      if (response.data.success) {
        setRooms(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to load your room listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleDeleteRoom = (roomId, roomTitle) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${roomTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(
                `http://localhost:8000/api/v1/roomListing/deleteRoomListing/${roomId}`
              );
              
              if (response.data.success) {
                // Update the list by removing the deleted room
                setRooms(rooms.filter(room => room._id !== roomId));
                Alert.alert('Success', 'Room listing deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete room');
            }
          }
        }
      ]
    );
  };

  const renderRoomCard = ({ item }) => {
    const imageUrl = item.images && item.images.length > 0 
      ? item.images[0]
      : null;
      
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AccommodationDetails', { id: item._id })}
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
              <Ionicons name="home-outline" size={40} color="#CBD5E1" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          
          {/* Price badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>Rs {item.price}</Text>
          </View>
          
          {/* Room title overlay */}
          <View style={styles.titleOverlay}>
            <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons 
                name={item.furnished === 'furnished' ? "checkmark-circle-outline" : "close-circle-outline"} 
                size={16} 
                color={item.furnished === 'furnished' ? "#3B82F6" : "#9CA3AF"} 
              />
              <Text style={styles.infoText}>{item.furnished}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="bed-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>{item.roomType}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>Available Now</Text>
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => navigation.navigate('AccommodationDetails', { id: item._id })}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
              <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteRoom(item._id, item.title)}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="home-outline" size={50} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No Rooms Listed Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start listing rooms to attract guests.
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('RoomListing')}
      >
        <Ionicons name="add-circle-outline" size={18} color="#fff" />
        <Text style={styles.addButtonText}>Add New Room</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Room Listings</Text>
        <TouchableOpacity 
          style={styles.addRoomButton}
          onPress={() => navigation.navigate('RoomListingForm')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View> */}

      {/* Room Listings */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoomCard}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addRoomButton: {
    padding: 8,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default MyRoomListings;