import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import auth from "../firebase/auth";

export const requestCameraPermissions = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === "granted";
};

export const requestMediaLibraryPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
};

export const takePhoto = async () => {
  const hasPermission = await requestCameraPermissions();
  if (!hasPermission) {
    Alert.alert("Sorry, we need camera permissions to make this work!");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  return result;
};

export const chooseFromGallery = async () => {
  const hasPermission = await requestMediaLibraryPermissions();
  if (!hasPermission) {
    Alert.alert("Sorry, we need camera roll permissions to make this work!");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  return result;
};

export const pickImage = async (index, image, setImage) => {
  Alert.alert("Select Photo", "Choose an option:", [
    {
      text: "Choose From Gallery",
      onPress: async () => {
        const result = await chooseFromGallery();
        if (result && !result.canceled) {
          setImage(result.assets ? result.assets[0].uri : result.uri);
        }
      },
    },
    {
      text: "Cancel",
      style: "cancel",
    },
  ]);
};

const uploadImageBlob = async (blob, path) => {
  const storage = getStorage();
  const storageRef =
    path === "profilePictures"
      ? ref(storage, `${path}/${auth.currentUser.uid}`)
      : ref(storage, `${path}/${auth.currentUser.uid}/${Date.now()}`);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  await uploadTask;
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const uploadImageAsync = async (uri, path) => {
  if (!uri) {
    console.error("No image URI available for upload.");
    return null;
  }

  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      reject(e);
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  try {
    const downloadURL = await uploadImageBlob(blob, path);
    return downloadURL;
  } catch (error) {
    console.error("Upload failed or URL retrieval failed:", error);
    return null;
  } finally {
    if (blob.close) {
      blob.close();
    }
  }
};

export const uploadImagesAsync = async (uris, path) => {
  if (!Array.isArray(uris)) {
    uris = [uris];
  }

  const uploadPromises = uris.map(uri => uploadImageAsync(uri, path));
  const downloadUrls = await Promise.all(uploadPromises);
  return downloadUrls.filter(url => url !== null);
};
