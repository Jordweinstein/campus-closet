import { View, StyleSheet, Text, TouchableOpacity, TextInput,SafeAreaView, Image, Alert } from 'react-native';
import { updateDoc, doc } from "firebase/firestore"; 
import { useState, useEffect } from 'react';
import db from '../db';
import auth from '../auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { uploadImageAsync, pickImage } from '../imageHandlingUtil';

export default function ProfileSetup() {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const defaultProfPic = require('../assets/images/emptyProfile.png');
    const [profilePic, setProfilePic] = useState(defaultProfPic);
    const [phoneNumber, setPhoneNumber] = useState(0);
    const navigation = useNavigation();

    const [isProfileComplete, setIsProfileComplete] = useState(false);

    useEffect(() => {
        const checkProfileCompletion = async () => {
            const profileComplete = await AsyncStorage.getItem('profileComplete');
            setIsProfileComplete(profileComplete === 'true');
        };

        checkProfileCompletion();
    }, []);

    // const pickImage = async () => {
    //     let result = await ImagePicker.launchImageLibraryAsync({
    //       mediaTypes: ImagePicker.MediaTypeOptions.All,
    //       allowsEditing: true,
    //       aspect: [1, 1],
    //       quality: 1,
    //     });
    //     console.log(result);

    //     if (!result.canceled) {
    //         setProfilePic(result.assets[0].uri);
    //         console.log("New profile pic URI:", result.assets[0].uri);
    //     }
    // }

    // const uploadImageAsync = async (uri) => {
    //     if (!uri) {
    //         console.error("No image URI available for upload.");
    //         return null;
    //     }

    //     const blob = await new Promise((resolve, reject) => {
    //         const xhr = new XMLHttpRequest();
    //         xhr.onload = () => {
    //             resolve(xhr.response);
    //         };
    //         xhr.onerror = function(e) {
    //             console.log(e);
    //             reject(e);
    //         };
    //         xhr.responseType = 'blob';
    //         xhr.open('GET', uri, true);
    //         xhr.send(null);
    //     });
    
    //     const storage = getStorage();
    //     const storageRef = ref(storage, 'profilePictures/' + auth.currentUser.uid);
    //     const uploadTask = uploadBytesResumable(storageRef, blob);
    
    //     try {
    //         await uploadTask;
    //         console.log("Image successfully uploaded.");
    //         const downloadURL = await getDownloadURL(storageRef);
    //         return downloadURL;
    //     } catch (error) {
    //         console.error("Upload failed or URL retrieval failed:", error);
    //         return null;
    //     } finally {
    //         if (blob.close) {
    //             blob.close(); 
    //         }
    //     }
    // };

    const handleSubmit = async () => {
        if (!auth.currentUser || !auth.currentUser.uid) {
            console.error("No logged-in user available.");
            return;
        }
        if (!displayName || !bio || !graduationYear || !profilePic || profilePic === defaultProfPic) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        let profilePicUrl;
        if (profilePic) {
            profilePicUrl = await uploadImageAsync([profilePic], 'profilePictures');
        }

        const userRef = doc(db, "users", auth.currentUser?.uid);

        await updateDoc(userRef, {
            displayName: displayName,
            bio: bio,
            graduationYear: graduationYear,
            profilePic: profilePicUrl,
            isProfileComplete: true
        });
        console.log("information uploaded successfully.");
    };

    return (
        <SafeAreaView style= { styles.setupContainer }>
            <Text style= { styles.title }>Welcome to Campus Closet</Text>
            <Text style={{fontSize: 21, paddingVertical: 10}}>Enter your information below: </Text>
            <View style={ styles.inputContainer }>
                <View style={styles.singleInputContainer}>
                    <Text>Name: </Text>
                    <TextInput
                        placeholder = "Jane Doe"
                        style = {styles.input}
                        value = { displayName }
                        onChangeText = { text => setDisplayName(text) }
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.singleInputContainer}>
                    <Text>Phone Number: </Text>
                    <TextInput
                        placeholder='(000) 000 - 0000'
                        style = {styles.input}
                        value = {phoneNumber}
                        onChangeText = { text => setPhoneNumber(text)}
                    />
                </View>
                <View style={styles.singleInputContainer}>
                    <Text>Grad Year: </Text>
                    <TextInput
                        placeholder = "2026"
                        style = {styles.input}
                        value = { graduationYear }
                        onChangeText = { text => setGraduationYear(text) }
                    />
                </View>
                <View style={styles.inputView}>
                    <Text style={{marginTop: 5}}>Bio: </Text>
                    <TextInput
                        placeholder="A fun fact about me is..."
                        value={bio}
                        onChangeText={setBio}
                        multiline={true}
                        style={styles.textInput}
                        maxLength={100}
                    />
                </View>
                
            </View>
            
            <View style={styles.imageView}>
                <Image 
                    source={typeof profilePic === 'string' ? 
                        { uri: profilePic } : 
                        profilePic} 
                    style={styles.profilePic} />
                <TouchableOpacity style={styles.button} onPress={() => pickImage(0, [], setProfilePic)}>
                    <Text style={styles.buttonText}>Upload Profile Picture</Text>
                </TouchableOpacity>
            </View>
            
            <View style= {styles.buttonView}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>
            </View> 

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        fontFamily: 'BebasNeue',
        padding: 15
    },
    input: {
        fontSize: 18,
        padding: 5,
        margin: 3,
        flex: 1
    },
    setupContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#e0edff',
        flex:1,
    },
    inputContainer: {
        width: '90%',
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,

    },
    singleInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#50668a',
        color: 'white',
        padding: 10,
        borderRadius: 15,
        margin: 15,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 100,
        margin: 10
    },
    imageView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',  
    },
    buttonView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#50668a',
        color: 'white',
        padding: 10,
        borderRadius: 15,
    }
})