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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultTourImage from '../../assets/images/accommodation.jpg';

const MyTours = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('created');
  const [createdTours, setCreatedTours] = useState([]);
  const [joinedTours, setJoinedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem('email');
      if (!email) {
        Alert.alert('Error', 'You must be logged in to view your tours');
        navigation.navigate('Profile');
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/v1/tour/myTours/?email=${email}`);
      setCreatedTours(response.data.createdTours || []);
      setJoinedTours(response.data.joinedTours || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      Alert.alert('Error', 'Failed to load tour data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTours();
  };

  const handleRemoveTour = (tourId) => {
    Alert.alert(
      'Leave Tour',
      'Are you sure you want to leave this tour?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const email = await AsyncStorage.getItem('email');
              const response = await axios.put(
                'http://localhost:8000/api/v1/tour/removeJoinedTours',
                { tourId, email }
              );

              if (response.data.success) {
                // Update the joined tours list by removing the tour
                setJoinedTours(joinedTours.filter(tour => tour._id !== tourId));
                Alert.alert('Success', 'You have left the tour');
              }
            } catch (error) {
              console.error('Error leaving tour:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to leave tour');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTransportIcon = (transportMode) => {
    switch (transportMode?.toLowerCase()) {
      case 'flight':
        return 'airplane-outline';
      case 'train':
        return 'train-outline';
      case 'car':
        return 'car-outline';
      case 'bus':
        return 'bus-outline';
      default:
        return 'compass-outline';
    }
  };

  const renderTourCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PackageDetails', { id: item._id })}
      activeOpacity={0.9}
    >
      <View style={styles.cardImageContainer}>
        <Image 
          source={DefaultTourImage} 
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={12} color="#fff" />
          <Text style={styles.durationText}>{item.numberOfDays} Days</Text>
        </View>
        
        {/* Destination overlay */}
        <View style={styles.destinationOverlay}>
          <Text style={styles.destinationText}>{item.destination}</Text>
        </View>
        
        {/* Remove button (only for joined tours) */}
        {activeTab === 'joined' && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveTour(item._id)}
          >
            <Ionicons name="close-circle" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardInfoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
            <Text style={styles.infoText}>{formatDate(item.startDate)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name={getTransportIcon(item.transportMode)} size={16} color="#3B82F6" />
            <Text style={styles.infoText}>{item.transportMode}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#3B82F6" />
            <Text style={styles.infoText}>{item.companions?.length || 0} companions</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="wallet-outline" size={16} color="#3B82F6" />
            <Text style={styles.infoText}>Rs {item.totalBudget}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('PackageDetails', { id: item._id })}
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = (type) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="map-outline" size={50} color="#CBD5E1" />
      </View>
      <Text style={styles.emptyTitle}>No {type} Tours Yet</Text>
      <Text style={styles.emptySubtitle}>
        {type === 'Created' 
          ? 'Start planning your next adventure!' 
          : 'Join some exciting tours to get started!'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate(type === 'Created' ? 'TourPlanning' : 'Packages')}
      >
        <Ionicons name="add-circle-outline" size={18} color="#fff" />
        <Text style={styles.emptyButtonText}>
          {type === 'Created' ? 'Create a Tour' : 'Explore Tours'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const tours = activeTab === 'created' ? createdTours : joinedTours;

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
        <Text style={styles.headerTitle}>My Tours</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('TourPlanning')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View> */}

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'created' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('created')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'created' && styles.activeTabText
          ]}>Created Tours</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'joined' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'joined' && styles.activeTabText
          ]}>Joined Tours</Text>
        </TouchableOpacity>
      </View>

      {/* Tour List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Loading your tours...</Text>
        </View>
      ) : (
        <FlatList
          data={tours}
          renderItem={renderTourCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList(activeTab === 'created' ? 'Created' : 'Joined')}
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
  createButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 2,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#EBF2FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#1E3A8A',
    fontWeight: '600',
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
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
  },
  destinationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginRight: 4,
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
    paddingVertical: 40,
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default MyTours;