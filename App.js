import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import MainTabNavigator from "./navigation/MainTabNavigator"; // Import đúng
import AIRecipeGenerator from "./pages/AIRecipeGenerator";
import CreateRecipeScreen from "./pages/CreateRecipe";
import EditRecipeScreen from "./pages/EditRecipe";
import Login from "./pages/Login";
import RecipeByCategory from "./pages/RecipeByCategory";
import RecipeDetail from "./pages/RecipeDetail";
import Signup from "./pages/Signup";
import Start from "./pages/Start";
import ForgotPassword from "./pages/ForgotPassword";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Start" component={Start} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="RecipeByCategory" component={RecipeByCategory} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
          <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
          <Stack.Screen name="EditRecipe" component={EditRecipeScreen} />
          <Stack.Screen
            name="AIRecipeGenerator"
            component={AIRecipeGenerator}
          />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
