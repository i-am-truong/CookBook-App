import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
// CẬP NHẬT CÚ PHÁP IMPORT ICON CHUẨN CỦA EXPO
import { Ionicons } from "@expo/vector-icons";

// Thẻ hiển thị một bài đăng trong Community Feed
const RecipeCard = ({ post, onLike, onComment, onFollow, isLiked }) => {
  // Sử dụng post (một item trong communityPosts) thay vì recipe
  const {
    id,
    username,
    avatar,
    imageUrl,
    title,
    description,
    likesCount,
    commentsCount,
  } = post;

  // Hàm loại bỏ các ký tự unicode/emoji bị lỗi hiển thị
  const cleanDescription = (text) => {
    // Giữ lại chữ cái (có hỗ trợ tiếng Việt), số, khoảng trắng và dấu câu cơ bản.
    return text.replace(
      /[^a-zA-Z0-9\s\.\,\!\?àáạãảăằắặẳẵâầấậẩẫèéẹẽẻêềếệểễđìíịỉĩòóọõỏôồốộổỗơờớợởỡùúụũủưừứựửữýỳỹỷỵ\n]/g,
      ""
    );
  };

  return (
    <View style={styles.card}>
      {/* Header: Người đăng và nút Follow */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <Text style={styles.username}>{username}</Text>

        {/* Nút Follow */}
        <TouchableOpacity
          onPress={() => onFollow(post.userId)}
          style={styles.followButton}
        >
          <Text style={styles.followText}>Follow</Text>
        </TouchableOpacity>
      </View>

      {/* Image */}
      <Image source={{ uri: imageUrl }} style={styles.postImage} />

      {/* Interactions BAR */}
      <View style={styles.interactionBar}>
        {/* Icon LIKE */}
        <TouchableOpacity onPress={() => onLike(id)} style={styles.iconButton}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "#FF6347" : "#333"}
          />
        </TouchableOpacity>
        {/* Icon COMMENT */}
        <TouchableOpacity
          onPress={() => onComment(id)}
          style={styles.iconButton}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#333" />
        </TouchableOpacity>
        {/* Icon SHARE */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="send-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Likes and Description */}
      <View style={styles.details}>
        {/* Số Like */}
        <Text style={styles.likesText}>
          <Text style={{ fontWeight: "bold" }}>{likesCount}</Text> likes
        </Text>
        {/* TIÊU ĐỀ và MÔ TẢ ĐÃ LỌC */}
        <Text style={styles.postTitle}>{title}</Text> {/* Title ở đây */}
        <Text style={styles.descriptionText}>
          <Text style={styles.username}>{username}</Text>
          <Text style={{ fontWeight: "normal", color: "#555" }}>
            {" "}
            {cleanDescription(description)}
          </Text>
        </Text>
        {commentsCount > 0 && (
          <TouchableOpacity onPress={() => onComment(id)}>
            <Text style={styles.viewCommentsText}>
              View all {commentsCount} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  username: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  followButton: {
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FF6347",
  },
  followText: {
    color: "#FF6347",
    fontWeight: "bold",
    fontSize: 12,
  },
  postImage: {
    width: "100%",
    height: 350, // Kích thước cố định cho hình ảnh feed
  },
  postTitle: {
    // Đã sửa lại để Title nằm trong body, không phải trên cùng
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingTop: 5,
    color: "#333",
  },
  interactionBar: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
    // Dời Title xuống dưới Interaction Bar để giống Instagram hơn
  },
  iconButton: {
    marginRight: 15,
  },
  details: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  likesText: {
    fontWeight: "normal",
    marginBottom: 5,
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    lineHeight: 20,
  },
  viewCommentsText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
});

export default RecipeCard;
