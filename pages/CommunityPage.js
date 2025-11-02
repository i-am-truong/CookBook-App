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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import RecipeCard from "../components/RecipeCard";
import CommentModal from "../components/CommentModal";

import INITIAL_DATABASE from "../database.json"; // Dữ liệu mặc định

const STORAGE_KEY = "COOKBOOK_COMMUNITY_DATA"; // Khóa lưu trữ
const CURRENT_USER_ID = "user-a";

// Hàm xử lý việc lưu data vào AsyncStorage
const saveAppData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error("Lỗi khi lưu dữ liệu:", e);
  }
};

// Hàm tìm tên người dùng từ database (Giả lập)
const getCurrentUsername = (data, userId) => {
  const userPost = data.communityPosts.find((post) => post.userId === userId);
  return userPost ? userPost.username : "Người dùng ẩn danh";
};

const CommunityPage = () => {
  // 1. TẠO STATE CHUNG CÓ THỂ THAY ĐỔI
  const [mockDatabase, setMockDatabase] = useState(INITIAL_DATABASE);

  // State con khởi tạo từ mockDatabase (sẽ được thay thế khi load)
  const [posts, setPosts] = useState(
    mockDatabase.communityPosts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
  );
  const [comments, setComments] = useState(mockDatabase.comments);
  const [currentLikes, setCurrentLikes] = useState(mockDatabase.likes);
  const [currentUsername, setCurrentUsername] = useState(
    getCurrentUsername(INITIAL_DATABASE, CURRENT_USER_ID)
  ); // Khởi tạo tên người dùng

  const [searchText, setSearchText] = useState("");
  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [newRecipeDescription, setNewRecipeDescription] = useState("");

  // --- 🚨 XỬ LÝ TẢI DỮ LIỆU KHI KHỞI ĐỘNG (LOAD) ---
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        const loadedData =
          jsonValue != null ? JSON.parse(jsonValue) : INITIAL_DATABASE;

        setMockDatabase(loadedData);

        // Cập nhật các state con từ dữ liệu đã load
        setCurrentUsername(getCurrentUsername(loadedData, CURRENT_USER_ID));
        setPosts(
          loadedData.communityPosts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        setComments(loadedData.comments);
        setCurrentLikes(loadedData.likes);
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
      }
    };
    loadAppData();
  }, []); // Chỉ chạy một lần khi mount

  // --- 💾 XỬ LÝ LƯU DỮ LIỆU KHI STATE THAY ĐỔI (SAVE) ---
  useEffect(() => {
    const appData = {
      ...mockDatabase,
      communityPosts: posts,
      comments: comments,
      likes: currentLikes,
    };
    // 1. Đồng bộ posts, comments, likes về mockDatabase trong state
    setMockDatabase(appData);
    // 2. Lưu mockDatabase đã cập nhật vào AsyncStorage
    saveAppData(appData);
  }, [posts, comments, currentLikes]); // Chạy mỗi khi posts, comments hoặc likes thay đổi

  // --- 4. Xử lý Thêm Comment vào Database Giả lập ---
  const handleAddComment = (postId, newCommentText) => {
    const newComment = {
      id: `cmt-${Date.now()}`,
      postId: postId,
      userId: CURRENT_USER_ID,
      // Dùng TÊN NGƯỜI DÙNG HIỆN TẠI ĐÃ ĐƯỢC LOAD
      username: currentUsername,
      text: newCommentText,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
    );

    return newComment;
  };

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
      username: currentUsername, // Dùng tên người dùng hiện tại
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

  // --- Render Bài Đăng (Giữ nguyên) ---
  const renderItem = ({ item }) => {
    const isLikedByUser = currentLikes.some(
      (like) => like.postId === item.id && like.userId === CURRENT_USER_ID
    );
    const currentCommentsCount = comments.filter(
      (c) => c.postId === item.id
    ).length;

    return (
      <RecipeCard
        post={{ ...item, commentsCount: currentCommentsCount }}
        isLiked={isLikedByUser}
        onLike={handleInteraction.bind(null, "like")}
        onComment={handleInteraction.bind(null, "comment")}
        onFollow={handleInteraction.bind(null, "follow")}
      />
    );
  };

  // Hàm giả lập Refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Khi refresh, tải lại dữ liệu từ state mockDatabase hiện tại
    setPosts(
      mockDatabase.communityPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    );
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [mockDatabase]);

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Thanh Tìm kiếm (Header) --- */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
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
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchText("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#FF6347" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setPostModalVisible(true)}
          style={styles.postButton}
        >
          <Ionicons name="add-circle" size={30} color="#FF6347" />
        </TouchableOpacity>
      </View>

      {/* --- Feed Chính --- */}
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
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
          allComments={comments}
          onCommentSubmit={handleAddComment}
          currentUserId={CURRENT_USER_ID}
          currentUsername={currentUsername} // <- TRUYỀN TÊN ĐÃ ĐƯỢC LOAD
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
    paddingVertical: 10,
  },
  clearButton: {
    marginLeft: 8,
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
