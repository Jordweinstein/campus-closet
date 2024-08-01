import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Tabs from "./components/Tab-Bar";
import ProfileSetup from "./components/Profile-Setup-Screen";
import Login from "./components/Login-Screen";
import React, { useEffect, useContext, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { registerTranslation } from "react-native-paper-dates";
import { AuthContext, AuthProvider } from "./contexts/authContext";
import auth from "./firebase/auth";
import { ListingsProvider } from "./contexts/listingContext";

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
  const { isProfileComplete, setUser } = useContext(AuthContext);
  const [initialRoute, setInitialRoute] = useState("Login");
  const navigation = useNavigation();
  useEffect(
    () => {
      const unsubscribe = onAuthStateChanged(auth, async user => {
        if (user) {
          setUser(user);
          if (user.emailVerified) {
            if (isProfileComplete) {
              setInitialRoute("Home");
            } else {
              setInitialRoute("ProfileSetup");
            }
          } else {
            setInitialRoute("Login");
          }
        } else {
          navigation.navigate("Login");
        }
      });
      return () => unsubscribe();
    },
    [auth]
  );

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
