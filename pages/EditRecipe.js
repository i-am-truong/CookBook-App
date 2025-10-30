import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImagePickerComponent from "./ImagePickerComponent";
import { API_URL } from "../services/api";

const EditRecipeScreen = ({ route, navigation }) => {
  const { recipe } = route.params; // Get recipe to edit
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }]);
  const [instructions, setInstructions] = useState([""]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Appetizer",
    "Fastfood",
    "Dessert",
    "Beverage",
    "Healthy",
  ];

  // Load recipe data when component mounts
  useEffect(() => {
    if (recipe) {
      setName(recipe.name || "");
      setCategory(recipe.category || "");
      setDescription(recipe.description || "");
      setCalories(recipe.calories?.toString() || "");
      setCookingTime(recipe.cookingTime || "");
      setServings(recipe.servings?.toString() || "");
      setImageUri(recipe.image || null);
      setIngredients(recipe.ingredients?.length > 0 ? recipe.ingredients : [{ name: "", amount: "" }]);
      setInstructions(recipe.instructions?.length > 0 ? recipe.instructions : [""]);
    }
  }, [recipe]);

  // Validate form before submitting
  const validate = () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên công thức!");
      return false;
    }
    if (!category) {
      Alert.alert("Lỗi", "Vui lòng chọn danh mục!");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mô tả!");
      return false;
    }
    if (!calories || isNaN(calories)) {
      Alert.alert("Lỗi", "Vui lòng nhập số calories hợp lệ!");
      return false;
    }
    if (!cookingTime.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập thời gian nấu!");
      return false;
    }
    if (!servings || isNaN(servings) || servings < 1) {
      Alert.alert("Lỗi", "Vui lòng nhập số người ăn hợp lệ!");
      return false;
    }
    if (!imageUri) {
      Alert.alert("Lỗi", "Vui lòng chọn hình ảnh!");
      return false;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.amount.trim()
    );
    if (validIngredients.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất một nguyên liệu!");
      return false;
    }

    const validInstructions = instructions.filter((step) => step.trim());
    if (validInstructions.length === 0) {
      Alert.alert("Lỗi", "Vui lòng thêm ít nhất một bước hướng dẫn!");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.amount.trim()
    );
    const validInstructions = instructions.filter((step) => step.trim());

    const updatedRecipe = {
      ...recipe, // Keep existing fields like id, createdAt, etc.
      name: name.trim(),
      category,
      description: description.trim(),
      calories: parseInt(calories),
      cookingTime: cookingTime.trim(),
      servings: parseInt(servings),
      ingredients: validIngredients,
      instructions: validInstructions,
      image: imageUri,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Update in myRecipes
      const response = await fetch(`${API_URL}/myRecipes/${recipe.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRecipe),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Recipe updated in myRecipes:", data);

      // Also update in recipes collection if it exists there (for AI-generated recipes)
      try {
        const recipesResponse = await fetch(`${API_URL}/recipes`);
        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json();
          const existsInRecipes = recipesData.some((r) => r.id === recipe.id);
          
          if (existsInRecipes) {
            await fetch(`${API_URL}/recipes/${recipe.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedRecipe),
            });
            console.log("Recipe also updated in recipes collection");
          }
        }
      } catch (error) {
        console.error("Error updating in recipes collection:", error);
        // Continue even if this fails
      }

      // Also update in savedRecipes collection if it exists there
      try {
        const savedResponse = await fetch(`${API_URL}/savedRecipes`);
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const existsInSaved = savedData.some((r) => r.id === recipe.id);
          
          if (existsInSaved) {
            await fetch(`${API_URL}/savedRecipes/${recipe.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedRecipe),
            });
            console.log("Recipe also updated in savedRecipes collection");
          }
        }
      } catch (error) {
        console.error("Error updating in savedRecipes collection:", error);
        // Continue even if this fails
      }

      Alert.alert("Thành công! 🎉", "Công thức đã được cập nhật!", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Error updating recipe:", error);
      Alert.alert(
        "Lỗi",
        "Không thể cập nhật công thức. Vui lòng kiểm tra kết nối và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add ingredient field
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  };

  // Remove ingredient field
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  // Update ingredient
  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Add instruction step
  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  // Remove instruction step
  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
    }
  };

  // Update instruction
  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa công thức</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Picker */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>Hình ảnh món ăn *</Text>
          <ImagePickerComponent imageUri={imageUri} setImageUri={setImageUri} />
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Tên món ăn *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Phở bò"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Danh mục *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={category ? styles.pickerText : styles.pickerPlaceholder}>
              {category || "Chọn danh mục"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.label}>Mô tả *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả ngắn về món ăn"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Calories *</Text>
              <TextInput
                style={styles.input}
                placeholder="350"
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Số người ăn *</Text>
              <TextInput
                style={styles.input}
                placeholder="4"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Thời gian nấu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 30 phút"
            value={cookingTime}
            onChangeText={setCookingTime}
          />
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nguyên liệu</Text>
            <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientName]}
                placeholder="Tên nguyên liệu"
                value={ingredient.name}
                onChangeText={(value) => updateIngredient(index, "name", value)}
              />
              <TextInput
                style={[styles.input, styles.ingredientAmount]}
                placeholder="Số lượng"
                value={ingredient.amount}
                onChangeText={(value) => updateIngredient(index, "amount", value)}
              />
              {ingredients.length > 1 && (
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Ionicons name="close-circle" size={24} color="#FF5252" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hướng dẫn</Text>
            <TouchableOpacity onPress={addInstruction} style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <Text style={styles.stepNumber}>{index + 1}.</Text>
              <TextInput
                style={[styles.input, styles.instructionInput]}
                placeholder="Nhập bước hướng dẫn"
                value={instruction}
                onChangeText={(value) => updateInstruction(index, value)}
                multiline
              />
              {instructions.length > 1 && (
                <TouchableOpacity onPress={() => removeInstruction(index)}>
                  <Ionicons name="close-circle" size={24} color="#FF5252" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Cập nhật công thức</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>
            <ScrollView>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                  {category === cat && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  section: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    padding: 4,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ingredientName: {
    flex: 2,
    marginRight: 8,
  },
  ingredientAmount: {
    flex: 1,
    marginRight: 8,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginRight: 8,
  },
  instructionInput: {
    flex: 1,
    marginRight: 8,
    minHeight: 44,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#a5d6a7",
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryOptionSelected: {
    backgroundColor: "#e8f5e9",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#333",
  },
  categoryOptionTextSelected: {
    fontWeight: "600",
    color: "#4CAF50",
  },
});

export default EditRecipeScreen;
