import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { validateEmail } from "../utils/encryption";

const EditProfile = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState(""); // To track original email
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập',
        'Cần quyền truy cập thư viện ảnh để thay đổi avatar!'
      );
    }
  };

  const loadUserData = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("emailUser");
      const userName = await AsyncStorage.getItem("nameUser");

      if (!userEmail) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng!");
        navigation.goBack();
        return;
      }

      // Load full user data from users array to get avatar
      const storedUsers = await AsyncStorage.getItem("users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const currentUser = users.find((u) => u.email === userEmail);

      setEmail(userEmail);
      setCurrentEmail(userEmail);
      setName(userName || "");
      setAvatar(currentUser?.avatar || null);
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin người dùng!");
    } finally {
      setLoadingData(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh!");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh!");
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Chọn ảnh đại diện",
      "Bạn muốn chọn ảnh từ đâu?",
      [
        {
          text: "Thư viện ảnh",
          onPress: pickImage,
        },
        {
          text: "Chụp ảnh",
          onPress: takePhoto,
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên!");
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert("Lỗi", "Tên phải có ít nhất 2 ký tự!");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      const storedUsers = await AsyncStorage.getItem("users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if new email already exists (and it's not the current user's email)
      if (email !== currentEmail) {
        const emailExists = users.some((u) => u.email === email);
        if (emailExists) {
          Alert.alert("Lỗi", "Email này đã được sử dụng!");
          setLoading(false);
          return;
        }
      }

      // Find and update user
      const userIndex = users.findIndex((u) => u.email === currentEmail);

      if (userIndex === -1) {
        Alert.alert("Lỗi", "Không tìm thấy người dùng!");
        setLoading(false);
        return;
      }

      users[userIndex].name = name.trim();
      users[userIndex].email = email.toLowerCase().trim();
      users[userIndex].avatar = avatar;
      users[userIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem("users", JSON.stringify(users));

      // Update current user info in AsyncStorage
      await AsyncStorage.setItem("nameUser", name.trim());
      await AsyncStorage.setItem("emailUser", email.toLowerCase().trim());

      Alert.alert(
        "Thành công",
        "Thông tin đã được cập nhật!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Lỗi", "Không thể cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={showImageOptions} style={styles.avatarWrapper}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#fff" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Họ và tên</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nhập tên của bạn"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate("ChangePassword")}
          style={styles.changePasswordButton}
        >
          <Ionicons name="key-outline" size={20} color="#4CAF50" />
          <Text style={styles.changePasswordText}>Đổi mật khẩu</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarHint: {
    marginTop: 10,
    color: "#7f8c8d",
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  changePasswordText: {
    flex: 1,
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 10,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default EditProfile;
