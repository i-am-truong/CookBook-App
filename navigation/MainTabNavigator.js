import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import ExplorePage from "../pages/ExplorePage";
import CookbookPage from "../pages/CookbookPage";
import ShoppingList from "../pages/ShoppingList";
import MealPlannerPage from "../pages/MealPlannerPage";
import AIRecipeGenerator from "../pages/AIRecipeGenerator";

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfilePage} />
      <ProfileStack.Screen name="ShoppingList" component={ShoppingList} />
    </ProfileStack.Navigator>
  );
}

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
          if (route.name === "Planner")
            iconName = focused ? "calendar" : "calendar-outline";
          if (route.name === "Explore")
            iconName = focused ? "compass" : "compass-outline";
          if (route.name === "AI Chef")
            iconName = focused ? "sparkles" : "sparkles-outline";
          if (route.name === "Cookbook")
            iconName = focused ? "book" : "book-outline";
          if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Explore" component={ExplorePage} />
      <Tab.Screen name="Planner" component={MealPlannerPage} />
      <Tab.Screen name="AI Chef" component={AIRecipeGenerator} />
      <Tab.Screen name="Cookbook" component={CookbookPage} />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate("Profile", { screen: "ProfileMain" });
          },
        })}
      />
    </Tab.Navigator>
  );
}
