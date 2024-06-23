import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { getAuth, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        onAuthStateChanged,
        sendEmailVerification, 
        sendPasswordResetEmail 
    } from "firebase/auth";
import { doc, updateDoc, setDoc } from "firebase/firestore"; 
import '../firebase-config';
import db from '../db';
import { useNavigation } from "@react-navigation/native";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth();
    const navigation = useNavigation();
    
    const validateParameters = () => {
        if (email === null || !email.includes('@') || !email.includes('.')) {
            Alert.alert(
                "Error",
                "Please enter a valid email.", 
                [
                  {
                    text: "OK", 
                    onPress: () => console.log('OK Pressed') 
                  }
                ],
                { cancelable: false } 
              );
        } if (password === "") {
            Alert.alert(
                "Error",
                "Please enter a password", 
                [
                  {
                    text: "OK", 
                  }
                ],
                { cancelable: false } 
              );
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), user => {
            if (user && user.emailVerified) {
                navigation.navigate('ProfileSetup');
                setEmail('');
                setPassword('');
                const userRef = doc(db, "users", auth.currentUser.uid);
                try {
                    async () => {
                        await updateDoc(userRef, {
                            isVerified: true,  
                        });
                    }
                    console.log("isVerified updated successfully.");
                } catch (error) {
                    console.error("Failed to update isVerified:", error);
                }
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
                    profilePicUrl: "",
                    isProfileComplete: false
                });
    
                console.log("Document written with ID: ", user.uid);
                setEmail('');
                setPassword('');
            } catch (error) {
                console.log("Error during sign up or document creation: " + error.message);
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert("Error", "The email address is already in use by another account.");
                } else {
                    validateParameters(); 
                }
            }
            setEmail('');
            setPassword('');
        } else {
            Alert.alert(
                "Error",
                "Please register with an email ending in .edu"
            );
        }
    }

    const handleLogIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (auth.currentUser.emailVerified) {
                navigation.navigate((userCredential.isProfileComplete) ? 'Home' : 'ProfileSetup');
                setEmail('');
                setPassword('');
            } else {
                Alert.alert("Email Not Verified", "Please verify your email before logging in.");
            }
        } catch (error) {
            console.error(error);
            validateParameters();
            if (error.code === 'auth/invalid-credential') {
                Alert.alert( 
                    "Error",
                    "Incorrect login credentials. Please try again."
                );
            } else if (error.code === 'auth/weak-password') {
                Alert.alert(
                    "Error",
                    "Password must be at least 6 characters"
                )
            }
        } finally {
            console.log("DB INSTANCE: " + db);
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
                    value= { email }
                    onChangeText={text => setEmail(text)}
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