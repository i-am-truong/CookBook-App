import { Ionicons } from "@expo/vector-icons";
import React,{useEffect,useState} from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import database from "../database.json"; 


const RecipeDetail = ({ route, navigation }) => {
  const { recipe } = route.params; // Get the recipe data from route params
  const [isSaved, setIsSaved] = useState(false);

  const infoData = [
    { label: "Calories", value: `${recipe.calories} Cal`, icon: "flame" },
    { label: "Time", value: recipe.cookingTime, icon: "time" },
    { label: "Servings", value: `${recipe.servings} People`, icon: "people" },
  ];

  useEffect(() => {
    // Kiểm tra xem recipe có trong savedRecipes không
    const exists = database.savedRecipes.some((item) => item.id === recipe.id);
    setIsSaved(exists);
  }, [database.savedRecipes, recipe.id]);

  const handleSave = async () => {
    try {
      const response = await fetch("http://10.0.2.2:5001/savedRecipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });
      const data = await response.json();
      console.log("Recipe saved!", data);
      Alert.alert("Success", "Recipe has been saved to your saved recipes!");
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe. Please try again later.");
    }
  };

  return (
    <FlatList
      data={[
        { type: "header" },
        { type: "info" },
        { type: "ingredients" },
        { type: "steps" },
        { type: "cta" },
      ]} // Adding CTA as last item
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
                <TouchableOpacity onPress={handleSave}>
                  <Ionicons
                    name={isSaved ? "heart" : "heart-outline"} // Nếu đã lưu thì dùng icon đầy, chưa thì outline
                    size={24}
                    color={isSaved ? "#4CAF50" : "#4CAF50"} // Màu đỏ nếu đã lưu, màu xanh nếu chưa
                    style={{
                      borderWidth: 1, // Nếu chưa lưu thì thêm viền
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
      ListHeaderComponent={() => null} // To avoid extra padding in the header
    />
  );
};

const styles = StyleSheet.create({
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
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
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
