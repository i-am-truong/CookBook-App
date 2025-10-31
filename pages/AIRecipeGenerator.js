import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GeminiService from "../services/geminiService";
import PexelsService from "../services/pexelsService";
import { API_URL } from "../services/api";

const AIRecipeGenerator = ({ navigation }) => {
  // AI Recipe Generator States
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Dinner");
  const [servings, setServings] = useState("4");
  const [cookingTime, setCookingTime] = useState("30");
  const [dietType, setDietType] = useState("Không");
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  // Categories matching the project
  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Appetizer",
    "Fastfood",
    "Dessert",
    "Healthy",
  ];

  // Diet Types - simple and relevant
  const dietTypes = ["Không", "Chay", "Low-carb", "Healthy", "Keto"];

  // Clean instruction text - remove ** markers, "Bước X:" patterns, and all parentheses
  const cleanInstructionText = (text) => {
    if (!text) return "";

    let cleaned = text.trim();

    // Step 1: Remove all ** markers (markdown bold formatting)
    cleaned = cleaned.replace(/\*\*/g, "");

    // Step 2: Remove "Bước X:" pattern at the beginning (case insensitive)
    // This handles various formats:
    // - "Bước 1:" → remove
    // - "Bước 1 :" → remove
    // - "Bước 1: Title" → remove "Bước 1: Title"
    // - "Bước 1: Title (5 phút)" → remove "Bước 1: Title (5 phút)"

    // First, try to match "Bước X: Title (time)" pattern
    // This regex matches: "Bước" + optional spaces + number + ":" + title text + optional "(time)"
    // Matches everything from "Bước X:" up to and including the time in parentheses
    cleaned = cleaned.replace(/^Bước\s*\d+\s*:\s*[^(]*(?:\([^)]+\))?\s*/i, "");

    // Fallback: if still starts with "Bước X:", remove just that part
    cleaned = cleaned.replace(/^Bước\s*\d+\s*:?\s*/i, "");

    // Step 3: Remove ALL parentheses and their content throughout the entire text
    // This removes patterns like: (5 phút), (nếu có), (Lưu ý: ...), etc.
    cleaned = cleaned.replace(/\([^)]*\)/g, "");

    // Step 4: Clean up multiple spaces that might be left after removing parentheses
    cleaned = cleaned.replace(/\s+/g, " ");

    // Step 5: Clean up any remaining leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
  };

  // Handle AI Recipe Generation
  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      Alert.alert("⚠️ Thiếu thông tin", "Vui lòng nhập nguyên liệu có sẵn!");
      return;
    }

    if (!servings || parseInt(servings) <= 0) {
      Alert.alert("⚠️ Thiếu thông tin", "Vui lòng nhập số người ăn!");
      return;
    }

    setLoading(true);
    setGeneratedRecipe(null);

    try {
      const userInput = {
        ingredients: ingredients
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        category,
        servings: parseInt(servings) || 4,
        cookingTime: cookingTime ? `${cookingTime} phút` : "30 phút",
        dietPreference: dietType !== "Không" ? dietType : "",
      };

      const result = await GeminiService.generateRecipe(userInput);

      if (result.success) {
        // Fetch real food image from Pexels
        let imageUrl = null;
        try {
          imageUrl = await PexelsService.searchByIngredients(
            userInput.ingredients
          );
        } catch (error) {
          console.log("Image fetch error:", error);
        }

        // Use fallback if Pexels fails
        if (!imageUrl) {
          imageUrl = PexelsService.getFallbackImage();
        }

        const processedRecipe = {
          id: Date.now().toString(),
          ...result.recipe,
          image: imageUrl,
          aiGenerated: true,
          createdAt: new Date().toISOString(),
        };
        setGeneratedRecipe(processedRecipe);
      } else {
        Alert.alert("❌ Lỗi", result.error || "Không thể tạo công thức");
      }
    } catch (error) {
      console.error("Generate Error:", error);
      Alert.alert(
        "❌ Lỗi",
        "Đã xảy ra lỗi khi tạo công thức. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Recipe
  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      const userId = await AsyncStorage.getItem("userId");
      const userEmail = await AsyncStorage.getItem("emailUser");

      const recipeWithMetadata = {
        ...generatedRecipe,
        isPublic: false,
        status: "private",
        createdBy: userId || userEmail || "unknown",
        publishedAt: null,
      };

      const response = await fetch(`${API_URL}/myRecipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeWithMetadata),
      });

      if (response.ok) {
        Alert.alert(
          "✅ Đã lưu! 🎉",
          "Công thức đã được lưu vào 'My Recipe'.\nBạn có thể xem và xuất bản sau.",
          [
            {
              text: "Xem chi tiết",
              onPress: () =>
                navigation.navigate("RecipeDetail", {
                  recipe: recipeWithMetadata,
                  source: "My Recipe",
                }),
            },
            {
              text: "Tạo mới",
              onPress: () => {
                setGeneratedRecipe(null);
                setIngredients("");
              },
            },
          ]
        );
      } else {
        throw new Error("Failed to save recipe");
      }
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("❌ Lỗi", "Không thể lưu công thức");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="sparkles" size={32} color="#FFF" />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>AI Chef</Text>
                <Text style={styles.headerSubtitle}>
                  Tạo công thức từ nguyên liệu có sẵn
                </Text>
              </View>
            </View>
          </LinearGradient>

          {!generatedRecipe ? (
            /* Input Form */
            <View style={styles.formContainer}>
              {/* Ingredients Card */}
              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="nutrition" size={20} color="#FF6B6B" />
                  <Text style={styles.cardTitle}>Nguyên liệu có sẵn</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <Text style={styles.cardHint}>
                  Nhập các nguyên liệu bạn có, phân cách bằng dấu phẩy
                </Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="VD: Thịt gà, cà chua, hành tây, tỏi, ớt, gia vị..."
                  value={ingredients}
                  onChangeText={setIngredients}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />
              </View>

              {/* Category Card */}
              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="restaurant" size={20} color="#FF6B6B" />
                  <Text style={styles.cardTitle}>Loại món ăn</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoriesScroll}
                  contentContainerStyle={styles.categoriesContent}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        category === cat && styles.categoryChipActive,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          category === cat && styles.categoryTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Servings & Cooking Time Row */}
              <View style={styles.rowContainer}>
                <View style={[styles.inputCard, styles.halfCard]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="people" size={20} color="#4ECDC4" />
                    <Text style={styles.cardTitle}>Số người</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  <TextInput
                    style={styles.numberInput}
                    placeholder="4"
                    value={servings}
                    onChangeText={setServings}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[styles.inputCard, styles.halfCard]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="time" size={20} color="#FF6B6B" />
                    <Text style={styles.cardTitle}>Thời gian (phút)</Text>
                  </View>
                  <TextInput
                    style={styles.numberInput}
                    placeholder="30"
                    value={cookingTime}
                    onChangeText={setCookingTime}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Diet Type Card */}
              <View style={styles.inputCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="leaf" size={20} color="#27AE60" />
                  <Text style={styles.cardTitle}>Chế độ ăn (tùy chọn)</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoriesScroll}
                  contentContainerStyle={styles.categoriesContent}
                >
                  {dietTypes.map((diet) => (
                    <TouchableOpacity
                      key={diet}
                      style={[
                        styles.dietChip,
                        dietType === diet && styles.dietChipActive,
                      ]}
                      onPress={() => setDietType(diet)}
                    >
                      <Text
                        style={[
                          styles.dietText,
                          dietType === diet && styles.dietTextActive,
                        ]}
                      >
                        {diet}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[
                  styles.generateBtn,
                  loading && styles.generateBtnDisabled,
                ]}
                onPress={handleGenerate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ["#CCC", "#AAA"] : ["#FF6B6B", "#FF8E53"]}
                  style={styles.generateBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator color="#FFF" size="small" />
                      <Text style={styles.generateBtnText}>
                        Đang tạo công thức...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="#FFF" />
                      <Text style={styles.generateBtnText}>
                        Tạo Công Thức AI
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            /* Generated Recipe Display */
            <View style={styles.recipeContainer}>
              {/* Recipe Image */}
              {generatedRecipe.image && (
                <Image
                  source={{ uri: generatedRecipe.image }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
              )}

              {/* Recipe Header */}
              <View style={styles.recipeHeader}>
                <View style={styles.recipeTitleRow}>
                  <Text style={styles.recipeName}>{generatedRecipe.name}</Text>
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={14} color="#FFF" />
                    <Text style={styles.aiBadgeText}>AI</Text>
                  </View>
                </View>
                {generatedRecipe.description && (
                  <Text style={styles.recipeDesc}>
                    {generatedRecipe.description}
                  </Text>
                )}

                {/* Recipe Stats */}
                <View style={styles.recipeStats}>
                  {generatedRecipe.calories && (
                    <View style={styles.statItem}>
                      <Ionicons name="flame" size={20} color="#FF6B6B" />
                      <Text style={styles.statValue}>
                        {generatedRecipe.calories}
                      </Text>
                      <Text style={styles.statLabel}>Cal</Text>
                    </View>
                  )}
                  {generatedRecipe.cookingTime && (
                    <View style={styles.statItem}>
                      <Ionicons name="time" size={20} color="#4ECDC4" />
                      <Text style={styles.statValue}>
                        {generatedRecipe.cookingTime}
                      </Text>
                      <Text style={styles.statLabel}>Phút</Text>
                    </View>
                  )}
                  {generatedRecipe.servings && (
                    <View style={styles.statItem}>
                      <Ionicons name="people" size={20} color="#95E1D3" />
                      <Text style={styles.statValue}>
                        {generatedRecipe.servings}
                      </Text>
                      <Text style={styles.statLabel}>Người</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Ingredients Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list" size={22} color="#FF6B6B" />
                  <Text style={styles.sectionTitle}>Nguyên liệu</Text>
                </View>
                {generatedRecipe.ingredients?.map((ing, index) => (
                  <View key={index} style={styles.ingredientCard}>
                    <View style={styles.ingredientHeader}>
                      <Ionicons
                        name="nutrition"
                        size={18}
                        color="#27AE60"
                        style={styles.ingredientIcon}
                      />
                      <Text style={styles.ingredientName}>{ing.name}</Text>
                    </View>
                    <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                  </View>
                ))}
              </View>

              {/* Instructions Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="restaurant" size={22} color="#FF6B6B" />
                  <Text style={styles.sectionTitle}>Cách làm</Text>
                </View>
                {generatedRecipe.instructions?.map((step, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      {cleanInstructionText(step)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Tips Section */}
              {generatedRecipe.tips && (
                <View style={styles.tipsCard}>
                  <View style={styles.tipsHeader}>
                    <Ionicons name="bulb" size={20} color="#F39C12" />
                    <Text style={styles.tipsTitle}>Mẹo nhỏ</Text>
                  </View>
                  <Text style={styles.tipsText}>{generatedRecipe.tips}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveRecipe}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#27AE60", "#229954"]}
                    style={styles.actionBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="save" size={20} color="#FFF" />
                    <Text style={styles.actionBtnText}>Lưu Công Thức</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.regenerateBtn}
                  onPress={() => {
                    setGeneratedRecipe(null);
                    setIngredients("");
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={20} color="#FF6B6B" />
                  <Text style={styles.regenerateBtnText}>Tạo Mới</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // Header Styles
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  // Form Container
  formContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  // Input Card Styles
  inputCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  required: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardHint: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
    marginLeft: 28,
  },
  textArea: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#333",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  // Row Container
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  halfCard: {
    width: "48%",
    marginBottom: 0,
  },
  numberInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "center",
    fontWeight: "600",
  },
  // Categories & Diet Types
  categoriesScroll: {
    marginTop: 8,
  },
  categoriesContent: {
    paddingRight: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryChipActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  dietChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F0F9F4",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D4EDDA",
  },
  dietChipActive: {
    backgroundColor: "#27AE60",
    borderColor: "#27AE60",
  },
  dietText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  dietTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  // Generate Button
  generateBtn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateBtnDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  generateBtnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  generateBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  // Recipe Display Styles
  recipeContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  recipeImage: {
    width: "100%",
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
  },
  recipeHeader: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 12,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  aiBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  recipeDesc: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  recipeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  // Section Styles
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  // Ingredient Styles
  ingredientCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#27AE60",
  },
  ingredientHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ingredientIcon: {
    marginRight: 10,
  },
  ingredientName: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginLeft: 8,
  },
  // Instruction Styles
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumberText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    flex: 1,
  },
  // Tips Styles
  tipsCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F39C12",
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 28,
  },
  // Action Buttons
  actionButtons: {
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#27AE60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  regenerateBtn: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  regenerateBtnText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default AIRecipeGenerator;
