import React, { useState, useContext } from 'react';
import { View, StyleSheet, Keyboard, Text, TouchableOpacity, Modal, TextInput, SafeAreaView, KeyboardAvoidingView, Image, Alert, ActivityIndicator } from 'react-native';
import { updateDoc, doc } from "firebase/firestore"; 
import db from '../firebase/db';
import auth from '../firebase/auth';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { uploadImageAsync, pickImage } from '../util/imageHandling';
import { AuthContext } from '../contexts/authContext';

export default function ProfileSetup() {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const defaultProfPic = require('../assets/images/emptyProfile.png');
    const [profilePic, setProfilePic] = useState(defaultProfPic);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [insta, setInsta] = useState('');
    const [isQuestionVisible, setIsQuestionVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { user, setIsProfileComplete } = useContext(AuthContext);

    const handleSubmit = async () => {
        console.log("handleSubmit called");
        
        if (!auth.currentUser || !auth.currentUser.uid) {
            console.error("No logged-in user available.");
            return;
        }
        
        if (!displayName || !insta || !graduationYear || !profilePic || profilePic === defaultProfPic) {
            Alert.alert("Error", "Please fill in all required fields.");
            console.log("Required fields missing. displayName:", displayName, "insta:", insta, "graduationYear:", graduationYear, "profilePic:", profilePic);
            return;
        }
        
        if (phoneNumber.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            console.log("Invalid phone number:", phoneNumber);
            return;
        }
    
        setLoading(true);
        console.log("Loading set to true");
    
        let profilePicUrl;
    
        if (profilePic && profilePic !== defaultProfPic) {
            try {
                console.log("Uploading profile picture...");
                profilePicUrl = await uploadImageAsync(profilePic, 'profilePictures');
                console.log("Profile picture uploaded, URL:", profilePicUrl);
            } catch (error) {
                console.log("Error uploading profile picture:", error);
                setLoading(false); 
                return; 
            }
        } else {
            console.log("No profile picture to upload");
        }
    
        try {
            console.log("Updating Firestore with user data...");
            const userRef = doc(db, "users", user.uid);
    
            await updateDoc(userRef, {
                displayName: displayName,
                bio: bio,
                graduationYear: graduationYear,
                profilePic: profilePicUrl,
                phoneNumber: phoneNumber,
                isProfileComplete: true,
                insta: insta
            });
            console.log("Profile updated successfully in Firestore");
    
            Alert.alert("Success", "Profile updated successfully.");
            setIsProfileComplete(true);
            console.log("Navigating to Home...");
            navigation.navigate('Home');
        } catch (error) {
            console.log("Error updating profile in Firestore:", error);
        } finally {
            console.log("Setting loading to false");
            setLoading(false); 
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#50668a" />
                <Text>Updating Profile...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.setupContainer}>
            <KeyboardAvoidingView
                style={{ flex: 1, width: '100%', alignItems: 'center'}}
                behavior="padding"
                keyboardVerticalOffset={0}
            >
                <Text style={styles.title}>Welcome to Campus Closet</Text>
                <Text style={{ fontSize: 21, paddingVertical: 10, fontFamily: 'optima' }}>Enter your information below:</Text>
                <View style={styles.inputContainer}>
                    <View style={styles.singleInputContainer}>
                        <Text style={{fontFamily: 'optima'}}>Name: </Text>
                        <TextInput
                            placeholder="Jane Doe"
                            style={styles.input}
                            value={displayName}
                            keyboardType='default'
                            onChangeText={text => setDisplayName(text)}
                            autoCapitalize="words"
                            multiline={false}
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.singleInputContainer}>
                        <Text style={{fontFamily: 'optima'}}>Phone Number: </Text>
                        <TextInput
                            placeholder='(000) 000 - 0000'
                            style={styles.input}
                            value={phoneNumber}
                            maxLength={10}
                            keyboardType='phone-pad'
                            onChangeText={text => setPhoneNumber(text)}
                            returnKeyType="done"
                            onSubmitEditing={() => Keyboard.dismiss()}
                        />
                    </View>
                    <View style={styles.singleInputContainer}>
                        <Text style={{fontFamily: 'optima'}}>Grad Year: </Text>
                        <TextInput
                            placeholder="2026"
                            style={styles.input}
                            value={graduationYear}
                            maxLength={4}
                            keyboardType='number-pad'
                            onChangeText={text => setGraduationYear(text)}
                        />
                    </View>
                    <View style={styles.singleInputContainer}>
                        <Text style={{fontFamily: 'optima'}}>Instagram Handle: </Text>
                        <TextInput
                            placeholder="campuscloset"
                            style={styles.input}
                            value={insta}
                            keyboardType='default'
                            onChangeText={text => setInsta(text)}
                            
                        />
                        <TouchableOpacity onPress={() => setIsQuestionVisible(true)}>
                            <AntDesign name="questioncircle" size={20} color="grey" />
                        </TouchableOpacity>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={isQuestionVisible}
                            onRequestClose={() => setIsQuestionVisible(false)}
                        >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Why do you need my Instagram Handle?</Text>
                            <Text style={styles.modalItemText}>In it's first phase, Campus Closets will depend upon third-party applications such as Instagram to provide an outlet for communication between users. </Text>
                            <Text style={styles.modalItemText}>Once you accept/send an offer, the sender/seller will be given your Instagram account. This is highlighted in the terms and conditions, which you agree to upon registration for Campus Closets. </Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setIsQuestionVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                            </View>
                            
                        </View>
                        </Modal>
                        
                    </View>
                    <View style={styles.singleInputContainer}>
                        <Text style={{ marginTop: 13, fontFamily: 'optima', alignSelf: 'flex-start' }}>Bio: </Text>
                        <TextInput
                            placeholder="A fun fact about me is..."
                            value={bio}
                            onChangeText={setBio}
                            multiline={true} 
                            style={[styles.input, styles.bioInput]}
                            maxLength={100}
                            returnKeyType="done"
                            blurOnSubmit={true} 
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Enter') {
                                    Keyboard.dismiss();
                                    return false;
                                }
                            }}
                        />
                    </View>
                </View>

                <View style={styles.imageView}>
                    <Image
                        source={typeof profilePic === 'string' ?
                            { uri: profilePic } :
                            profilePic}
                        style={styles.profilePic} />
                    <TouchableOpacity style={styles.button} onPress={() => pickImage(0, profilePic, setProfilePic)}>
                        <Text style={styles.buttonText}>Upload Profile Picture</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonView}>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.buttonText}>Update Profile</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        fontFamily: 'BebasNeue',
        padding: 15
    },
    bioInput: {
        height: 65,
    },
    input: {
        fontSize: 16,
        padding: 5,
        paddingBottom: 11,
        margin: 3,
        fontFamily: 'optima',
        flex: 1,
        lineHeight: 25,
    },
    setupContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#e0edff',
        flex: 1,
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
        fontFamily: 'optima',
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0edff',
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 20,
        alignItems: "center",
        maxHeight: "70%"
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
        fontFamily: "optima"
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc"
    },
    modalItemText: {
        fontSize: 16,
        fontFamily: "optima",
        paddingBottom: 10,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#50668a",
        borderRadius: 8
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "optima"
    }
});
