import { View, StyleSheet, Text, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Image, Alert } from 'react-native';
import { updateDoc, doc } from "firebase/firestore"; 
import { useState, useEffect, useCallback, useContext } from 'react';
import db from '../firebase/db';
import auth from '../firebase/auth';
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
    const navigation = useNavigation();
    const { user, setIsProfileComplete} = useContext(AuthContext);

    const handleSubmit = async () => {
        if (!auth.currentUser || !auth.currentUser.uid) {
            console.error("No logged-in user available.");
            return;
        }
        if (!displayName || !bio || !graduationYear || !profilePic || profilePic === defaultProfPic) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (phoneNumber.length !== 10) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number");
            return;
        }

        let profilePicUrl;

        if (profilePic && profilePic !== defaultProfPic) {
            try {
                profilePicUrl = await uploadImageAsync(profilePic, 'profilePictures');
            } catch (error) {
                console.log(error);
                return; 
            }
        }

        try {
            const userRef = doc(db, "users", user.uid);

            await updateDoc(userRef, {
                displayName: displayName,
                bio: bio,
                graduationYear: graduationYear,
                profilePic: profilePicUrl,
                phoneNumber: phoneNumber,
                isProfileComplete: true
            });
            Alert.alert("Success", "Profile updated successfully.");
            setIsProfileComplete(true);
            navigation.navigate('Home');
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <SafeAreaView style= { styles.setupContainer }>
            <KeyboardAvoidingView
                style={{ flex: 1, width: '100%', alignItems: 'center'}}
                behavior="padding"
                keyboardVerticalOffset={0}
            >
                <Text style= { styles.title }>Welcome to Campus Closet</Text>
                <Text style={{fontSize: 21, paddingVertical: 10}}>Enter your information below: </Text>
                <View style={ styles.inputContainer }>
                    <View style={styles.singleInputContainer}>
                        <Text>Name: </Text>
                        <TextInput
                            placeholder = "Jane Doe"
                            style = {styles.input}
                            value = { displayName }
                            keyboardType='default'
                            onChangeText = { text => setDisplayName(text) }
                            autoCapitalize="words"
                            multiline={false}
                            autoCorrect={false}
                        />
                    </View>
                    <View style={styles.singleInputContainer}>
                        <Text>Phone Number: </Text>
                        <TextInput
                            placeholder='(000) 000 - 0000'
                            style = {styles.input}
                            value = {phoneNumber}
                            maxLength={10}
                            keyboardType='phone-pad'
                            onChangeText = { text => setPhoneNumber(text)}
                        />
                    </View>
                    <View style={styles.singleInputContainer}>
                        <Text>Grad Year: </Text>
                        <TextInput
                            placeholder = "2026"
                            style = {styles.input}
                            value = { graduationYear }
                            maxLength = {4}
                            keyboardType='number-pad'
                            onChangeText = { text => setGraduationYear(text) }
                        />
                    </View>
                    <View style={styles.singleInputContainer}>
                        <Text style={{marginTop: 5}}>Bio: </Text>
                        <TextInput
                            placeholder="A fun fact about me is..."
                            value={bio}
                            onChangeText={setBio}
                            multiline={true}
                            style={styles.input}
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
                    <TouchableOpacity style={styles.button} onPress={() => pickImage(0, profilePic, setProfilePic)}>
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
    input: {
        fontSize: 16,
        padding: 5,
        margin: 3,
        flex: 1,
        lineHeight: 25,
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