import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProfilePage = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);

  const fetchUserData = async () => {
    try {
      const nameUser = await AsyncStorage.getItem("nameUser");
      const emailUser = await AsyncStorage.getItem("emailUser");

      if (nameUser && emailUser) {
        setName(nameUser);
        setEmail(emailUser);

        // Get avatar from users array
        const storedUsers = await AsyncStorage.getItem("users");
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        const currentUser = users.find((u) => u.email === emailUser);
        setAvatar(currentUser?.avatar || null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Reload user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // Xóa thông tin người dùng đã lưu trong AsyncStorage
            await AsyncStorage.removeItem("emailUser");
            await AsyncStorage.removeItem("nameUser");
            await AsyncStorage.removeItem("userId");

            // Chuyển hướng người dùng về màn hình đăng nhập
            navigation.replace("Login");
          } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            Alert.alert(
              "Lỗi",
              "Đã xảy ra lỗi khi đăng xuất. Vui lòng thử lại."
            );
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.avatarContainer}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Công thức của tôi</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("CreateRecipe")}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.menuText}>Tạo công thức mới</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.jumpTo("Cookbook")}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="book-outline" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.menuText}>Công thức đã lưu</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            navigation.navigate("ShoppingList", { from: "Profile" })
          }
        >
          <Ionicons
            name="cart-outline"
            size={24}
            color="#4CAF50"
            style={styles.icon}
          />
          <Text style={styles.menuText}>    Danh sách mua sắm</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.jumpTo("Explore")}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="search-outline" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.menuText}>Khám phá công thức</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Tài khoản</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="person-outline" size={24} color="#2196F3" />
          </View>
          <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="key-outline" size={24} color="#2196F3" />
          </View>
          <Text style={styles.menuText}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="log-out-outline" size={24} color="#FF5252" />
          </View>
          <Text style={[styles.menuText, styles.logoutText]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 40,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 5,
  },
  menuContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
    fontWeight: "500",
  },
  logoutItem: {
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: "#FF5252",
  },
});

export default ProfilePage;
