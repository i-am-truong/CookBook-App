import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  View,
  Alert,
  ScrollView, // Ensure ScrollView is imported
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { fetchRecipes as fetchRecipesAPI } from "../services/api";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const itemWidth = screenWidth / numColumns - 16;

export default function HomePage() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [nameUser, setNameUser] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  // Budget Buddy
  const [budgetMode, setBudgetMode] = useState('daily'); // 'daily' or 'weekly'
  const [budgetValue, setBudgetValue] = useState(''); // Single input
  const [debouncedBudgetValue, setDebouncedBudgetValue] = useState(''); // Debounced for filtering
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  // Animated cho category header (chỉ collapse category)
  const scrollY = useRef(new Animated.Value(0)).current;
  const categoryTranslateY = useRef(new Animated.Value(0)).current;
  const categoryOpacity = useRef(new Animated.Value(1)).current;
  const CATEGORY_MAX_HEIGHT = 200; // Adjust based on category height (title + horizontal FlatList)
  const lastScrollY = useRef(0);

  const fetchRecipes = useCallback(async () => {
    try {
      const data = await fetchRecipesAPI();
      // Filter public
      const publicRecipes = data.filter((recipe) => recipe.isPublic !== false);
      // Fallback estimated_cost
      const processed = publicRecipes.map(recipe => ({
        ...recipe,
        estimated_cost: recipe.estimated_cost || (recipe.ingredients.reduce((sum, ing) => sum + (ing.price || 10000), 0) / recipe.servings)
      }));
      setRecipes(processed);
      // Random
      const shuffled = [...processed].sort(() => 0.5 - Math.random());
      setRandomRecipes(shuffled.slice(0, 8));
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [fetchRecipes])
  );

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
      if (recipes.length > 0) {
        const shuffled = [...recipes].sort(() => 0.5 - Math.random());
        setRandomRecipes(shuffled.slice(0, 8));
      }
    };
    fetchUserName();
    const interval = setInterval(updateRandomRecipes, 300000);
    return () => clearInterval(interval);
  }, [recipes]);

  // Debounce budgetValue for filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBudgetValue(budgetValue);
    }, 500); // 500ms debounce delay
    return () => clearTimeout(timer);
  }, [budgetValue]);

  const categories = useMemo(
    () => [...new Set(recipes.map((recipe) => recipe.category))],
    [recipes]
  );

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Filter + search + budget (use debounced for budget to avoid frequent re-renders)
  useEffect(() => {
    let filtered = recipes;
    if (search.length > 0) {
      const searchNormalized = removeVietnameseTones(search.toLowerCase());
      filtered = filtered.filter((recipe) =>
        removeVietnameseTones(recipe.name.toLowerCase()).includes(searchNormalized)
      );
    }
    const budgetNum = parseInt(debouncedBudgetValue, 10);
    if (debouncedBudgetValue && !isNaN(budgetNum)) {
      filtered = filtered.filter(r => r.estimated_cost <= budgetNum);
    }
    setFilteredRecipes(filtered);
    setShowSuggestions(search.length > 0 && filtered.length > 0);
  }, [search, debouncedBudgetValue, budgetMode, recipes]);

  // Toggle mode - keep value when switch
  const handleBudgetMode = (mode) => {
    setBudgetMode(mode);
  };

  // Generate weekly plan & navigate
  const generateAndNavigate = () => {
    Keyboard.dismiss(); // Dismiss keyboard before navigate
    const budgetNum = parseInt(budgetValue, 10);
    if (!budgetNum || budgetNum <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập ngân sách hợp lệ!");
      return;
    }
    if (filteredRecipes.length === 0) {
      Alert.alert("Lỗi", "Không có recipe phù hợp. Thử nới lỏng filter!");
      return;
    }
    navigation.navigate('Planner', { weeklyBudget: budgetNum, recipes: filteredRecipes });
  };

  // Handle filter button for daily mode (force immediate filter without dismiss)
  const handleFilterDaily = () => {
    // Force update filteredRecipes immediately for daily mode
    const budgetNum = parseInt(budgetValue, 10);
    let filtered = recipes;
    if (search.length > 0) {
      const searchNormalized = removeVietnameseTones(search.toLowerCase());
      filtered = filtered.filter((recipe) =>
        removeVietnameseTones(recipe.name.toLowerCase()).includes(searchNormalized)
      );
    }
    if (budgetValue && !isNaN(budgetNum)) {
      filtered = filtered.filter(r => r.estimated_cost <= budgetNum);
    }
    setFilteredRecipes(filtered);
    setDebouncedBudgetValue(budgetValue); // Sync debounce immediately
    // Dismiss keyboard after filter
    Keyboard.dismiss();
  };

  const handleSearch = (query) => {
    setSearch(query);
    setShowSuggestions(query.length > 0);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.replace("Login");
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      Dinner: { name: "restaurant", color: "#FF6B6B" },
      Lunch: { name: "sunny", color: "#FFD93D" },
      Fastfood: { name: "fast-food", color: "#FF8C42" },
      Breakfast: { name: "cafe", color: "#6BCB77" },
      Appetizer: { name: "nutrition", color: "#4D96FF" },
    };
    return iconMap[category] || { name: "fast-food", color: "orange" };
  };

  const renderCategoryItem = (category) => {
    const icon = getCategoryIcon(category);
    return (
      <TouchableOpacity
        key={category}
        style={styles.categoryItem}
        onPress={() => navigation.navigate("RecipeByCategory", { category })}
      >
        <Ionicons name={icon.name} size={30} color={icon.color} />
        <Text>{category}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <ImageBackground source={{ uri: item.image }} style={styles.image} imageStyle={{ borderRadius: 10 }}>
        <View style={styles.overlay}>
          {/* Name bottom left */}
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {/* Price top left, full number, no VND, green */}
          <Text style={styles.priceTag}>{Math.round(item.estimated_cost).toLocaleString()}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Render collapsing category header (chỉ category + title)
  const renderCollapsingCategoryHeader = () => (
    <Animated.View
      style={[
        styles.categoryHeaderContainer,
        {
          transform: [{ translateY: categoryTranslateY }],
          opacity: categoryOpacity,
        },
      ]}
    >
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

      {/* Filtered List Title */}
      {filteredRecipes.length > 0 && (search || budgetMode === 'daily') && (
        <Text style={styles.sectionTitle}>Kết Quả ({filteredRecipes.length})</Text>
      )}
    </Animated.View>
  );

  // Handle scroll for collapsing category only
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;
        lastScrollY.current = currentScrollY;

        if (currentScrollY > 0 && diff > 0 && currentScrollY > CATEGORY_MAX_HEIGHT) {
          // Scrolling down beyond threshold - hide category
          Animated.spring(categoryTranslateY, {
            toValue: -CATEGORY_MAX_HEIGHT,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
          Animated.spring(categoryOpacity, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        } else if (diff < 0 || currentScrollY <= 0) {
          // Scrolling up or at top - show category
          Animated.spring(categoryTranslateY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
          Animated.spring(categoryOpacity, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    }
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setShowSuggestions(false);
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header (keep show) */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Profile", {
                screen: "ProfileMain", // ép về đúng màn hình gốc của Profile stack
              })
            }
          >
            <Ionicons name="person-circle-outline" size={40} color="green" />
          </TouchableOpacity>
          <Text style={styles.greeting}>Hello, {nameUser}</Text>
        </View>
        {/* Search (keep show) */}
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
          {showSuggestions && search.length > 0 && filteredRecipes.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={filteredRecipes}
                keyExtractor={(item) => `suggestion-${item.id}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => {
                      navigation.navigate("RecipeDetail", { recipe: item });
                      setSearch(item.name);
                      setShowSuggestions(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
        {/* Budget Buddy - Cố định, không collapse */}
        <View style={styles.budgetContainer}>
          {/* Toggle Selector */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, budgetMode === 'daily' && styles.toggleActive]}
              onPress={() => handleBudgetMode('daily')}
            >
              <Text style={styles.toggleText}>Chi phí ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, budgetMode === 'weekly' && styles.toggleActive]}
              onPress={() => handleBudgetMode('weekly')}
            >
              <Text style={styles.toggleText}>Chi phí tuần</Text>
            </TouchableOpacity>
          </View>
          {/* Single Input */}
          <TextInput
            style={styles.budgetInput}
            placeholder="Nhập ngân sách (VND)"
            value={budgetValue}
            onChangeText={setBudgetValue}
            keyboardType="numeric"
            blurOnSubmit={false}
          />
          {/* Button */}
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={budgetMode === 'daily' ? handleFilterDaily : generateAndNavigate}
            activeOpacity={0.7} // Giảm opacity khi press để tránh "dấu tích" persist
          >
            <Text style={styles.filterBtnText}>
              {budgetMode === 'daily' ? 'Filter' : 'Generate Kế Hoạch Tuần'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Main FlatList with collapsing category header */}
        <Animated.FlatList
          keyboardShouldPersistTaps="handled"
          data={budgetMode === 'daily' && debouncedBudgetValue ? filteredRecipes : randomRecipes}
          keyExtractor={(item) => `random-${item.id}`}
          showsVerticalScrollIndicator={false}
          numColumns={numColumns}
          getItemLayout={(data, index) => ({
            length: 150,
            offset: 150 * index,
            index,
          })}
          renderItem={renderItem}
          ListHeaderComponent={renderCollapsingCategoryHeader}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: 20 }}
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
    position: "absolute",
    left: 0,
    right: 0,
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
    height: 120,
    minWidth: 80,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    flex: 1,
    margin: 8,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: { width: itemWidth, height: 150 },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    padding: 8,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.3)', // Đen nhạt
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  }, // Bottom left
  priceTag: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    top: 8,
    left: 8, // Kéo sang trái
    backgroundColor: '#E8F5E8', // Xanh lá nhạt
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  }, // Top left, keep only number
  // Budget styles
  budgetContainer: { marginBottom: 20, padding: 10, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  toggleContainer: { flexDirection: 'row', marginBottom: 10 },
  toggleBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, alignItems: 'center' },
  toggleActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  toggleText: { fontSize: 14, color: 'gray' },
  budgetInput: { borderWidth: 1, borderColor: 'gray', padding: 10, borderRadius: 5, marginBottom: 10 },
  filterBtn: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center' },
  filterBtnText: { color: 'white', fontWeight: 'bold' },
  // Collapsing category header
  categoryHeaderContainer: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  scrollContainer: { flex: 1 },
});