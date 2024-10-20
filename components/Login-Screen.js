import React, { useEffect, useState, useRef, useContext } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, Keyboard } from 'react-native';
import { createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        onAuthStateChanged,
        sendEmailVerification, 
        sendPasswordResetEmail 
    } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; 
import '../firebase/firebase-config';
import db from '../firebase/db';
import auth from "../firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../contexts/authContext";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
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
            if (!email.endsWith('@unc.edu')) {
                alert("Campus Closet is only available for use at UNC Chapel Hill at this time. Stay tuned...");
                return;
            }
            try {
                setLoading(true);
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
                    offeredListings: [],
                    profilePicUrl: "",
                    insta: "",
                    isProfileComplete: false
                });
                

                setEmail('');
                setPassword('');
                emailInputRef.current.focus();

            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert("Error", "The email address is already in use by another account.");
                } else if (error.code === 'auth/weak-password') {
                    Alert.alert("Error", "Password must be at least 6 characters");
                } else {
                    validateParameters();
                }
            } finally {
                setLoading(false);
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
            setLoading(true); 
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            if (user !== null && user.emailVerified) {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
    
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setIsProfileComplete(userData.isProfileComplete);
    
                    if (!userData.isProfileComplete) {
                        setLoading(false);
                        navigation.replace('ProfileSetup');
                    } else {
                        setEmail('');
                        setPassword('');
                        setTimeout(() => {
                            setLoading(false);
                        }, 100);
                        navigation.replace('Home');
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
                setLoading(false); 
            }
        } catch (error) {
            console.error(error);
            setLoading(false); 
    
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
                if (error.code === 'auth/missing-email') {
                    Alert.alert('Error', 'Please enter an email address.');
                  } else {
                    console.log(error.message);
                  }
            });
    }

    return (
        (loading) ?
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" />
        </View>
        :
        <>
        <View style={styles.titleView}>
            <Text style={styles.title}>Campus Closets</Text>
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
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    onChangeText={text => setEmail(text)}
                    autoCorrect={false}
                />
                <TextInput
                    placeholder = "password"
                    style = {styles.input}
                    value= { password }
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    autoCorrect={false}
                />
                    
            </View>

            <TouchableOpacity onPress={handleResetPassword}>
                <Text style={{padding: 10, fontFamily: 'optima'}}>Forgot password?</Text>
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
        fontFamily: 'optima',
        padding: 10,
        fontFamily: 'optima',
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
        color: 'white',
        fontFamily: 'optima',
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
        fontSize: 60,
        paddingBottom: 10
    }
    
})