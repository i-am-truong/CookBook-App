import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import ExplorePage from "../pages/ExplorePage";
import CookbookPage from "../pages/CookbookPage";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";
          if (route.name === "Explore")
            iconName = focused ? "compass" : "compass-outline";
          if (route.name === "Cookbook")
            iconName = focused ? "book" : "book-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#5550F2",
        tabBarInactiveTintColor: "gray",
        sceneStyle: { backgroundColor: "white", paddingTop: 50 },
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Explore" component={ExplorePage} />
      <Tab.Screen name="Cookbook" component={CookbookPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}
