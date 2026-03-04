import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedName = await AsyncStorage.getItem("name");
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setIsLoggedIn(true);
          if (storedEmail) setEmail(storedEmail);
          if (storedName) setName(storedName);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching user data from AsyncStorage", error);
      }
    };

    fetchUserData();
  }, []);

  // Updated menu items to match the UserMenu component
  const menuItems = [
    {
      icon: "tour",
      title: "My Tours",
      subtitle: "View and manage your tours",
      onPress: () => navigation.navigate("MyTours"),
    },
    {
      icon: "home",
      title: "My Room Listings",
      subtitle: "Manage your properties",
      onPress: () => navigation.navigate("MyRoomListings"),
    },
    {
      icon: "edit",
      title: "Edit Profile",
      subtitle: "Update your information",
      onPress: () => navigation.navigate("EditProfile"),
    },
    {
      icon: "hotel",
      title: "My Bookings",
      subtitle: "View and manage your room reservations",
      onPress: () => navigation.navigate("MyBookings"),
    },
  ];

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await Promise.all([
              AsyncStorage.removeItem("token"),
              AsyncStorage.removeItem("email"),
              AsyncStorage.removeItem("name"),
              AsyncStorage.removeItem("role"),
              AsyncStorage.removeItem("userId"),
            ]);

            // console.log("logout")
            setIsLoggedIn(false);
            setName("");
            setEmail("");

            navigation.reset({
              index: 0,
              routes: [{ name: "MainApp" }],
            });
          } catch (error) {
            console.error("Error during logout:", error);
            // Alert the user about the error
            Alert.alert(
              "Logout Error",
              "There was a problem logging out. Please try again."
            );
          }
        },
      },
    ]);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleSignup = () => {
    navigation.navigate("Signup");
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginCard}>
          <Icon name="account-circle" size={80} color="#1E3A8A" />
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>Sign in to continue</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : "U"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Icon name="edit" size={20} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuIcon}>
              <Icon name={item.icon} size={24} color="#1E3A8A" />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>TripMate v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 40,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileInfo: {
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    textTransform: "capitalize",
    width: 235,
  },
  email: {
    fontSize: 14,
    color: "#757575",
    // marginTop: 2,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 20,
    marginTop: 10,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  },
  menuContainer: {
    backgroundColor: "white",
    marginTop: 10,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#757575",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  loginCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    margin: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 20,
  },
  subtitleText: {
    fontSize: 16,
    color: "#757575",
    marginTop: 8,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButton: {
    marginTop: 15,
    padding: 10,
  },
  signupButtonText: {
    color: "#1E3A8A",
    fontSize: 16,
  },
  versionInfo: {
    alignItems: "center",
    padding: 20,
  },
  versionText: {
    color: "#9E9E9E",
    fontSize: 12,
  },
});

export default Profile;
