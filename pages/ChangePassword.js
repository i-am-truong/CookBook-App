import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { 
  verifyPassword, 
  hashPassword, 
  validatePassword 
} from "../utils/encryption";

const ChangePassword = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert("Lỗi", passwordValidation.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới phải khác mật khẩu cũ!");
      return;
    }

    setLoading(true);

    try {
      const userEmail = await AsyncStorage.getItem("emailUser");

      if (!userEmail) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng!");
        setLoading(false);
        return;
      }

      const storedUsers = await AsyncStorage.getItem("users");
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const userIndex = users.findIndex((u) => u.email === userEmail);

      if (userIndex === -1) {
        Alert.alert("Lỗi", "Không tìm thấy người dùng!");
        setLoading(false);
        return;
      }

      const user = users[userIndex];

      // Verify current password - support both hashed and plain text
      const isCurrentPasswordValid = user.password.length === 64
        ? verifyPassword(currentPassword, user.password)
        : currentPassword === user.password;

      if (!isCurrentPasswordValid) {
        Alert.alert("Lỗi", "Mật khẩu hiện tại không đúng!");
        setLoading(false);
        return;
      }

      // Hash new password
      const hashedPassword = hashPassword(newPassword);
      users[userIndex].password = hashedPassword;
      users[userIndex].updatedAt = new Date().toISOString();

      await AsyncStorage.setItem("users", JSON.stringify(users));

      Alert.alert(
        "Thành công",
        "Mật khẩu đã được thay đổi!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Lỗi", "Không thể thay đổi mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={50} color="#4CAF50" />
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Mật khẩu hiện tại</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Mật khẩu mới</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu mới:</Text>
          <Text style={styles.requirementText}>• Tối thiểu 6 ký tự</Text>
          <Text style={styles.requirementText}>• Bao gồm chữ và số</Text>
          <Text style={styles.requirementText}>• Phải khác mật khẩu cũ</Text>
        </View>

        <TouchableOpacity 
          onPress={handleChangePassword} 
          style={[styles.changeButton, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={24} color="#fff" />
              <Text style={styles.changeButtonText}>Đổi mật khẩu</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại lần sau.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  iconContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
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
  eyeIcon: {
    padding: 5,
  },
  passwordRequirements: {
    backgroundColor: "#e8f5e9",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  changeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
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
  changeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#1976D2",
    lineHeight: 20,
  },
});

export default ChangePassword;
