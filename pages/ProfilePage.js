import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ProfilePage = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const nameUser = await AsyncStorage.getItem("nameUser");
        const emailUser = await AsyncStorage.getItem("emailUser");

        if (nameUser && emailUser) {
          setName(nameUser);
          setEmail(emailUser);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Xóa thông tin người dùng đã lưu trong AsyncStorage
      await AsyncStorage.removeItem("emailUser");
      await AsyncStorage.removeItem("nameUser");
      await AsyncStorage.removeItem("passwordUser");

      // Chuyển hướng người dùng về màn hình đăng nhập
      navigation.replace("Login");

      // Thông báo đăng xuất thành công
      Alert.alert("Đăng xuất thành công!");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle-outline" size={100} color="green" />
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}
          onPress={() => navigation.navigate("CreateRecipe")}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.menuText}>Create New Recipe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons
            name="book-outline"
            size={24}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.menuText}>My Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons
            name="search-outline"
            size={24}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.menuText}>Browse More Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color="black"
            style={styles.icon}
          />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  menuText: {
    fontSize: 18,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});

export default ProfilePage;
