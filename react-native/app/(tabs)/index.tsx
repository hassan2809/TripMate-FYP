import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import IntroScreen1 from "@/src/screens/IntroScreen1";
import IntroScreen2 from "@/src/screens/IntroScreen2";
import IntroScreen3 from "@/src/screens/IntroScreen3";
import MainApp from "@/src/screens/MainApp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "@/src/screens/Profile";
import Login from "@/src/screens/Login";
import Signup from "@/src/screens/Signup";
import RoomListing from "@/src/screens/RoomListing";
import AccomodationDetails from "@/src/screens/AccomodationDetails";
import PackageDetails from "@/src/screens/PackageDetails";
import MyTours from "@/src/screens/MyTours";
import Packages from "@/src/screens/Packages";
import MyRoomListings from "@/src/screens/MyRoomListings";
import EditProfile from "@/src/screens/EditProfile";
import TourPlanning from "@/src/screens/TourPlanning";
import AccommodationBooking from "@/src/screens/AccommodationBooking";
import Chat from "@/src/screens/Chat";
import MyBookings from "@/src/screens/MyBookings";
import Accommodation from "@/src/screens/Accommodation";

const Stack = createNativeStackNavigator();

function RootStack() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    const checkIfFirstLaunch = async () => {
      try {
        const firstLaunch = await AsyncStorage.getItem("alreadyLaunched");
        if (firstLaunch === null) {
          await AsyncStorage.setItem("alreadyLaunched", "true");
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.log("Error checking AsyncStorage:", error);
      }
    };

    checkIfFirstLaunch();
  }, []);

  // useEffect(() => {
  //   const removeAlreadyLaunched = async () => {
  //     try {
  //       const firstLaunch = await AsyncStorage.removeItem('alreadyLaunched');
  //     } catch (error) {
  //       console.log("Error checking AsyncStorage:", error);
  //     }
  //   };

  //   removeAlreadyLaunched();
  // }, []);

  return (
    <Stack.Navigator>
      {isFirstLaunch ? (
        <>
          <Stack.Screen name="IntroScreen1" component={IntroScreen1} />
          <Stack.Screen name="IntroScreen2" component={IntroScreen2} />
          <Stack.Screen name="IntroScreen3" component={IntroScreen3} />
          <Stack.Screen
            name="MainApp"
            component={MainApp}
            options={{
              headerShown: false, 
            }}
          />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="RoomListing" component={RoomListing} />
          <Stack.Screen
            name="AccommodationDetails"
            component={AccomodationDetails}
            options={{ title: "Room Details" }}
          />
          <Stack.Screen name="PackageDetails" component={PackageDetails} />
          <Stack.Screen name="MyTours" component={MyTours} />
          <Stack.Screen name="Packages" component={Packages} />
          <Stack.Screen name="MyRoomListings" component={MyRoomListings} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="TourPlanning" component={TourPlanning} />
          <Stack.Screen
            name="AccommodationBooking"
            component={AccommodationBooking}
            options={{ title: "Book Your Stay" }}
          />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="MyBookings" component={MyBookings} />
          <Stack.Screen name="Accommodation" component={Accommodation} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="MainApp"
            component={MainApp}
            options={{
              headerShown: false, 
            }}
          />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="RoomListing" component={RoomListing} />
          <Stack.Screen
            name="AccommodationDetails"
            component={AccomodationDetails}
            options={{ title: "Room Details" }}
          />
          <Stack.Screen name="PackageDetails" component={PackageDetails} />
          <Stack.Screen name="MyTours" component={MyTours} />
          <Stack.Screen name="Packages" component={Packages} />
          <Stack.Screen name="MyRoomListings" component={MyRoomListings} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="TourPlanning" component={TourPlanning} />
          <Stack.Screen
            name="AccommodationBooking"
            component={AccommodationBooking}
            options={{ title: "Book Your Stay" }}
          />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="MyBookings" component={MyBookings} />
          <Stack.Screen name="Accommodation" component={Accommodation} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return <RootStack />;
}
