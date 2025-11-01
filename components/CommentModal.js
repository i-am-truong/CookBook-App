import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// CommentItem: Component con để hiển thị từng bình luận
const CommentItem = ({ comment }) => (
  <View style={styles.commentItem}>
    <View style={styles.commentHeader}>
      {/* SỬ DỤNG TÊN NGƯỜI DÙNG ĐỘNG */}
      <Text style={styles.commentUsername}>{comment.username}</Text>
    </View>
    <Text style={styles.commentText}>{comment.text}</Text>
    <Text style={styles.commentTime}>
      {new Date(comment.createdAt).toLocaleTimeString()}
    </Text>
  </View>
);

// Đã cập nhật props: nhận allComments (dữ liệu comments chung) và onCommentSubmit (hàm lưu)
const CommentModal = ({
  postId,
  onClose,
  allComments,
  onCommentSubmit,
  currentUserId,
  currentUsername,
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lọc Comments dựa trên postId từ prop allComments
  useEffect(() => {
    if (postId && allComments) {
      setIsLoading(true);
      const postComments = allComments
        .filter((cmt) => cmt.postId === postId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp mới nhất lên đầu

      setComments(postComments);
      setIsLoading(false);
    }
    // Dependency bao gồm allComments để khi comment mới được thêm, modal sẽ tự động cập nhật
  }, [postId, allComments]);

  // Xử lý Đăng Bình luận Mới (Gọi hàm từ parent để lưu)
  const handlePostComment = () => {
    if (!newComment.trim()) {
      Alert.alert("Lỗi", "Bình luận không được để trống.");
      return;
    }

    // 1. GỌI HÀM TỪ PARENT ĐỂ LƯU VÀO DATABASE GIẢ LẬP (Cập nhật state chung)
    // Hàm này trả về đối tượng comment đã được tạo (có ID và timestamp)
    const savedComment = onCommentSubmit(postId, newComment.trim());

    // 2. Cập nhật state cục bộ (UI) bằng dữ liệu đã lưu
    setComments((prev) => [savedComment, ...prev]);
    setNewComment("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.modalOverlay}
    >
      <View style={styles.modalContainer}>
        {/* Header Modal */}
        <View style={styles.header}>
          <Text style={styles.title}>Bình luận</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Danh sách Comments */}
        {isLoading ? (
          <Text style={styles.loadingText}>Đang tải bình luận...</Text>
        ) : (
          <FlatList
            data={comments}
            renderItem={({ item }) => <CommentItem comment={item} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            // Đảm bảo comment mới nhất nằm ở đầu (không cần inverted)
          />
        )}

        {/* Khung nhập liệu Comment */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Thêm bình luận..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            onPress={handlePostComment}
            style={[
              styles.sendButton,
              { opacity: newComment.trim() ? 1 : 0.5 },
            ]}
            disabled={!newComment.trim()}
          >
            <Ionicons name="send" size={24} color="#FF6347" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    height: "70%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
  },
  commentItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  commentHeader: {
    flexDirection: "row",
    marginBottom: 3,
  },
  commentUsername: {
    fontWeight: "bold",
    marginRight: 8,
    color: "#333",
  },
  commentTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 3,
  },
  commentText: {
    fontSize: 14,
    color: "#555",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    padding: 5,
  },
});

export default CommentModal;
