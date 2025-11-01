import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// CẬP NHẬT CÚ PHÁP IMPORT ICON CHUẨN CỦA EXPO
import { Ionicons } from "@expo/vector-icons";

import RecipeCard from "../components/RecipeCard";
import CommentModal from "../components/CommentModal";

// SỬA LỖI IMPORT: Nhập trực tiếp file database.json từ thư mục gốc.
import MOCK_DATABASE from "../database.json";

// --- DỮ LIỆU NGƯỜI DÙNG HIỆN TẠI (GIẢ ĐỊNH) ---
const CURRENT_USER_ID = "user-a";

const CommunityPage = () => {
  // State khởi tạo bằng dữ liệu từ MOCK_DATABASE
  const [posts, setPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dữ liệu tạm cho bài đăng mới
  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [newRecipeDescription, setNewRecipeDescription] = useState("");

  // Quản lý trạng thái like (sử dụng dữ liệu likes từ MOCK_DATABASE)
  const [currentLikes, setCurrentLikes] = useState(MOCK_DATABASE.likes);

  // --- 1. Lấy dữ liệu Community Feed ---
  const loadPosts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const sortedPosts = MOCK_DATABASE.communityPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error("Lỗi khi tải bài đăng cộng đồng:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // --- 2. Xử lý Thao tác Tương tác (Like, Comment, Follow) ---
  const handleInteraction = (type, postId, extraData) => {
    switch (type) {
      case "like":
        const hasLiked = currentLikes.some(
          (like) => like.postId === postId && like.userId === CURRENT_USER_ID
        );

        if (hasLiked) {
          setCurrentLikes((prev) =>
            prev.filter(
              (like) =>
                !(like.postId === postId && like.userId === CURRENT_USER_ID)
            )
          );
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likesCount: p.likesCount - 1 } : p
            )
          );
        } else {
          const newLike = {
            id: `like-${Date.now()}`,
            postId,
            userId: CURRENT_USER_ID,
          };
          setCurrentLikes((prev) => [...prev, newLike]);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
            )
          );
        }
        break;
      case "comment":
        setSelectedPostId(postId);
        setCommentModalVisible(true);
        break;
      case "follow":
        Alert.alert(
          "Follow",
          `Đã follow người dùng có ID: ${extraData}! (Chức năng giả lập)`
        );
        break;
    }
  };

  // --- 3. Xử lý Đăng bài Mới (Pop-up Post) ---
  const handlePost = () => {
    if (!newRecipeTitle.trim() || !newRecipeDescription.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Tiêu đề và Mô tả.");
      return;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      userId: CURRENT_USER_ID,
      username: "Người dùng hiện tại",
      avatar: "https://i.pravatar.cc/150?img=7",
      recipeId: null,
      title: newRecipeTitle.trim(),
      description: newRecipeDescription.trim(),
      imageUrl: "https://picsum.photos/id/1020/600/400",
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
    };

    setPosts((prev) => [newPost, ...prev]);

    Alert.alert("Thành công", "Bài đăng cộng đồng đã được đăng!");
    setPostModalVisible(false);
    setNewRecipeTitle("");
    setNewRecipeDescription("");
  };

  // --- Render Bài Đăng ---
  const renderItem = ({ item }) => {
    const isLikedByUser = currentLikes.some(
      (like) => like.postId === item.id && like.userId === CURRENT_USER_ID
    );

    return (
      <RecipeCard
        post={item}
        isLiked={isLikedByUser}
        onLike={handleInteraction.bind(null, "like")}
        onComment={handleInteraction.bind(null, "comment")}
        onFollow={handleInteraction.bind(null, "follow")}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Thanh Tìm kiếm (Search Bar) & Nút Đăng bài --- */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          {/* ICON KÍNH LÚP (Bên trái, màu xám) */}
          <Ionicons
            name="search"
            size={20}
            color="#777"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm công thức, người dùng..."
            placeholderTextColor="#777"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() =>
              Alert.alert("Tìm kiếm", `Tìm kiếm: ${searchText}`)
            }
            returnKeyType="search"
          />
          {/* ICON XÓA (Bên phải, màu đỏ như trong hình) */}
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={styles.clearButton}
            >
              {/* Dùng icon 'close-circle' hoặc 'close' và đặt màu đỏ #FF6347 */}
              <Ionicons name="close-circle" size={20} color="#FF6347" />
            </TouchableOpacity>
          )}
        </View>
        {/* NÚT ĐĂNG BÀI */}
        <TouchableOpacity
          onPress={() => setPostModalVisible(true)}
          style={styles.postButton}
        >
          <Ionicons name="add-circle" size={30} color="#FF6347" />
        </TouchableOpacity>
      </View>

      {/* --- Feed Chính (Giữ nguyên) --- */}
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={loadPosts}
            tintColor="#FF6347"
          />
        }
      />

      {/* --- Modal Đăng bài Mới (Giữ nguyên) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPostModalVisible}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.postModalView}>
            <Text style={styles.modalTitle}>Đăng Bài Mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề bài đăng"
              placeholderTextColor="#999"
              value={newRecipeTitle}
              onChangeText={setNewRecipeTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả và hashtag của bạn..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={newRecipeDescription}
              onChangeText={setNewRecipeDescription}
            />
            <TouchableOpacity style={styles.imagePickerButton}>
              <Ionicons name="image-outline" size={20} color="#FF6347" />
              <Text style={styles.imagePickerText}>Chọn Ảnh/Video</Text>
            </TouchableOpacity>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPostModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handlePost}>
                <Text style={styles.modalButtonText}>Đăng bài</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Modal Comment (Giữ nguyên) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <CommentModal
          postId={selectedPostId}
          onClose={() => setCommentModalVisible(false)}
          MOCK_DATABASE={MOCK_DATABASE}
          currentUserId={CURRENT_USER_ID}
          currentUsername="Người dùng hiện tại"
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 10, // Quan trọng để TextInput nằm giữa
  },
  clearButton: {
    marginLeft: 8, // Khoảng cách nhỏ với TextInput
    padding: 5,
  },
  postButton: {
    padding: 5,
  },
  feedList: {
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  postModalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff0f0",
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF6347",
  },
  imagePickerText: {
    marginLeft: 8,
    color: "#FF6347",
    fontWeight: "bold",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CommunityPage;
