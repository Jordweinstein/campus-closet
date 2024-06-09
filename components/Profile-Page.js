import { View, Text, StyleSheet, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import auth from '../firebase'; 
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
    const navigation = useNavigation();
    useEffect(() => {
        onAuthStateChanged(getAuth(), user => {
            if (!user) {
                navigation.navigate('Login');
            }
        });
    })
    const handleSignOut = () => {
        signOut(auth).then(() => {
            Alert.alert(
                "Error",
                "Sign out successful.", 
                [
                  {
                    text: "OK", 
                    onPress: () => console.log('OK Pressed') 
                  }
                ],
                { cancelable: false } 
              );
          }).catch((error) => {
            Alert.alert(
                "Error",
                "Sign out unsuccessful.", 
                [
                  {
                    text: "OK", 
                    onPress: () => console.log('OK Pressed') 
                  }
                ],
                { cancelable: false } 
              );
          });
          
    }
    return (
        <View style = {styles.container}>
            <Text> email: { auth.currentUser?.email} </Text>
            <TouchableOpacity 
                style = { styles.button }
                onPress={ handleSignOut }
            >
                <Text>Sign out</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    }
})