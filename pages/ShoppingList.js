import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import { useShoppingList } from "../context/ShoppingListContext";

export default function ShoppingList() {
  const { items, toggleBought, clearBought, removeByRecipeTitle } = useShoppingList();


  // Gom nhóm theo món ăn
  const grouped = items.reduce((acc, item) => {
    const title = item.recipeTitle || "Nguyên liệu khác";
    if (!acc[title]) acc[title] = [];
    acc[title].push(item);
    return acc;
  }, {});

  const recipes = Object.keys(grouped);

  // Hàm chia sẻ từng nhóm nguyên liệu
  const shareList = async (title, ingredients) => {
    const message = `🧑‍🍳 *${title}*\n\n${ingredients
      .map(
        (i) =>
          `${i.bought ? "✅" : "⬜️"} ${i.name}${
            i.quantity ? ` (${i.quantity} ${i.unit || ""})` : ""
          }`
      )
      .join("\n")}`;
    await Share.share({ message });
  };

  // Hàm xóa toàn bộ thực đơn (theo title)
  // Hàm xóa toàn bộ thực đơn (theo title) — gọi context
const deleteRecipe = (title) => {
  Alert.alert("Xác nhận", `Xóa toàn bộ thực đơn "${title}"?`, [
    { text: "Hủy", style: "cancel" },
    {
      text: "Xóa",
      style: "destructive",
      onPress: () => {
        removeByRecipeTitle(title);
      },
    },
  ]);
};


  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.empty}>
          Empty list — Add ingredients from recipe.
        </Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(title) => title}
          renderItem={({ item: title }) => (
            <View style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>{title}</Text>

              {grouped[title].map((ingredient) => (
                <View
                  key={ingredient.id}
                  style={[
                    styles.item,
                    ingredient.bought && styles.itemBought,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => toggleBought(ingredient.id)}
                    style={styles.checkbox}
                  >
                    <Text style={styles.checkboxText}>
                      {ingredient.bought ? "✅" : "⬜️"}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.itemText,
                      ingredient.bought && styles.textBought,
                    ]}
                  >
                    {ingredient.name}
                    {ingredient.quantity
                      ? ` (${ingredient.quantity} ${ingredient.unit || ""})`
                      : ""}
                  </Text>
                </View>
              ))}

              {/* Hai nút ở cuối thẻ */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.shareBtn]}
                  onPress={() => shareList(title, grouped[title])}
                >
                  <Text style={styles.actionText}>SHARE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => deleteRecipe(title)}
                >
                  <Text style={styles.actionText}>REMOVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {items.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert("Xác nhận", "Bạn có chắc muốn xóa các mục đã mua?", [
              { text: "Hủy", style: "cancel" },
              { text: "Xóa", onPress: clearBought },
            ]);
          }}
        >
          <Text style={styles.clearButtonText}>DELETE PURCHASES</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  empty: {
    textAlign: "center",
    color: "#555",
    marginTop: 40,
  },
  recipeCard: {
    backgroundColor: "#f8f9ff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 4,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  itemText: {
    flex: 1,
    color: "#333",
  },
  itemBought: {
    backgroundColor: "#e6e6e6",
  },
  textBought: {
    textDecorationLine: "line-through",
    color: "#777",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  shareBtn: {
    backgroundColor: "#5550F2",
  },
  deleteBtn: {
    backgroundColor: "#FF5252",
  },
  actionText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
  clearButton: {
    backgroundColor: "#ff4d4d",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  clearButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
