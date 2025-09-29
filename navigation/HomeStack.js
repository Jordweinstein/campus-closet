import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeMain } from "../components/Home-Page";
import ListingScreen from "../components/Listing-Screen";

const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeMain"
      component={HomeMain}
      options={{ headerShown: false, headerTitle: "Back" }}
    />
    <Stack.Screen
      name="ListingScreen"
      component={ListingScreen}
      options={{ headerTitle: "", headerTintColor: "black" }}
    />
  </Stack.Navigator>
);

export default HomeStack;
