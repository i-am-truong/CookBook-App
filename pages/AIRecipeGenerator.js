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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GeminiService from "../services/geminiService";
import PexelsService from "../services/pexelsService";
import { API_URL } from "../services/api";

const AIRecipeGenerator = ({ navigation }) => {
  // AI Recipe Generator States
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Dinner");
  const [servings, setServings] = useState("4");
  const [maxCalories, setMaxCalories] = useState("500");
  const [cookingTime, setCookingTime] = useState("30 phút");
  const [dietPreference, setDietPreference] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);

  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Appetizer",
    "Fastfood",
    "Dessert",
    "Healthy",
  ];

  // Handle AI Recipe Generation
  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nguyên liệu!");
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
        maxCalories: parseInt(maxCalories) || 500,
        cookingTime,
        dietPreference,
      };

      const result = await GeminiService.generateRecipe(userInput);

      if (result.success) {
        // Fetch real food image from Pexels based on ingredients
        let imageUrl = null;
        try {
          // Use ingredients for more accurate image search
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
        Alert.alert("Lỗi", result.error || "Không thể tạo công thức");
      }
    } catch (error) {
      console.error("Generate Error:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo công thức");
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Recipe
  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      // Save to BOTH recipes and myRecipes
      const saveToRecipes = fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedRecipe),
      });

      const saveToMyRecipes = fetch(`${API_URL}/myRecipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedRecipe),
      });

      // Wait for both requests to complete
      const [recipesResponse, myRecipesResponse] = await Promise.all([
        saveToRecipes,
        saveToMyRecipes,
      ]);

      if (recipesResponse.ok && myRecipesResponse.ok) {
        Alert.alert(
          "Thành công!",
          "Công thức đã được lưu vào cả 2 danh sách!",
          [
            {
              text: "Xem chi tiết",
              onPress: () =>
                navigation.navigate("RecipeDetail", {
                  recipe: generatedRecipe,
                }),
            },
            { text: "Tạo món mới", onPress: () => setGeneratedRecipe(null) },
          ]
        );
      } else {
        throw new Error("Failed to save to one or both lists");
      }
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Lỗi", "Không thể lưu công thức");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Gradient */}
        <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
          <Ionicons name="sparkles" size={40} color="#FFF" />
          <Text style={styles.title}>AI Recipe Generator</Text>
          <Text style={styles.subtitle}>Powered by Google Gemini</Text>
        </LinearGradient>

        {!generatedRecipe ? (
          /* Input Form */
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>🥗 Nguyên liệu có sẵn</Text>
              <Text style={styles.hint}>Phân cách bằng dấu phẩy</Text>
              <TextInput
                style={styles.textArea}
                placeholder="VD: Gà, cà chua, hành tây, tỏi, ớt..."
                value={ingredients}
                onChangeText={setIngredients}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>🍽️ Loại món ăn</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn,
                      category === cat && styles.categoryBtnActive,
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

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>👥 Số người</Text>
                <TextInput
                  style={styles.input}
                  placeholder="4"
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>🔥 Max Calories</Text>
                <TextInput
                  style={styles.input}
                  placeholder="500"
                  value={maxCalories}
                  onChangeText={setMaxCalories}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>⏱️ Thời gian nấu tối đa</Text>
              <TextInput
                style={styles.input}
                placeholder="30 phút"
                value={cookingTime}
                onChangeText={setCookingTime}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>💚 Chế độ ăn (tùy chọn)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Chay, low-carb, healthy..."
                value={dietPreference}
                onChangeText={setDietPreference}
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.generateBtn,
                loading && styles.generateBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ["#CCC", "#999"] : ["#FF6B6B", "#FF8E53"]}
                style={styles.generateBtnGradient}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color="#FFF" size="small" />
                    <Text style={styles.generateBtnText}>Đang tạo...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={22} color="#FFF" />
                    <Text style={styles.generateBtnText}>Tạo Công Thức AI</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          /* Generated Recipe Display */
          <View style={styles.recipeContainer}>
            <View style={styles.recipeHeader}>
              <Text style={styles.recipeName}>{generatedRecipe.name}</Text>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#FFF" />
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>

            <Text style={styles.recipeDesc}>{generatedRecipe.description}</Text>

            <View style={styles.recipeInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="flame" size={24} color="#FF6B6B" />
                <Text style={styles.infoValue}>{generatedRecipe.calories}</Text>
                <Text style={styles.infoLabel}>Calories</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={24} color="#4ECDC4" />
                <Text style={styles.infoValue}>
                  {generatedRecipe.cookingTime}
                </Text>
                <Text style={styles.infoLabel}>Thời gian</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people" size={24} color="#95E1D3" />
                <Text style={styles.infoValue}>{generatedRecipe.servings}</Text>
                <Text style={styles.infoLabel}>Người ăn</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={20} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Nguyên liệu</Text>
              </View>
              {generatedRecipe.ingredients.map((ing, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.ingredientText}>
                    {ing.name}:{" "}
                    <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant" size={20} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Cách làm</Text>
              </View>
              {generatedRecipe.instructions.map((step, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{step}</Text>
                </View>
              ))}
            </View>

            {generatedRecipe.tips && (
              <View style={styles.tipsContainer}>
                <Ionicons name="bulb" size={20} color="#F39C12" />
                <Text style={styles.tipsText}>{generatedRecipe.tips}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveRecipe}
              >
                <LinearGradient
                  colors={["#27AE60", "#229954"]}
                  style={styles.actionBtnGradient}
                >
                  <Ionicons name="save" size={20} color="#FFF" />
                  <Text style={styles.actionBtnText}>Lưu Công Thức</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.regenerateBtn}
                onPress={() => setGeneratedRecipe(null)}
              >
                <Ionicons name="refresh" size={20} color="#FF6B6B" />
                <Text style={styles.regenerateBtnText}>Tạo Lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  scrollView: { flex: 1 },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: { fontSize: 28, fontWeight: "bold", marginTop: 15, color: "#FFF" },
  subtitle: { fontSize: 14, color: "#FFE8E8", marginTop: 8 },
  form: { padding: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 17, fontWeight: "700", color: "#2C3E50", marginBottom: 8 },
  hint: { fontSize: 13, color: "#95A5A6", marginBottom: 8 },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E8ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E8ECEF",
    minHeight: 100,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  halfInput: { flex: 1, marginRight: 10 },
  categoriesScroll: { marginTop: 5 },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#E8ECEF",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryBtnActive: { backgroundColor: "#FF6B6B", borderColor: "#FF6B6B" },
  categoryText: { color: "#2C3E50", fontWeight: "600", fontSize: 15 },
  categoryTextActive: { color: "#FFF" },
  generateBtn: {
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  generateBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  recipeContainer: { padding: 20, paddingBottom: 40 },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  recipeName: { fontSize: 26, fontWeight: "bold", color: "#2C3E50", flex: 1 },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9B59B6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  aiBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 5,
  },
  recipeDesc: {
    fontSize: 16,
    color: "#7F8C8D",
    lineHeight: 24,
    marginBottom: 20,
  },
  recipeInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: { alignItems: "center" },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 8,
  },
  infoLabel: { fontSize: 12, color: "#95A5A6", marginTop: 4 },
  section: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  ingredientText: { fontSize: 16, color: "#34495E", marginLeft: 10, flex: 1 },
  ingredientAmount: { fontWeight: "600", color: "#27AE60" },
  instructionItem: { flexDirection: "row", marginBottom: 15 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  instructionText: {
    fontSize: 16,
    color: "#34495E",
    lineHeight: 24,
    flex: 1,
    paddingTop: 4,
  },
  tipsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
  },
  tipsText: {
    fontSize: 15,
    color: "#7D6608",
    marginLeft: 10,
    flex: 1,
    lineHeight: 22,
    fontStyle: "italic",
  },
  actionButtons: { flexDirection: "row", gap: 12 },
  saveBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  regenerateBtn: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  regenerateBtnText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default AIRecipeGenerator;
