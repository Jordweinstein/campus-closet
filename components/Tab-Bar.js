import React from "react";
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import Home from "./Home-Page.js";
import Shop from "./Shop-Page.js";
import Chat from "./Chat-Page.js";
import { ListingProvider } from '../contexts/listingContext.js';
import Profile from "./Profile-Page.js";

const Tab = createBottomTabNavigator();

export default function Tabs() {
    return (
        <Tab.Navigator screenOptions={{ 
            headerShown: false, 
            tabBarShowLabel: false
        }}>
            <Tab.Screen name="HomeTab" component={Home} 
                options={{
                tabBarIcon: ({ focused }) => (
                    <AntDesign 
                    name="home" 
                    size={24} 
                    color={focused ? "black" : "grey"} 
                    />
                )
                }}
            />
            <Tab.Screen name="Shop" component={Shop} 
                options={{
                tabBarIcon: ({ focused }) => (
                    <Feather 
                    name="shopping-bag" 
                    size={24} 
                    color={focused ? "black" : "grey"}  
                    />
                )
                }}
            />
            {/* <Tab.Screen name="Chat" component={Chat} 
                options={{
                tabBarIcon: ({ focused }) => (
                    <Feather 
                    name="message-circle" 
                    size={24} 
                    color={focused ? "black" : "grey"} 
                    />
                )
                }}
            /> */}
            <Tab.Screen name="Profile" component={Profile} 
                options={{
                tabBarIcon: ({ focused }) => (
                    <MaterialIcons 
                    name="person-outline" 
                    size={24} 
                    color={focused ? "black" : "grey"} 
                    />
                )
                }}
            />
        </Tab.Navigator>
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
  