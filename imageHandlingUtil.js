import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import auth from './auth'; 

export const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
};

export const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
};

export const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
        Alert.alert('Sorry, we need camera permissions to make this work!');
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
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
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

export const pickImage = async (index, images, setImages) => {
    Alert.alert(
        'Select Photo',
        'Choose an option:',
        [
            {
                text: 'Take Photo',
                onPress: async () => {
                    const result = await takePhoto();
                    if (result && !result.cancelled) {
                        const newImages = [...images];
                        newImages[index] = result.uri;
                        setImages(newImages);
                    }
                }
            },
            {
                text: 'Choose From Gallery',
                onPress: async () => {
                    const result = await chooseFromGallery();
                    if (result && !result.cancelled) {
                        const newImages = [...images];
                        newImages[index] = result.assets ? result.assets[0].uri : result.uri;
                        setImages(newImages);
                        console.log("Set new images from choose: " + (result.assets ? result.assets[0].uri : result.uri));
                    }
                }
            },
            {
                text: 'Cancel',
                style: 'cancel'
            }
        ]
    )
};

const uploadImageBlob = async (blob, path) => {
    const storage = getStorage();
    const storageRef = ref(storage, `${path}/${auth.currentUser.uid}/${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    console.log("successfully uploaded bytes resumable in blob");

    await uploadTask;
    const downloadURL = await getDownloadURL(storageRef);
    console.log("download url after getDownloadUrl - " + downloadURL);
    return downloadURL;
};

export const uploadImageAsync = async (uris, path) => {
    if (!uris || uris.length === 0) {
        console.error("No image URI(s) available for upload.");
        return [];
    }

    const uriArray = Array.isArray(uris) ? uris : [uris];

    const uploadPromises = uriArray.map(async (uri) => {
        console.log("Uploading image with URI:", uri); // Log the URI

        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(e);
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
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
    });

    const downloadUrls = await Promise.all(uploadPromises);
    return downloadUrls.filter(url => url !== null);
};

export const uploadImagesAsync = async (uris, path) => {
    const uploadPromises = uris.map(uri => uploadImageAsync(uri, path));
    const downloadUrls = await Promise.all(uploadPromises);
    return downloadUrls.filter(url => url !== null); 
};