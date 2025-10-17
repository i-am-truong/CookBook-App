import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Button, Image, StyleSheet, TextInput, View } from 'react-native';

const ImagePickerComponent = ({ setImageUri, setNote, imageUri, note }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Request camera and media library permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  // Handle image selection from camera
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert('Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri; // Get URI of the selected image
      setSelectedImage(uri); // Set selected image URI
      setImageUri(uri); // Pass the URI to the parent component (CreateRecipeScreen)
    }
  };

  // Handle image capture using camera
  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert('Permission to access camera is required!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri; // Get URI of the captured image
      setSelectedImage(uri); // Set selected image URI
      setImageUri(uri); // Pass the URI to the parent component (CreateRecipeScreen)
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from gallery" onPress={pickImageFromGallery} />
      <Button title="Take a photo" onPress={takePhotoWithCamera} />

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.preview} />
          <TextInput
            style={styles.input}
            placeholder="Enter a note..."
            value={note}
            onChangeText={setNote} // Set note for the selected image
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    width: '80%',
    marginTop: 10,
    borderRadius: 5,
  },
});

export default ImagePickerComponent;
