import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ImagePickerComponent = ({ setImageUri, imageUri }) => {
  // Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };

  // Pick image from gallery
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Take photo with camera
  const takePhotoWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity
            style={styles.changeButton}
            onPress={pickImageFromGallery}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.changeButtonText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.pickerContainer}>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={pickImageFromGallery}
          >
            <Ionicons name="images" size={32} color="#4CAF50" />
            <Text style={styles.pickerButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={takePhotoWithCamera}
          >
            <Ionicons name="camera" size={32} color="#4CAF50" />
            <Text style={styles.pickerButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  pickerButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  imagePreview: {
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  changeButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default ImagePickerComponent;
