import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  Alert,
  SafeAreaView,
} from "react-native";

// --- DỮ LIỆU GIẢ ĐÃ BỊ XÓA ---
// Dữ liệu thật sẽ được tải từ API
const DAYS_OF_WEEK = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];
const MEAL_TYPES = ["Sáng", "Trưa", "Tối"];
// Ánh xạ giữa UI (Tiếng Việt) và Database (Tiếng Anh)
const categoryMap = {
  Sáng: "Breakfast",
  Trưa: "Lunch",
  Tối: "Dinner",
};
// (Bạn có thể thêm các category khác vào đây nếu cần, vd: 'Healthy', 'Fastfood')

// Hàm tạo kế hoạch trống ban đầu
const createEmptyPlan = () => {
  let plan = {};
  DAYS_OF_WEEK.forEach((day) => {
    plan[day] = {};
    MEAL_TYPES.forEach((meal) => {
      plan[day][meal] = null; // null nghĩa là chưa có món ăn
    });
  });
  return plan;
};

export default function MealPlannerPage({ route, navigation }) {
  const [plan, setPlan] = useState(createEmptyPlan());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState({ day: "", meal: "" });
  const [recipes, setRecipes] = useState([]); // Danh sách công thức
  // Budget Buddy
  const [generatedPlan, setGeneratedPlan] = useState(null);  // Generated weekly plan
  const [totalWeeklyCost, setTotalWeeklyCost] = useState(0);  // Total cost
  const [leftoverSuggestions, setLeftoverSuggestions] = useState([]);  // Leftover

  const { weeklyBudget: propWeeklyBudget, recipes: propRecipes } = route.params || {};  // Từ Home

  // *** THAY ĐỔI: Tải dữ liệu thật từ API ***
  useEffect(() => {
    const fetchRecipes = async () => {
      const API_URL = process.env.API_URL;
      if (!API_URL) {
        Alert.alert(
          "Lỗi cấu hình",
          "Không tìm thấy API_URL. Vui lòng kiểm tra file .env"
        );
        return;
      }
      try {
        // Dùng API_URL từ .env và endpoint /recipes từ db.json
        const response = await fetch(`${API_URL}/recipes`);
        if (!response.ok) {
          throw new Error(`Lỗi mạng! Status: ${response.status}`);
        }
        const data = await response.json();
        // Fallback estimated_cost
        const processed = data.map(r => ({
          ...r,
          estimated_cost: r.estimated_cost || (r.ingredients.reduce((sum, i) => sum + (i.price || 10000), 0) / r.servings)
        }));
        setRecipes(processed); // Cập nhật state với dữ liệu thật
      } catch (error) {
        console.error("Lỗi khi tải công thức:", error);
        Alert.alert(
          "Lỗi",
          "Không thể tải công thức từ server. Hãy đảm bảo server đang chạy và IP đã đúng."
        );
      }
    };
    fetchRecipes();
  }, []); // Chỉ chạy 1 lần khi component mở

  // Auto-generate nếu có propWeeklyBudget
  useEffect(() => {
    if (propWeeklyBudget && recipes.length > 0) {
      generateWeeklyPlan(propWeeklyBudget);
    }
  }, [propWeeklyBudget, recipes]);

  // Mở Modal để chọn công thức
  const handleOpenModal = (day, meal) => {
    setSelectedSlot({ day, meal });
    setIsModalVisible(true);
  };
  // Đóng Modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };
  // Chọn một công thức từ Modal
  const handleSelectRecipe = (recipe) => {
    const { day, meal } = selectedSlot;
    setPlan((prevPlan) => ({
      ...prevPlan,
      [day]: {
        ...prevPlan[day],
        [meal]: recipe,
      },
    }));
    handleCloseModal();
  };
  // Xóa công thức khỏi một bữa
  const handleRemoveRecipe = (day, meal) => {
    setPlan((prevPlan) => ({
      ...prevPlan,
      [day]: {
        ...prevPlan[day],
        [meal]: null,
      },
    }));
  };
  // Tính tổng calo cho một ngày
  const calculateDailyCalories = (day) => {
    let total = 0;
    MEAL_TYPES.forEach((meal) => {
      if (plan[day][meal]) {
        total += plan[day][meal].calories;
      }
    });
    return total;
  };
  // THÊM: Tính tổng giá cho một ngày
  const calculateDailyPrice = (day) => {
    let total = 0;
    MEAL_TYPES.forEach((meal) => {
      if (plan[day][meal]) {
        total += plan[day][meal].estimated_cost || 0;
      }
    });
    return Math.round(total);
  };
  // TẠO KẾ HOẠCH NGẪU NHIÊN
  const handleGenerateRandomPlan = () => {
    if (recipes.length === 0) {
      Alert.alert("Lỗi", "Không có công thức nào để tạo ngẫu nhiên");
      return;
    }
    let newPlan = {};
    DAYS_OF_WEEK.forEach((day) => {
      newPlan[day] = {};
      MEAL_TYPES.forEach((meal) => {
        // *** THAY ĐỔI: Dùng categoryMap để lọc ***
        const dbCategory = categoryMap[meal]; // Chuyển 'Sáng' -> 'Breakfast'
        const recipesInCategory = recipes.filter(
          (r) => r.category === dbCategory
        );
        let randomRecipe = null;
        if (recipesInCategory.length > 0) {
          randomRecipe =
            recipesInCategory[
              Math.floor(Math.random() * recipesInCategory.length)
            ];
        }
        newPlan[day][meal] = randomRecipe;
      });
    });
    setPlan(newPlan);
    Alert.alert("Thành công", "Đã tạo kế hoạch ngẫu nhiên cho tuần!");
  };
  // XUẤT SHOPPING LIST
  const handleGenerateShoppingList = () => {
    const ingredientMap = new Map();
    // Lặp qua toàn bộ kế hoạch
    DAYS_OF_WEEK.forEach((day) => {
      MEAL_TYPES.forEach((meal) => {
        const recipe = plan[day][meal];
        if (recipe && recipe.ingredients) {
          // Kiểm tra có ingredients không
          // Lặp qua các nguyên liệu của công thức
          recipe.ingredients.forEach((ingredient) => {
            const key = ingredient.name.toLowerCase(); // Chuẩn hóa tên
            if (ingredientMap.has(key)) {
              // (Logic gộp số lượng phức tạp, tạm thời chỉ liệt kê)
            } else {
              ingredientMap.set(key, ingredient.amount);
            }
          });
        }
      });
    });
    if (ingredientMap.size === 0) {
      Alert.alert("Shopping List", "Kế hoạch của bạn đang trống!");
      return;
    }
    // Chuyển Map thành chuỗi
    let listString = "Nguyên liệu cần mua:\n\n";
    ingredientMap.forEach((amount, name) => {
      listString += `• ${name.charAt(0).toUpperCase() + name.slice(1)}: ${amount}\n`;
    });
    Alert.alert("Shopping List", listString);
  };
  // TÍNH NĂNG 1: Generate Weekly Plan (keep, with alert navigate home)
  const generateWeeklyPlan = (budgetNum) => {
    if (!budgetNum || budgetNum <= 0) return;

    // Cảnh báo nếu quá thấp, keep navigate to home
    if (budgetNum < 300000) {
      Alert.alert(
        "Ngân sách quá thấp!",
        "Gợi ý tối thiểu 300000 VND/tuần để có kế hoạch hợp lý (~43k/ngày). Nhập lại?",
        [
          { text: "Hủy", style: 'cancel' },
          { text: "Nhập lại", onPress: () => {
            navigation.navigate('Home');  // Navigate to Home
            // Keep mode weekly (handled in Home toggle)
          } },
        ]
      );
      return;
    }

    const dailyBudget = budgetNum / 7;  // Chia đều 7 ngày
    const vietRecipes = recipes.filter(r => r.category === 'Việt' || r.category.includes('Việt'));  // Ưu tiên 70% Việt rẻ
    const nonViet = recipes.filter(r => !r.category.includes('Việt'));
    const newPlan = {};
    let totalCost = 0;
    let allIngredients = new Set();

    DAYS_OF_WEEK.forEach((day) => {
      newPlan[day] = {};
      MEAL_TYPES.forEach((meal) => {
        // Filter per meal <= daily / 3
        let candidates = [...vietRecipes, ...nonViet].filter(r => r.estimated_cost <= dailyBudget / 3);
        if (candidates.length === 0) candidates = recipes.filter(r => r.estimated_cost <= (dailyBudget / 3) * 1.2);
        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        newPlan[day][meal] = selected;
        totalCost += selected.estimated_cost;
        selected.ingredients.forEach(ing => allIngredients.add(ing.name));
      });
    });

    // Leftover
    const leftover = Array.from(allIngredients).filter(ing =>
      recipes.filter(r => r.ingredients.some(i => i.name === ing)).length > recipes.length * 0.5
    );

    setPlan(newPlan);
    setTotalWeeklyCost(totalCost);
    setLeftoverSuggestions(leftover);
    setGeneratedPlan(newPlan);

    Alert.alert("Thành công", `Kế hoạch tuần sẵn sàng! Tổng chi phí: ${Math.round(totalCost)} VND (ngân sách: ${budgetNum} VND)`);
  };

  // Render một ô bữa ăn (Sáng, Trưa, Tối)
  const renderMealSlot = (day, meal) => {
    const recipe = plan[day][meal];
    if (recipe) {
      // Đã có công thức
      return (
        <TouchableOpacity
          style={styles.mealSlotFilled}
          onPress={() => handleOpenModal(day, meal)} // Cho phép đổi món
        >
          <Text style={styles.mealName}>{recipe.name}</Text>
          <Text style={styles.mealCalories}>{recipe.calories} kcal</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveRecipe(day, meal)}
          >
            <Text style={styles.removeButtonText}>X</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else {
      // Ô trống, hiện nút "+"
      return (
        <TouchableOpacity
          style={styles.mealSlotEmpty}
          onPress={() => handleOpenModal(day, meal)}
        >
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>Thêm {meal}</Text>
        </TouchableOpacity>
      );
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.headerTitle}>Kế Hoạch Bữa Ăn</Text>
        {/* Nút chức năng */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonRandom]}
            onPress={handleGenerateRandomPlan}
          >
            <Text style={styles.buttonText}>Tạo Plan Ngẫu Nhiên</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonShopping]}
            onPress={handleGenerateShoppingList}
          >
            <Text style={styles.buttonText}>Xuất Shopping List</Text>
          </TouchableOpacity>
        </View>
        {/* Danh sách các ngày */}
        {DAYS_OF_WEEK.map((day) => (
          <View key={day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{day}</Text>
              <Text style={styles.dayCalories}>
                Tổng: {calculateDailyCalories(day)} kcal
              </Text>
              {/* Keep "Giá: VNĐ" right of calories */}
              <Text style={styles.dayPrice}>
                Giá: {calculateDailyPrice(day)} VNĐ
              </Text>
            </View>
            <View style={styles.mealsContainer}>
              {MEAL_TYPES.map((meal) => (
                <View key={meal} style={styles.mealSlotWrapper}>
                  {renderMealSlot(day, meal)}
                </View>
              ))}
            </View>
          </View>
        ))}
        {/* Leftover */}
        {leftoverSuggestions.length > 0 && (
          <View style={styles.leftoverContainer}>
            <Text style={styles.leftoverTitle}>Gợi Ý Tái Sử Dụng: {leftoverSuggestions.join(', ')}</Text>
          </View>
        )}
      </ScrollView>
      {/* Modal chọn công thức */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Chọn món cho {selectedSlot.meal} - {selectedSlot.day}
            </Text>
            <ScrollView>
              {/* *** THAY ĐỔI: Dùng categoryMap để lọc *** */}
              {recipes
                .filter((r) => r.category === categoryMap[selectedSlot.meal]) // Lọc 'Sáng' -> 'Breakfast'
                .map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeItem}
                    onPress={() => handleSelectRecipe(recipe)}
                  >
                    <Text style={styles.recipeItemName}>{recipe.name}</Text>
                    <Text>{recipe.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              {/* *** THAY ĐỔI: Dùng categoryMap để lọc *** */}
              {recipes.filter(
                (r) => r.category === categoryMap[selectedSlot.meal]
              ).length === 0 && (
                <Text style={styles.noRecipeText}>
                  Không có công thức nào cho bữa {selectedSlot.meal}
                </Text>
              )}
            </ScrollView>
            <Button title="Đóng" onPress={handleCloseModal} color="#FF3B30" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F8",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonRandom: {
    backgroundColor: "#007AFF",
  },
  buttonShopping: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  dayCalories: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
  },
  dayPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",  // Green for price
  },
  mealsContainer: {
    padding: 10,
  },
  mealSlotWrapper: {
    marginBottom: 10,
  },
  mealSlotEmpty: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  addIcon: {
    fontSize: 24,
    color: "#007AFF",
    marginRight: 10,
  },
  addText: {
    fontSize: 16,
    color: "#888",
  },
  mealSlotFilled: {
    backgroundColor: "#E6F7FF",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#B0E0FF",
  },
  mealName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#005691",
  },
  mealCalories: {
    fontSize: 13,
    color: "#005691",
    marginTop: 4,
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFDEDE",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FF3B30",
    fontWeight: "bold",
    fontSize: 14,
  },
  // Kiểu cho Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  recipeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  recipeItemName: {
    fontSize: 16,
  },
  noRecipeText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
  },
  // Leftover style
  leftoverContainer: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  leftoverTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
});