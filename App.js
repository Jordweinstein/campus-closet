import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './components/Tab-Bar';
import ProfileSetup from './components/Profile-Setup-Screen';
import Login from './components/Login-Screen';
import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import db from './db'

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  const Stack = createStackNavigator();
  const [user, setUser] = useState(null);
  const navigationRef = useRef();

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (user) => {
      setUser(user); 
    });
  }, []);
  
  useEffect(() => {
    const auth = getAuth();
    if (user && auth.currentUser.emailVerified) {
      fetchUserData(user).then(userData => {
        if (userData && userData.isProfileComplete) {
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: 'ProfileSetup' }],
          });
        }
      });
    } else {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [user]);

  const fetchUserData = async (user) => {
    const docRef = doc(db, "users", user.uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data(); 
      } else {
        console.log("No such document!");
        return null; 
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null; 
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen 
          name="Login" 
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Tabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
