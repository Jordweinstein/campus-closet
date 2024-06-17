import { View, Text, StyleSheet, Alert,  } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { createStackNavigator } from '@react-navigation/stack';
import auth from '../auth'; 
import '../firebase-config';
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import ProfileSetup from './Profile-Setup-Screen';

export default function Profile() {
    const navigation = useNavigation();
    const Stack = createStackNavigator();

    useEffect(() => {
        onAuthStateChanged(getAuth(), user => {
            if (!user) {
                navigation.navigate('Login');
            }
        });
    });

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ProfileMain"
                component={ ProfileMain }
                options = {{ headerShown: false }}
            />
            <Stack.Screen 
                name = "ProfileSetup" 
                component = { ProfileSetup }
                options = {{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}

const ProfileMain = ({ navigation }) => {
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
            <TouchableOpacity 
                style = { styles.button }
                onPress={() => navigation.navigate('ProfileSetup')}            >
                <Text>Setup Profile</Text>
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