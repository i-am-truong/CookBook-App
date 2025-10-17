import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import MainTabNavigator from "./navigation/MainTabNavigator"; // Import đúng
import CreateRecipeScreen from "./pages/CreateRecipe";
import Login from "./pages/Login";
import RecipeByCategory from "./pages/RecipeByCategory";
import RecipeDetail from "./pages/RecipeDetail";
import Signup from "./pages/Signup";
import Start from "./pages/Start";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="RecipeByCategory" component={RecipeByCategory} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
