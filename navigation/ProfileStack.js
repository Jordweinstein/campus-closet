import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ProfileMain } from "../components/Profile-Page";
import ListingContainer from "../components/Listing-Screen";
import CreateListing from "../components/Create-Listing-Screen";
import EditProfile from "../components/Edit-Profile-Screen";
import Offers from "../components/Offers-Screen";
import Checkout from "../components/Checkout-Screen";
import Archived from "../components/Archived-Offers-Screen";

const Stack = createStackNavigator();

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileMain}
      options={{ headerShown: false, headerTitle: "Back" }}
    />
    <Stack.Screen
      name="ListingScreen"
      component={ListingContainer}
      options={{ headerShown: true, headerTitle: "", headerTintColor: "#0e165c" }}
    />
    <Stack.Screen
      name="CreateListing"
      component={CreateListing}
      options={{ headerShown: true, headerTitle: "", headerTintColor: "#0e165c" }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfile}
      options={{ headerShown: true, headerTitle: "", headerTintColor: "#0e165c" }}
    />
    <Stack.Screen
      name="Offers"
      component={Offers}
      options={{ headerShown: true, headerTitle: "", headerTintColor: "#0e165c" }}
    />
    <Stack.Screen
      name="CheckoutScreen"
      component={Checkout}
      options={{ headerShown: true, headerTitle: "", headerTintColor: "#0e165c" }}
    />
    <Stack.Screen
      name="Archived"
      component={Archived}
      options={{ headerShown: true, headerTitle: "", headerTintColor: "#0e165c" }}
    />
  </Stack.Navigator>
);

export default ProfileStack;
