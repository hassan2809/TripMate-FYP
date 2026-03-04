import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import Accommodation from "./Accommodation";
import Packages from "./Packages";
import Profile from "./Profile";
import Home from "./Home";
import Chat from "./Chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

const MainApp = () => {
  const insets = useSafeAreaInsets();
  const [userToken, setUserToken] = useState("");

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const token = (await AsyncStorage.getItem("token")) || "";
        setUserToken(token || "");
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };
    getUserInfo();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person";
          } else if (route.name === "Accommodation") {
            iconName = focused ? "hotel" : "hotel";
          } else if (route.name === "Packages") {
            iconName = focused ? "tour" : "tour";
          } else if (route.name === "Chat") {
            iconName = "chat";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1E3A8A",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Accommodation" component={Accommodation} />
      <Tab.Screen name="Packages" component={Packages} />
      {userToken ? <Tab.Screen name="Chat" component={Chat} /> : null}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default MainApp;
