import React, { useEffect, useState } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { getAuth, 
        createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, 
        onAuthStateChanged, 
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
            if (user) {
                navigation.navigate('Home')
                setEmail('');
                setPassword('');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignUp = () => {

        createUserWithEmailAndPassword(aiuth, email, password)
        .then((userCredential) => {
            navigation.navigate("Home");
            const user = userCredential.user;
        })
        .catch((error) => {
            validateParameters();
        });
    }

    const handleLogIn = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
        })
        .catch((error) => {
            validateParameters();
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