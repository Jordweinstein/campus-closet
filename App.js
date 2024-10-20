import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Tabs from "./components/Tab-Bar";
import ProfileSetup from "./components/Profile-Setup-Screen";
import Login from "./components/Login-Screen";
import React, { useEffect, useContext, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { registerTranslation } from "react-native-paper-dates";
import { AuthContext, AuthProvider } from "./contexts/authContext";
import auth from "./firebase/auth";
import db from './firebase/db'; // Firestore database
import { doc, getDoc } from "firebase/firestore"; // Firestore methods
import { ListingsProvider } from "./contexts/listingContext";
import { View, ActivityIndicator } from "react-native";

function AppContainer() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <ListingsProvider>
          <MainNavigator />
        </ListingsProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

const Stack = createStackNavigator();
function MainNavigator() {
  const { setUser } = useContext(AuthContext);
  const [initialRoute, setInitialRoute] = useState(null); // Start with null to indicate loading
  const [isProfileComplete, setIsProfileComplete] = useState(false); // Fetch this directly

  console.log("Initial Route:", initialRoute);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUser(user); // Set the authenticated user in the context
        
        if (user.emailVerified) {
          // Fetch user data from Firestore to determine if profile is complete
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsProfileComplete(userData.isProfileComplete || false); // Set profile completion status

            // Determine the initial route based on profile completion
            setInitialRoute(userData.isProfileComplete ? "Home" : "ProfileSetup");
          } else {
            setInitialRoute("ProfileSetup"); // If no user data, assume incomplete profile
          }
        } else {
          setInitialRoute("Login"); // If not verified, go to Login
        }
      } else {
        setInitialRoute("Login"); // If no user, go to Login
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    registerTranslation("en", {
      save: "Save",
      selectSingle: "Select date",
      selectMultiple: "Select dates",
      selectRange: "Select period",
      notAccordingToDateFormat: inputFormat =>
        `Date format must be ${inputFormat}`,
      mustBeHigherThan: date => `Must be later than ${date}`,
      mustBeLowerThan: date => `Must be earlier than ${date}`,
      mustBeBetween: (startDate, endDate) =>
        `Must be between ${startDate} - ${endDate}`,
      dateIsDisabled: "Day is not allowed",
      previous: "Previous",
      next: "Next",
      typeInDate: "Type in date",
      pickDateFromCalendar: "Pick date from calendar",
      close: "Close"
    });
  }, []);

  // Show a loading indicator while determining the initial route
  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Once the initial route is determined, render the navigator
  return (
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
  );
}

export default AppContainer;
