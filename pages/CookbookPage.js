import { StyleSheet, Text, View, FlatList, ImageBackground, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import database from "../database.json"; 
import { useNavigation } from "@react-navigation/native";


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

  const loadData = () => {
    setMyRecipes(database.myRecipes);
    setSavedRecipes(database.savedRecipes);
  };

  const data = activeTab === "My Recipe" ? myRecipes : savedRecipes;

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}>
      <ImageBackground source={{ uri: item.image }} style={styles.image} imageStyle={{ borderRadius: 16 }}>
        <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,1)"]} style={styles.textContainer}>
          <Text style={styles.title}>{item.name}</Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cookbook</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab("My Recipe")} style={[styles.tabButton, activeTab === "My Recipe" && styles.activeTabButton]}>
          <Text style={[styles.tab, activeTab === "My Recipe" && styles.activeTab]}>✨ My Recipe</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Saved")} style={[styles.tabButton, activeTab === "Saved" && styles.activeTabButton]}>
          <Text style={[styles.tab, activeTab === "Saved" && styles.activeTab]}>🔖 Saved</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
});

export default CookbookPage;
