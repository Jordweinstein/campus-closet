import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './components/Tab-Bar';
import ProfileSetup from './components/Profile-Setup-Screen';
import Login from './components/Login-Screen';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import db from './db';
import { registerTranslation } from 'react-native-paper-dates';
import { AuthContext, AuthProvider } from './contexts/authContext';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component= {Login}/>
    <Stack.Screen name="ProfileSetup" component= {ProfileSetup}/>
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, isProfileComplete } = useContext(AuthContext);
  return user ? (isProfileComplete ? <Tabs /> : <ProfileSetupScreen />) : <AuthStack />;
}

export default function App() {

  registerTranslation('en', {
        save: 'Save',
        selectSingle: 'Select date',
        selectMultiple: 'Select dates',
        selectRange: 'Select period',
        notAccordingToDateFormat: (inputFormat) =>
          `Date format must be ${inputFormat}`,
        mustBeHigherThan: (date) => `Must be later then ${date}`,
        mustBeLowerThan: (date) => `Must be earlier then ${date}`,
        mustBeBetween: (startDate, endDate) =>
          `Must be between ${startDate} - ${endDate}`,
        dateIsDisabled: 'Day is not allowed',
        previous: 'Previous',
        next: 'Next',
        typeInDate: 'Type in date',
        pickDateFromCalendar: 'Pick date from calendar',
        close: 'Close',
      })

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}


// export default function App() {
//   const [initialRoute, setInitialRoute] = useState('Login');
//   const Stack = createStackNavigator();
//   const [user, setUser] = useState(null);
//   const navigationRef = useRef();

//   useEffect(() => {
//     const auth = getAuth();
//     return onAuthStateChanged(auth, (user) => {
//       setUser(user); 
//     });
//   }, []);
  
//   useEffect(() => {
//     const auth = getAuth();
//     if (user && auth.currentUser.emailVerified) {
//       fetchUserData(user).then(userData => {
//         if (userData && userData.isProfileComplete) {
//           navigationRef.current?.reset({
//             index: 0,
//             routes: [{ name: 'Home' }],
//           });
//         } else {
//           navigationRef.current?.reset({
//             index: 0,
//             routes: [{ name: 'ProfileSetup' }],
//           });
//         }
//       });
//     } else {
//       navigationRef.current?.reset({
//         index: 0,
//         routes: [{ name: 'Login' }],
//       });
//     }
//   }, [user]);

//   const fetchUserData = async (user) => {
//     const docRef = doc(db, "users", user.uid);
//     try {
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         return docSnap.data(); 
//       } else {
//         console.log("No such document!");
//         return null; 
//       }
//     } catch (error) {
//       console.error("Failed to fetch user data:", error);
//       return null; 
//     }
//   };

//   return (
//     <NavigationContainer ref={navigationRef}>
//       <Stack.Navigator initialRouteName={initialRoute}>
        
//         <Stack.Screen
//           name="Home"
//           component={Tabs}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen 
//           name="Login" 
//           component={Login}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen 
//           name="ProfileSetup" 
//           component={ProfileSetup}
//           options={{ headerShown: false }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
