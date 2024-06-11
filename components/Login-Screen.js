import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { getAuth, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        onAuthStateChanged,
        sendEmailVerification 
    } from "firebase/auth";
import '../firebase';
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
                navigation.navigate('Home')
                setEmail('');
                setPassword('');
            } else if (user && !user.emailVerified) {
                Alert.alert("Email Verification Required", "Please verify your email before logging in.");
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignUp = async () => {

        await createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            await sendEmailVerification(user);
            setEmail('');
            setPassword('');
        })
        .catch((error) => {
            console.log(error.message);
            validateParameters();
        });
    }

    const handleLogIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user.emailVerified) {
                navigation.navigate('Home');
                setEmail('');
                setPassword('');
            } else {
                Alert.alert("Email Not Verified", "Please verify your email before logging in.");
            }
        } catch (error) {
            console.error(error);
            validateParameters();
        }
    };

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
    }
    
})