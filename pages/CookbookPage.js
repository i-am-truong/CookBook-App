import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { fetchMyRecipes, fetchSavedRecipes, deleteMyRecipe, deleteRecipeAPI, unsaveRecipeAPI } from "../services/api";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const itemWidth = screenWidth / numColumns - 24;

const CookbookPage = () => {
  const [activeTab, setActiveTab] = useState("My Recipe");
  const [myRecipes, setMyRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadData();
  }, []);

  // Reload data khi quay lại trang này
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      // Load từ local database hoặc API dự phòng
      const [myRecipesData, savedRecipesData] = await Promise.all([
        fetchMyRecipes(),
        fetchSavedRecipes(),
      ]);

      setMyRecipes(myRecipesData);
      setSavedRecipes(savedRecipesData);
    } catch (error) {
      console.error("Error loading recipes:", error);
      // Set empty arrays if API fails
      setMyRecipes([]);
      setSavedRecipes([]);
    }
  };

  const data = activeTab === "My Recipe" ? myRecipes : savedRecipes;

  const handleDeleteRecipe = (recipe) => {
    Alert.alert("Xóa công thức", `Bạn có chắc muốn xóa "${recipe.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            // Delete from myRecipes
            await deleteMyRecipe(recipe.id);
            console.log("Recipe deleted from myRecipes");

            // Also delete from recipes collection if it exists there (for AI-generated recipes)
            // Note: This is optional - recipe may not exist in recipes collection
            try {
              const result = await deleteRecipeAPI(recipe.id);
              if (result.success) {
                console.log("Recipe also deleted from recipes collection");
              }
            } catch (error) {
              // Silently continue - recipe may not exist in recipes collection
              console.log("Recipe not found in recipes collection (this is normal)");
            }

            // Also delete from savedRecipes collection if it exists there
            // Note: This is optional - recipe may not exist in savedRecipes collection
            try {
              const result = await unsaveRecipeAPI(recipe.id);
              if (result.success) {
                console.log("Recipe also deleted from savedRecipes collection");
              }
            } catch (error) {
              // Silently continue - recipe may not exist in savedRecipes collection
              console.log("Recipe not found in savedRecipes collection (this is normal)");
            }

            // Reload data immediately before showing alert
            await loadData();
            Alert.alert("Thành công", "Công thức đã được xóa!");
          } catch (error) {
            console.error("Error deleting recipe:", error);
            Alert.alert("Lỗi", "Không thể xóa công thức!");
          }
        },
      },
    ]);
  };

  const handleLongPress = (item) => {
    if (activeTab !== "My Recipe") return;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chỉnh sửa", "Xóa"],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            navigation.navigate("EditRecipe", { recipe: item });
          } else if (buttonIndex === 2) {
            handleDeleteRecipe(item);
          }
        }
      );
    } else {
      Alert.alert("Chọn hành động", "", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chỉnh sửa",
          onPress: () => navigation.navigate("EditRecipe", { recipe: item }),
        },
        {
          text: "Xóa",
          onPress: () => handleDeleteRecipe(item),
          style: "destructive",
        },
      ]);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("RecipeDetail", { recipe: item, source: activeTab })
      }
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,1)"]}
          style={styles.textContainer}
        >
          <View style={styles.titleRow}>
            <Text
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            {activeTab === "My Recipe" && (
              <View style={styles.badgeContainer}>
                {item.isPublic === false && (
                  <View style={styles.statusBadge}>
                    <Ionicons name="lock-closed" size={10} color="#FF6B6B" />
                    <Text style={styles.statusBadgeText}>Private</Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name="create-outline" size={14} color="#fff" />
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cookbook</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab("My Recipe")}
          style={[
            styles.tabButton,
            activeTab === "My Recipe" && styles.activeTabButton,
          ]}
        >
          <Text
            style={[styles.tab, activeTab === "My Recipe" && styles.activeTab]}
          >
            ✨ My Recipe
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Saved")}
          style={[
            styles.tabButton,
            activeTab === "Saved" && styles.activeTabButton,
          ]}
        >
          <Text style={[styles.tab, activeTab === "Saved" && styles.activeTab]}>
            🔖 Saved
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => `${activeTab}-${item.id}`}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
      />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tab: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  activeTab: {
    color: "#000",
    fontWeight: "bold",
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    overflow: "hidden",
    margin: 6,
    width: itemWidth,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 160,
    justifyContent: "flex-end",
  },
  textContainer: {
    padding: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.9)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  editBadge: {
    backgroundColor: "rgba(33, 150, 243, 0.9)",
    borderRadius: 12,
    padding: 4,
  },
  activeTabButton: {
    backgroundColor: "#4CAF50",
  },
});

export default CookbookPage;
