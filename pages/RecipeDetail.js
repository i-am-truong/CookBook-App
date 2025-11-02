import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useShoppingList } from "../context/ShoppingListContext";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../services/api";

const RecipeDetail = ({ route, navigation }) => {
  const { recipe: initialRecipe, source } = route.params; // Get the recipe data and source from route params
  const [recipe, setRecipe] = useState(initialRecipe); // Store recipe in state for reloading
  const [isSaved, setIsSaved] = useState(false);
  const { addItem } = useShoppingList();
  const [isMyRecipe, setIsMyRecipe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Prevent spam clicks

  const infoData = [
    { label: "Calories", value: `${recipe.calories} Cal`, icon: "flame" },
    { label: "Time", value: recipe.cookingTime, icon: "time" },
    { label: "Servings", value: `${recipe.servings} People`, icon: "people" },
  ];

  // Reload recipe data from API
  const loadRecipeData = useCallback(async () => {
    try {
      setLoading(true);
      // Try to fetch from myRecipes first
      const myRecipesResponse = await fetch(`${API_URL}/myRecipes`);
      if (myRecipesResponse.ok) {
        const myRecipes = await myRecipesResponse.json();
        const myRecipe = myRecipes.find((item) => item.id === recipe.id);
        if (myRecipe) {
          setRecipe(myRecipe);
          setLoading(false);
          return;
        }
      }

      // If not found in myRecipes, try recipes
      const recipesResponse = await fetch(`${API_URL}/recipes`);
      if (recipesResponse.ok) {
        const recipes = await recipesResponse.json();
        const foundRecipe = recipes.find((item) => item.id === recipe.id);
        if (foundRecipe) {
          setRecipe(foundRecipe);
          setLoading(false);
          return;
        }
      }

      // If not found in recipes, try savedRecipes
      const savedRecipesResponse = await fetch(`${API_URL}/savedRecipes`);
      if (savedRecipesResponse.ok) {
        const savedRecipes = await savedRecipesResponse.json();
        const savedRecipe = savedRecipes.find((item) => item.id === recipe.id);
        if (savedRecipe) {
          setRecipe(savedRecipe);
        }
      }
    } catch (error) {
      console.error("Error loading recipe data:", error);
    } finally {
      setLoading(false);
    }
  }, [recipe.id]);

  // Use useFocusEffect to reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadRecipeData();
      checkIfSaved();
      checkIfMyRecipe();
    }, [loadRecipeData])
  );

  const checkIfMyRecipe = async () => {
    try {
      const response = await fetch(`${API_URL}/myRecipes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const myRecipes = await response.json();
      const exists = myRecipes.some((item) => item.id === recipe.id);
      setIsMyRecipe(exists);
    } catch (error) {
      console.error("Error checking my recipe status:", error);
      setIsMyRecipe(false);
    }
  };

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
    // Prevent spam clicks
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

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
    } finally {
      // Add a small delay before allowing another click
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const handleEdit = () => {
    navigation.navigate("EditRecipe", { recipe });
  };

  const handlePublish = () => {
    Alert.alert(
      "Xuất bản công thức? 🌟",
      "Công thức sẽ được public và mọi người đều có thể xem. Bạn vẫn có thể chỉnh sửa sau này.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xuất bản",
          style: "default",
          onPress: async () => {
            try {
              // Get current user info
              const userId = await AsyncStorage.getItem("userId");
              const userEmail = await AsyncStorage.getItem("emailUser");

              // Update recipe to public in myRecipes
              const updatedRecipe = {
                ...recipe,
                isPublic: true,
                status: "public",
                publishedAt: new Date().toISOString(),
                publishedBy: userId || userEmail || "unknown",
              };

              // Update in myRecipes
              const updateMyRecipes = await fetch(
                `${API_URL}/myRecipes/${recipe.id}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updatedRecipe),
                }
              );

              if (!updateMyRecipes.ok) {
                throw new Error("Failed to update myRecipes");
              }

              // Add to recipes collection (public)
              const addToRecipes = await fetch(`${API_URL}/recipes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedRecipe),
              });

              if (!addToRecipes.ok) {
                throw new Error("Failed to add to recipes");
              }

              // Update local state
              setRecipe(updatedRecipe);

              Alert.alert(
                "Đã xuất bản! 🎉",
                "Công thức của bạn giờ đã public và mọi người đều có thể xem!",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Error publishing recipe:", error);
              Alert.alert(
                "Lỗi",
                "Không thể xuất bản công thức. Vui lòng thử lại."
              );
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Xóa công thức",
      "Bạn có chắc muốn xóa công thức này? Hành động này không thể hoàn tác.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from myRecipes
              const response = await fetch(
                `${API_URL}/myRecipes/${recipe.id}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              console.log("Recipe deleted from myRecipes");

              // Also delete from recipes collection if it exists there (for AI-generated recipes)
              try {
                const recipesResponse = await fetch(`${API_URL}/recipes`);
                if (recipesResponse.ok) {
                  const recipesData = await recipesResponse.json();
                  const existsInRecipes = recipesData.some(
                    (r) => r.id === recipe.id
                  );

                  if (existsInRecipes) {
                    await fetch(`${API_URL}/recipes/${recipe.id}`, {
                      method: "DELETE",
                    });
                    console.log("Recipe also deleted from recipes collection");
                  }
                }
              } catch (error) {
                console.error("Error deleting from recipes collection:", error);
                // Continue even if this fails
              }

              // Also delete from savedRecipes collection if it exists there
              try {
                const savedResponse = await fetch(`${API_URL}/savedRecipes`);
                if (savedResponse.ok) {
                  const savedData = await savedResponse.json();
                  const existsInSaved = savedData.some(
                    (r) => r.id === recipe.id
                  );

                  if (existsInSaved) {
                    await fetch(`${API_URL}/savedRecipes/${recipe.id}`, {
                      method: "DELETE",
                    });
                    console.log(
                      "Recipe also deleted from savedRecipes collection"
                    );
                  }
                }
              } catch (error) {
                console.error(
                  "Error deleting from savedRecipes collection:",
                  error
                );
                // Continue even if this fails
              }

              Alert.alert("Thành công", "Công thức đã được xóa!", [
                {
                  text: "OK",
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error("Error deleting recipe:", error);
              Alert.alert("Lỗi", "Không thể xóa công thức. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải công thức...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                  <View style={styles.headerActions}>
                    {isMyRecipe && (
                      <>
                        <TouchableOpacity
                          onPress={handleEdit}
                          style={styles.actionButton}
                        >
                          <Ionicons
                            name="create-outline"
                            size={24}
                            color="#2196F3"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleDelete}
                          style={styles.actionButton}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color="#FF5252"
                          />
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      onPress={handleToggleSave}
                      style={[
                        styles.actionButton,
                        isSaving && styles.actionButtonDisabled,
                      ]}
                      disabled={isSaving}
                    >
                      <Ionicons
                        name={isSaved ? "heart" : "heart-outline"}
                        size={24}
                        color={isSaved ? "#FF6B6B" : "#4CAF50"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.category}>{recipe.category}</Text>
                <Text style={styles.description}>{recipe.description}</Text>

                {/* Publish Button - Only show for private recipes owned by user */}
                {isMyRecipe && recipe.isPublic === false && (
                  <TouchableOpacity
                    style={styles.publishButton}
                    onPress={handlePublish}
                  >
                    <LinearGradient
                      colors={["#FF6B6B", "#FF8E53"]}
                      style={styles.publishGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="planet-outline" size={20} color="#FFF" />
                      <Text style={styles.publishButtonText}>
                        🌟 Xuất bản công thức
                      </Text>
                      <View style={styles.privateBadge}>
                        <Text style={styles.privateBadgeText}>PRIVATE</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
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
                  <View key={index} style={styles.ingredientCard}>
                    <View style={styles.ingredientHeader}>
                      <Ionicons
                        name="nutrition"
                        size={20}
                        color="#4CAF50"
                        style={styles.ingredientIcon}
                      />
                      <Text style={styles.ingredientName}>
                        {ingredient.name}
                      </Text>
                    </View>
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

                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#4CAF50",
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                    onPress={() => {
                      recipe.ingredients.forEach((ingredient) => {
                        addItem({
                          name: `${ingredient.name}: ${ingredient.amount}`,
                          recipeTitle: recipe.name,
                        });
                      });
                      Alert.alert(
                        "✅ Đã thêm",
                        "Nguyên liệu đã được thêm vào Shopping List!"
                      );
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      + Add to Shopping List
                    </Text>
                  </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  recipeName: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
    marginRight: 10,
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
  publishButton: {
    marginTop: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  publishGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  publishButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  privateBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  privateBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
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
  ingredientCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  ingredientHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  ingredientIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  ingredientAmount: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginLeft: 28, // Align with text (icon + margin)
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
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
