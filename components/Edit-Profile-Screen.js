import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler";
import db from '../db';
import { useNavigation } from "@react-navigation/core";
import auth from '../auth';
import { updateDoc, doc } from "firebase/firestore"; 
import * as ImagePicker from 'expo-image-picker';

export default function EditProfile() {
    const [name, setName] = useState(null);
    const [bio, setBio] = useState(null);
    const [email, setEmail] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [image, setImage] = useState(null);
    const navigation = useNavigation();

    const pickImage = async () => {
        const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];
        const cancelButtonIndex = 2;
    
        Alert.alert(
            'Select Photo',
            'Choose an option:',
            [{
                text: 'Take Photo',
                onPress: () => takePhoto()
            },
            {
                text: 'Choose from Gallery',
                onPress: () => chooseFromGallery()
            },
            {
                text: 'Cancel',
                style: 'cancel'
            }],
        );
    }
    
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }
    
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
    
        if (!result.cancelled) {
            const newImage = result.uri;
            setImage(newImage);
        }
    };
    
    const chooseFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        console.log("result:" + result.uri);
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
            console.log('Image chosen from gallery:', result.assets[0].uri);
            const newImage = result.assets[0].uri;
            setImages(newImage);
        } else {
            console.log('Image selection was canceled or failed');
        }
    };

    const uploadImageAsync = async (uri) => {
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
                console.log(e);
                reject(e);
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });
    
        const storage = getStorage();
        const storageRef = ref(storage, 'profilePictures/' + auth.currentUser.uid);
        const uploadTask = uploadBytesResumable(storageRef, blob);
    
        try {
            await uploadTask;
            console.log("Image successfully uploaded.");
            const downloadURL = await getDownloadURL(storageRef);
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

    const handleSubmit = async () => {
        const updates = {};
        let profilePicUrl = image;
    
        if (image) {
            profilePicUrl = await uploadImageAsync(image);
            updates.profilePic = profilePicUrl;
        }
    
        if (name !== null) updates.displayName = name;
        if (bio !== null) updates.bio = bio;
        if (email !== null) {
            if (email.endsWith('.edu')){ 
                updates.email = email;
            } else {
                Alert.alert("Error", "Email must end in .edu");
                return;
            }
        }
        if (phoneNumber !== null) updates.phoneNumber = phoneNumber;
    
        if (Object.keys(updates).length > 0) {
            const userRef = doc(db, "users", auth.currentUser?.uid);
            await updateDoc(userRef, updates);
            console.log("Information uploaded successfully.");
            navigation.navigate('ProfileMain');
        } else {
            console.log("No changes to save.");
        }
    };

    return (
        <View style={styles.editProfileView}>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.inputView}>
                <Text>Name:  </Text>
                <TextInput
                    placeholder="Jane Doe"
                    value={name}
                    onChangeText={setName} 
                />
            </View>

            <View style={styles.inputView}>
                <Text>Bio:  </Text>
                <TextInput
                    placeholder="A fun fact about me is..."
                    value={bio}
                    onChangeText={setBio}
                />
            </View>

            <View style={styles.inputView}>
                <Text>Email:  </Text>
                <TextInput
                    placeholder="example@unc.edu"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            
            <View style={styles.inputView}>
                <Text>Phone Number:  </Text>
                <TextInput
                    placeholder="123 456 7890"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={10}
                /> 
            </View>
            <View style={styles.pictureInputView}>
                <Text>Profile Picture:  </Text>
                <TouchableOpacity 
                    style={ styles.uploadImageButton }
                    onPress={ pickImage }
                >
                    <Text>Upload Image</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={{ color: 'white', fontWeight: '500' }}>Submit Changes</Text>
            </TouchableOpacity>
        </View>
        
    )
}

const styles = StyleSheet.create({
    editProfileView: {
        alignItems: 'center',
        padding: 10,
    },
    title: {
        fontSize: 24,
        margin: 10,
    },
    inputView: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        width: '95%',
        margin: 5,
        borderRadius: 10,
    },
    pictureInputView: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        width: '95%',
        margin: 5,
        borderRadius: 10,
        justifyContent: 'space-between',
    },
    uploadImageButton: {
        marginHorizontal: 20,
        backgroundColor: '#e3e3e3',
        padding: 5,
        borderRadius: 7,
    },
    submitButton: {
        marginTop: '25%',
        backgroundColor: 'navy',
        padding: 15,
        borderRadius: 10,
    }
})