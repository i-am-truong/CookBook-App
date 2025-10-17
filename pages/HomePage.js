import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { recipes } from "../data";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const itemWidth = screenWidth / numColumns - 16;

export default function HomePage() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [nameUser, setNameUser] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [randomRecipes, setRandomRecipes] = useState([]);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("nameUser");
        if (name) setNameUser(name);
      } catch (error) {
        console.error("Lỗi khi lấy tên người dùng:", error);
      }
    };

    const updateRandomRecipes = () => {
      const shuffled = [...recipes].sort(() => 0.5 - Math.random());
      setRandomRecipes(shuffled.slice(0, 8));
    };

    updateRandomRecipes(); // Load dữ liệu ban đầu

    const interval = setInterval(updateRandomRecipes, 300000); // Cập nhật sau mỗi 5 phút

    fetchUserName(); // Lấy tên người dùng

    return () => clearInterval(interval); // Cleanup khi component unmount
  }, []); // ✅ Không cần truyền `[recipes]` vì `recipes` không thay đổi

  const categories = useMemo(
    () => [...new Set(recipes.map((recipe) => recipe.category))],
    [recipes]
  );

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
      .replace(/đ/g, "d") // Chuyển đ → d
      .replace(/Đ/g, "D");
  };

  const filteredRecipes = useMemo(() => {
    if (search.length === 0) return recipes;

    const searchNormalized = removeVietnameseTones(search.toLowerCase());

    return recipes.filter((recipe) =>
      removeVietnameseTones(recipe.name.toLowerCase()).includes(
        searchNormalized
      )
    );
  }, [search]);

  const handleSearch = (query) => {
    setSearch(query);
    setShowSuggestions(query.length > 0);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.replace("Login");
  };

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category}
      style={styles.categoryItem}
      onPress={() => navigation.navigate("RecipeByCategory", { category })}
    >
      <Ionicons name="fast-food-outline" size={30} color="orange" />
      <Text>{category}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss(); // Đóng bàn phím
        setShowSuggestions(false); // Ẩn danh sách
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={40} color="green" />
          <Text style={styles.greeting}>Hello, {nameUser}</Text>
        </View>

        {/* Input và danh sách gợi ý */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="gray"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={handleSearch}
              placeholder="Search for recipes, ingredients..."
              returnKeyType="done"
              onFocus={() => setShowSuggestions(true)}
            />
          </View>

          {/* Danh sách gợi ý */}
          {showSuggestions &&
            search.length > 0 &&
            filteredRecipes.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={filteredRecipes}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => {
                        navigation.navigate("Detail", { recipe: item });
                        setSearch(item.name); // Cập nhật ô input với món ăn đã chọn
                        setShowSuggestions(false); // Ẩn danh sách khi chọn
                      }}
                    >
                      <Text style={styles.suggestionText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
        </View>

        {/* Category Section */}
        <Text style={styles.sectionTitle}>Category</Text>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => renderCategoryItem(item)}
          keyExtractor={(item) => item}
          contentContainerStyle={{ alignItems: "center", paddingVertical: 10 }}
        />

        <Text style={styles.title}>Propose</Text>

        {/* Danh sách công thức ngẫu nhiên */}
        <FlatList
          data={randomRecipes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          numColumns={numColumns}
          getItemLayout={(data, index) => ({
            length: 150,
            offset: 150 * index,
            index,
          })}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
            >
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.image}
                imageStyle={{ borderRadius: 10 }}
              >
                <View style={styles.overlay}>
                  <Text style={styles.text}>{item.name}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: { fontSize: 18, fontWeight: "bold" },
  searchWrapper: { position: "relative", marginBottom: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  suggestionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 200,
    elevation: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: { fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  categoryContainer: { marginBottom: 20 },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingLeft: 0,
    borderRadius: 10,
    backgroundColor: "#fff",
    height: 100, // Tăng chiều cao để không cắt chữ
    minWidth: 80, // Đảm bảo kích thước tối thiểu
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    flex: 1,
    margin: 8,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: { width: itemWidth, height: 150, justifyContent: "flex-end" },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  text: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  suggestionsContainer: {
    position: "absolute",
    top: 50, // Đẩy xuống dưới ô tìm kiếm
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    maxHeight: 200,
    elevation: 5,
    zIndex: 100, // Hiển thị trên tất cả các phần khác
  },
});
