import React, { useEffect, useState, useRef, useContext } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { getAuth, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        onAuthStateChanged,
        sendEmailVerification, 
        sendPasswordResetEmail 
    } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; 
import '../firebase/firebase-config';
import db from '../firebase/db';
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/authContext";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth();
    const emailInputRef = useRef(null);
    const navigation = useNavigation();
    const { setIsProfileComplete, isProfileComplete } = useContext(AuthContext);

    const validateParameters = () => {
        if (!email.includes('@') || !email.includes('.')) {
            Alert.alert("Error", "Please enter a valid email.");
            return false;
        }
        if (password === "") {
            Alert.alert("Error", "Please enter a password");
            return false;
        }
        return true;
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.emailVerified) {
                setEmail('');
                setPassword('');
            } else if (user && !user.emailVerified) {
                Alert.alert("Email Verification Required", "Please verify your email before logging in.");
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignUp = async () => {
        if (email.endsWith('.edu')) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await sendEmailVerification(user);
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    email: email,
                    displayName: "",
                    bio: "",
                    graduationYear: "",
                    listings: [],
                    likedListings: [],
                    profilePicUrl: "",
                    isProfileComplete: false
                });

                setEmail('');
                setPassword('');
                emailInputRef.current.focus();
            } catch (error) {
                console.log("Error during sign up or document creation: " + error.message);
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert("Error", "The email address is already in use by another account.");
                } else if (error.code === 'auth/weak-password') {
                    Alert.alert("Error", "Password must be at least 6 characters");
                } else {
                    validateParameters();
                }
            }
        } else {
            Alert.alert("Error", "Please register with an email ending in .edu");
        }
    }

    const handleLogIn = async () => {
        if (!validateParameters()) {
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user !== null && user.emailVerified) {
                setEmail('');
                setPassword('');

                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef); 

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setIsProfileComplete(userData.isProfileComplete);

                    if (!userData.isProfileComplete) {
                        console.log("in login: " + isProfileComplete);
                        navigation.navigate('ProfileSetup');
                    } else {
                        navigation.navigate('Home');
                    }
                }
            } else {
                const resendVerificationEmail = async () => {
                    try {
                        await sendEmailVerification(auth.currentUser);
                        Alert.alert(
                            "Verification Email Sent",
                            "A verification email has been sent to your email address. Please check your inbox and verify your email."
                        );
                    } catch (error) {
                        console.error("Error sending verification email: ", error);
                        Alert.alert(
                            "Error",
                            "Failed to send verification email. Please try again later."
                        );
                    }
                };

                Alert.alert(
                    "Email Not Verified",
                    "Please verify your email before logging in.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Resend Verification", onPress: resendVerificationEmail }
                    ]
                );
            }
        } catch (error) {
            console.error(error);
            validateParameters();

            switch (error.code) {
                case 'auth/user-not-found':
                    Alert.alert("Error", "No account found with this email. Please sign up or check your email address.");
                    break;
                case 'auth/wrong-password':
                    Alert.alert("Error", "Incorrect password. Please try again.");
                    break;
                case 'auth/invalid-email':
                    Alert.alert("Error", "Invalid email format. Please check your email address.");
                    break;
                case 'auth/user-disabled':
                    Alert.alert("Error", "This account has been disabled. Please contact support.");
                    break;
                case 'auth/too-many-requests':
                    Alert.alert("Error", "Too many login attempts. Please try again later.");
                    break;
                default:
                    Alert.alert("Login Error", "Invalid login credentials.");
            }
        }
    };

    const handleResetPassword = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                Alert.alert("Email sent", "Please check your email and proceed to reset your password.")
            })
            .catch((error) => {
                console.log(error.message);
            });
    }

    return (
        <>
        <View style={styles.titleView}>
            <Text style={styles.title}>Campus Closet</Text>
        </View>
        
        <View
            style = {styles.container}
            behavior = "padding"
        >
            <View style = {styles.inputContainer}>
                <TextInput
                    placeholder = "email"
                    style = {styles.input}
                    ref={emailInputRef}
                    value= { email }
                    keyboardType='email-address'
                    onChangeText={text => setEmail(text)}
                    autoFocus={true}
                />
                <TextInput
                    placeholder = "password"
                    style = {styles.input}
                    value= { password }
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                />
                    
            </View>

            <TouchableOpacity onPress={handleResetPassword}>
                <Text style={{padding: 10}}>Forgot password?</Text>
            </TouchableOpacity>

            <View style = {styles.buttonContainer}>
                <TouchableOpacity 
                    style = {styles.button} 
                    onPress={handleLogIn}
                >
                    <Text style = { styles.buttonText }> Login </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style = {styles.button} 
                    onPress={handleSignUp}
                >
                    <Text style = { styles.buttonText }> Register </Text>
                </TouchableOpacity>
            </View>
        </View>
        </>
        
    )
}

export default Login;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 2,
        backgroundColor: '#e0edff',
    },
    input: {
        width: 300,
        height: 50,
        backgroundColor: 'white',
        padding: 10,
        margin: 10,
        borderRadius: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
         margin: 10
    },
    button: {
        width: 110,
        backgroundColor: '#0e165c',
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5
    },
    buttonText: {
        color: 'white'
    },
    titleView: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1,
        paddingTop: 30,
        paddingBottom: 0,
        backgroundColor: '#e0edff',
    },
    title: {
        fontFamily: "BebasNeue",
        fontSize: 64,
        paddingBottom: 10
    }
    
})