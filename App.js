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
import { View, ActivityIndicator, Linking } from "react-native";
import * as Sentry from '@sentry/react-native';
import { StripeProvider } from '@stripe/stripe-react-native';

Sentry.init({
  dsn: 'https://50250a0766474fa2bf40f0b142289f2e@o4508294796214272.ingest.us.sentry.io/4508294798311424',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // enableSpotlight: __DEV__,
});

function AppContainer() {
  return (
    <NavigationContainer>
      <StripeProvider
        publishableKey="pk_test_51PfoXHACs9AoCw0TjLTyuwHrc2A8LIcSjxz0AXyOpbu0uqoaPwdv4hq1uVvUj297gjHsgC4jQxP8Mm5ZguQCljSt00NrWtttYX"
        merchantIdentifier="com.jordanweinstein.rent-the-campus"
        urlScheme="campus-closets"
      >
        <AuthProvider>
          <ListingsProvider>
            <MainNavigator />
          </ListingsProvider>
        </AuthProvider>
      </StripeProvider>
    </NavigationContainer>
  );
}

const Stack = createStackNavigator();
function MainNavigator() {
  const { setUser } = useContext(AuthContext);
  const [initialRoute, setInitialRoute] = useState(null); 
  const [isProfileComplete, setIsProfileComplete] = useState(false); 

  const config = {
    screens: {
      Home: 'home',
    }
  };
  
  const linking = {
    prefixes: ['my-app://'],
    config
  };

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
    <Stack.Navigator initialRouteName={initialRoute} linking={linking}>
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
