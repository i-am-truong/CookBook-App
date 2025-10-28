import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { API_URL } from "../services/api";

const RecipeDetail = ({ route, navigation }) => {
  const { recipe } = route.params; // Get the recipe data from route params
  const [isSaved, setIsSaved] = useState(false);

  const infoData = [
    { label: "Calories", value: `${recipe.calories} Cal`, icon: "flame" },
    { label: "Time", value: recipe.cookingTime, icon: "time" },
    { label: "Servings", value: `${recipe.servings} People`, icon: "people" },
  ];

  useEffect(() => {
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    try {
      const response = await fetch(`${API_URL}/savedRecipes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const savedRecipes = await response.json();
      const exists = savedRecipes.some((item) => item.id === recipe.id);
      setIsSaved(exists);
    } catch (error) {
      console.error("Error checking saved status:", error);
      setIsSaved(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        // Unsave: Xóa recipe khỏi savedRecipes
        // Tìm recipe trong savedRecipes để lấy database ID (có thể khác với recipe.id)
        const response = await fetch(`${API_URL}/savedRecipes`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const savedRecipes = await response.json();
        const savedRecipe = savedRecipes.find((item) => item.id === recipe.id);

        if (savedRecipe) {
          // Xóa recipe bằng database ID của nó
          const deleteResponse = await fetch(
            `${API_URL}/savedRecipes/${savedRecipe.id}`,
            {
              method: "DELETE",
            }
          );

          if (!deleteResponse.ok) {
            throw new Error(`HTTP error! status: ${deleteResponse.status}`);
          }

          console.log("Recipe removed from saved!");
          setIsSaved(false);
          Alert.alert("Removed", "Recipe has been removed from saved recipes!");
        }
      } else {
        // Save: Thêm recipe vào savedRecipes
        const response = await fetch(`${API_URL}/savedRecipes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recipe),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Recipe saved!", data);
        setIsSaved(true);
        Alert.alert("Success", "Recipe has been saved to your saved recipes!");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      Alert.alert(
        "Error",
        "Failed to save/unsave recipe. Please make sure JSON server is running on port 5001.\n\n" +
          "Run: npm run server"
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={[
          { type: "header" },
          { type: "info" },
          { type: "ingredients" },
          { type: "steps" },
          { type: "tips" },
          { type: "nutrition" },
          { type: "cta" },
        ]}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View style={styles.headerContainer}>
                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="black" />
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                {/* Recipe Image */}
                <Image
                  source={{ uri: recipe.image }}
                  style={styles.recipeImage}
                />

                {/* Recipe Title and Save Icon */}
                <View style={styles.recipeHeader}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <TouchableOpacity onPress={handleToggleSave}>
                    <Ionicons
                      name={isSaved ? "heart" : "heart-outline"} // Nếu đã lưu thì dùng icon đầy, chưa thì outline
                      size={24}
                      color={isSaved ? "#FF6B6B" : "#4CAF50"} // Màu đỏ nếu đã lưu, màu xanh nếu chưa
                      style={{
                        borderWidth: isSaved ? 0 : 1, // Nếu đã lưu thì bỏ viền, chưa thì thêm viền
                        borderColor: "#4CAF50",
                        borderRadius: 12,
                        padding: 4,
                      }}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.category}>{recipe.category}</Text>
                <Text style={styles.description}>{recipe.description}</Text>
              </View>
            );
          }

          if (item.type === "info") {
            return (
              <View style={styles.infoContainer}>
                {infoData.map((info, index) => (
                  <View key={index} style={styles.infoCard}>
                    <Ionicons name={info.icon} size={24} color="white" />
                    <Text style={styles.infoText}>{info.label}</Text>
                    <Text style={styles.infoValue}>{info.value}</Text>
                  </View>
                ))}
              </View>
            );
          }

          if (item.type === "ingredients") {
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ingredients:</Text>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientContainer}>
                    <Ionicons
                      name="nutrition"
                      size={24}
                      color="#4CAF50"
                      style={styles.ingredientIcon}
                    />
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.ingredientAmount}>
                      {ingredient.amount}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }

          if (item.type === "steps") {
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions:</Text>
                {recipe.instructions.map((step, index) => (
                  <View key={index} style={styles.stepContainer}>
                    <Text style={styles.stepText}>
                      {index + 1}. {step}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }

          // Tips section
          if (item.type === "tips" && recipe.tips) {
            return (
              <View style={styles.section}>
                <View style={styles.tipsContainer}>
                  <Ionicons name="bulb" size={24} color="#F39C12" />
                  <View style={styles.tipsContent}>
                    <Text style={styles.tipTitle}>💡 Mẹo hay:</Text>
                    <Text style={styles.tipText}>{recipe.tips}</Text>
                  </View>
                </View>
              </View>
            );
          }

          // Nutrition Info section
          if (item.type === "nutrition" && recipe.nutritionInfo) {
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin dinh dưỡng:</Text>
                <View style={styles.nutritionContainer}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein:</Text>
                    <Text style={styles.nutritionValue}>
                      {recipe.nutritionInfo.protein}
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbs:</Text>
                    <Text style={styles.nutritionValue}>
                      {recipe.nutritionInfo.carbs}
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fat:</Text>
                    <Text style={styles.nutritionValue}>
                      {recipe.nutritionInfo.fat}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }

          // Call to Action section at the bottom
          if (item.type === "cta") {
            return (
              <View style={styles.ctaContainer}>
                <Ionicons name="fast-food" size={30} color="white" />
                <Text style={styles.ctaText}>
                  Warm up your stove, and let's get cooking!
                </Text>
                <Text style={styles.ctaSubText}>
                  Make something for your LOVE
                </Text>
              </View>
            );
          }
        }}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={() => null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerContainer: {
    padding: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  backText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  recipeImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between", // Align name to the left and save icon to the right
    alignItems: "center",
    marginBottom: 10,
  },
  recipeName: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    marginRight: 10, // Add spacing between name and heart icon
  },
  category: {
    fontSize: 16,
    color: "#888",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    width: "30%",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "white",
  },
  infoValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  ingredientContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Align name and amount to both ends
    alignItems: "center",
    marginBottom: 10,
  },
  ingredientIcon: {
    marginRight: 10,
  },
  ingredientName: {
    fontSize: 16,
    flex: 1, // Ensures the name stays on the left
    textAlign: "left",
  },
  ingredientAmount: {
    fontSize: 16,
    textAlign: "right", // Align the amount to the right
  },
  stepContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Tips section styles
  tipsContainer: {
    backgroundColor: "#FFF9E6",
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7D6608",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    color: "#7D6608",
    lineHeight: 22,
    fontStyle: "italic",
  },
  // Nutrition Info styles
  nutritionContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  // CTA section styles
  ctaContainer: {
    backgroundColor: "#D8E8E5",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 10,
    marginHorizontal: 16,
  },
  ctaText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginVertical: 5,
  },
  ctaSubText: {
    fontSize: 16,
    color: "black",
  },
});

export default RecipeDetail;
