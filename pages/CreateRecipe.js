import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImagePickerComponent from "./ImagePickerComponent";
import { API_URL } from "@env";

const CreateRecipeScreen = ({ navigation }) => {
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

  // Validate form before submitting
  const validate = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter recipe name!");
      return false;
    }
    if (!category) {
      Alert.alert("Error", "Please select a category!");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter description!");
      return false;
    }
    if (!calories || isNaN(calories)) {
      Alert.alert("Error", "Please enter valid calories!");
      return false;
    }
    if (!cookingTime.trim()) {
      Alert.alert("Error", "Please enter cooking time!");
      return false;
    }
    if (!servings || isNaN(servings) || servings < 1) {
      Alert.alert("Error", "Please enter valid servings!");
      return false;
    }
    if (!imageUri) {
      Alert.alert("Error", "Please select an image!");
      return false;
    }

    // Check ingredients
    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.amount.trim()
    );
    if (validIngredients.length === 0) {
      Alert.alert("Error", "Please add at least one ingredient!");
      return false;
    }

    // Check instructions
    const validInstructions = instructions.filter((step) => step.trim());
    if (validInstructions.length === 0) {
      Alert.alert("Error", "Please add at least one instruction step!");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;

    // Filter out empty ingredients and instructions
    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.amount.trim()
    );
    const validInstructions = instructions.filter((step) => step.trim());

    const newRecipe = {
      id: Math.random().toString(),
      name: name.trim(),
      category,
      description: description.trim(),
      calories: parseInt(calories),
      cookingTime: cookingTime.trim(),
      servings: parseInt(servings),
      ingredients: validIngredients,
      instructions: validInstructions,
      image: imageUri,
    };

    try {
      const response = await fetch(`${API_URL}/myRecipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecipe),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Recipe created:", data);

      Alert.alert("Success! 🎉", "Your recipe has been created successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Clear form
            setName("");
            setCategory("");
            setDescription("");
            setCalories("");
            setCookingTime("");
            setServings("");
            setIngredients([{ name: "", amount: "" }]);
            setInstructions([""]);
            setImageUri(null);

            // Navigate to Cookbook page
            navigation.navigate("Cookbook");
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating recipe:", error);
      Alert.alert(
        "Error",
        "Failed to create recipe. Please make sure JSON server is running.\n\nRun: npm run server"
      );
    }
  };

  // Handle ingredient change
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Add new ingredient
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }]);
  };

  // Remove ingredient
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    }
  };

  // Handle instruction change
  const handleInstructionChange = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  // Add new instruction
  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  // Remove instruction
  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      const newInstructions = instructions.filter((_, i) => i !== index);
      setInstructions(newInstructions);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Create New Recipe</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Basic Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Recipe Name *"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

        {/* Category Picker */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={category ? styles.selectedText : styles.placeholderText}>
            {category || "Select Category *"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#999" />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description *"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="#999"
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Calories *"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.halfInput}>
            <TextInput
              style={styles.input}
              placeholder="Servings *"
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Cooking Time (e.g., 30 phút) *"
          value={cookingTime}
          onChangeText={setCookingTime}
          placeholderTextColor="#999"
        />
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🥘 Ingredients</Text>
          <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <View style={styles.ingredientInputs}>
              <TextInput
                style={[styles.input, styles.ingredientName]}
                placeholder="Ingredient name"
                value={ingredient.name}
                onChangeText={(text) =>
                  handleIngredientChange(index, "name", text)
                }
                placeholderTextColor="#999"
              />
              <TextInput
                style={[styles.input, styles.ingredientAmount]}
                placeholder="Amount"
                value={ingredient.amount}
                onChangeText={(text) =>
                  handleIngredientChange(index, "amount", text)
                }
                placeholderTextColor="#999"
              />
            </View>
            {ingredients.length > 1 && (
              <TouchableOpacity
                onPress={() => removeIngredient(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
          <TouchableOpacity onPress={addInstruction} style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {instructions.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.stepInput]}
              value={step}
              onChangeText={(text) => handleInstructionChange(index, text)}
              placeholder={`Step ${index + 1}`}
              multiline
              placeholderTextColor="#999"
            />
            {instructions.length > 1 && (
              <TouchableOpacity
                onPress={() => removeInstruction(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Image Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📷 Recipe Image</Text>
        <ImagePickerComponent setImageUri={setImageUri} imageUri={imageUri} />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.submitButtonText}>Create Recipe</Text>
      </TouchableOpacity>

      {/* Category Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    category === cat && styles.selectedCategory,
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.selectedCategoryText,
                    ]}
                  >
                    {cat}
                  </Text>
                  {category === cat && (
                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#999",
    fontSize: 16,
  },
  selectedText: {
    color: "#333",
    fontSize: 16,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: "row",
  },
  ingredientName: {
    flex: 2,
    marginRight: 8,
    marginBottom: 0,
  },
  ingredientAmount: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    padding: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 8,
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepInput: {
    flex: 1,
    marginBottom: 0,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedCategory: {
    backgroundColor: "#e8f5e9",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  selectedCategoryText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});

export default CreateRecipeScreen;
