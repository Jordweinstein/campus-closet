import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { ShopMain } from "../components/Shop-Page";
import ListingScreen from "../components/Listing-Screen";

const Stack = createStackNavigator();

const ShopStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="ShopMain"
      component={ShopMain}
      options={{ headerShown: false, headerTitle: "Back" }}
    />
    <Stack.Screen
      name="ListingScreen"
      component={ListingScreen}
      options={{ headerTitle: "", headerTintColor: "black" }}
    />
  </Stack.Navigator>
);

export default ShopStack;
