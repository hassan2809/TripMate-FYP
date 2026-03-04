import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeroImage from "../../assets/images/accommodation.jpg";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const navigation = useNavigation();

  const navigateToPackages = () => {
    navigation.navigate("Packages");
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={HeroImage}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>
                Plan. Share. Explore Together
              </Text>
              <Text style={styles.heroSubtitle}>
                Your companion for group travel adventures
              </Text>
              {/* <TouchableOpacity style={styles.heroButton} onPress={navigateToPackages}>
                <Text style={styles.heroButtonText}>Find Tour Packages</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
              </TouchableOpacity> */}
            </View>
          </ImageBackground>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="map-outline" size={24} color="#43A047" />
            </View>
            <Text style={styles.actionText}>Tour Packages</Text>
          </View>

          <View style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
              <MaterialIcons name="tour" size={24} color="#F57C00" />
            </View>
            <Text style={styles.actionText}>Tour Planning</Text>
          </View>

          <View style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="bed-outline" size={24} color="#1976D2" />
            </View>
            <Text style={styles.actionText}>Accommdation</Text>
          </View>
        </View>

        {/* Popular Destinations Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <TouchableOpacity>
              {/* <Text style={styles.seeAllText}>See all</Text> */}
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScrollView}
          >
            {["Lahore", "Islamabad", "Murree", "Swat"].map((city, index) => (
              <TouchableOpacity key={index} style={styles.destinationCard}>
                <ImageBackground
                  source={HeroImage}
                  style={styles.destinationImage}
                  imageStyle={styles.destinationImageStyle}
                >
                  <View style={styles.destinationOverlay}>
                    <Text style={styles.destinationName}>{city}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Listings Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity>
              {/* <Text style={styles.seeAllText}>See all</Text> */}
            </TouchableOpacity>
          </View>

          {[1, 2].map((item) => (
            <TouchableOpacity key={item} style={styles.listingCard}>
              <Image source={HeroImage} style={styles.listingImage} />
              <View style={styles.listingContent}>
                <Text style={styles.listingTitle}>
                  Cozy Studio in City Center
                </Text>
                <Text style={styles.listingLocation}>
                  <Ionicons name="location-outline" size={14} color="#757575" />{" "}
                  Johar Town, Lahore
                </Text>
                <View style={styles.listingDetails}>
                  <Text style={styles.listingPrice}>Rs 1,500 / night</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFC107" />
                    <Text style={styles.ratingText}>4.8</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroContainer: {
    height: 240,
    width: "100%",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImageStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.9,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C4DFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 6,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginTop: -20,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  actionCard: {
    alignItems: "center",
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#424242",
  },
  sectionContainer: {
    padding: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  seeAllText: {
    fontSize: 14,
    color: "#7C4DFF",
    fontWeight: "500",
  },
  horizontalScrollView: {
    marginLeft: -8,
  },
  destinationCard: {
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 8,
    marginRight: 4,
  },
  destinationImage: {
    width: "100%",
    height: "100%",
  },
  destinationImageStyle: {
    borderRadius: 12,
  },
  destinationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listingImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  listingContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  listingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C4DFF",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#424242",
    marginLeft: 4,
  },
});

export default Home;
