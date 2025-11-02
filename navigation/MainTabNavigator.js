import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Pressable, StyleSheet } from "react-native"; // Thêm View, Pressable, StyleSheet cho tùy chỉnh Home

import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import ExplorePage from "../pages/ExplorePage";
import CookbookPage from "../pages/CookbookPage";
import ShoppingList from "../pages/ShoppingList";
import MealPlannerPage from "../pages/MealPlannerPage";
import AIRecipeGenerator from "../pages/AIRecipeGenerator";
import CommunityPage from "../pages/CommunityPage";

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

// Hàm component tùy chỉnh cho nút Home
const HomeTabBarButton = (props) => {
  const { children, onPress, accessibilityState } = props;
  
  // FIX: Kiểm tra an toàn trước khi truy cập 'selected'
  const focused = accessibilityState?.selected; 

  return (
    <Pressable
      onPress={onPress}
      // Dùng style cố định để đảm bảo nút luôn ở vị trí này
      style={{ top: -15, justifyContent: 'center', alignItems: 'center' }} 
    >
      <View style={styles.homeButtonContainer}>
        <Ionicons 
          name={focused ? "home" : "home-outline"} 
          size={30} 
          color="white"
        />
      </View>
    </Pressable>
  );
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let newColor = focused ? "#FF6B6B" : "gray";

          // Sửa icon cho Community
          if (route.name === "Community")
            iconName = focused ? "people" : "people-outline"; 
          else if (route.name === "Explore")
            iconName = focused ? "compass" : "compass-outline";
          else if (route.name === "Planner")
            iconName = focused ? "calendar" : "calendar-outline";
          else if (route.name === "AI Chef")
            iconName = focused ? "sparkles" : "sparkles-outline";
          else if (route.name === "Cookbook")
            iconName = focused ? "book" : "book-outline";
          else if (route.name === "Profile")
            iconName = focused ? "person" : "person-outline";

          if (iconName) {
            return <Ionicons name={iconName} size={size} color={newColor} />;
          }
          return null; // Không trả về icon cho Home vì đã tùy chỉnh
        },
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60, // Chiều cao phù hợp
        },
        tabBarLabelStyle: {
            fontSize: 10,
        }
      })}
    >
      {/* 1. Community */}
      <Tab.Screen name="Community" component={CommunityPage} />

      {/* 2. Explore */}
      <Tab.Screen name="Explore" component={ExplorePage} />

      {/* 3. Planner */}
      <Tab.Screen name="Planner" component={MealPlannerPage} />

      {/* 4. HOME - Được đặt ở giữa và tùy chỉnh hình tròn */}
      <Tab.Screen 
        name="Home" 
        component={HomePage} 
        options={{
            tabBarButton: (props) => <HomeTabBarButton {...props} />,
            tabBarLabel: 'Home', // Giữ lại nhãn
        }}
      />
      
      {/* 5. AI Chef */}
      <Tab.Screen name="AI Chef" component={AIRecipeGenerator} />
      
      {/* 6. Cookbook */}
      <Tab.Screen name="Cookbook" component={CookbookPage} />

      {/* 7. Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Đảm bảo ProfileStack về màn hình chính
            e.preventDefault(); 
            navigation.navigate("Profile", { screen: "ProfileMain" });
          },
        })}
      />
    </Tab.Navigator>
  );
}

// StyleSheet cho nút Home nổi bật
const styles = StyleSheet.create({
  homeButtonContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, // Tạo hình tròn
    backgroundColor: '#FF6B6B', // Màu nền nổi bật (giống màu active)
    justifyContent: 'center',
    alignItems: 'center',
    // Tạo bóng nhẹ (tùy chọn)
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 4, // Viền nhẹ
    borderColor: 'white', // Viền màu trắng
  },
});