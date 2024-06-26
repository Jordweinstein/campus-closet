import React, { useState, useContext } from 'react';
import { 
    SafeAreaView, 
    ScrollView,
    Image, 
    Text, 
    View, 
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { ListingsContext, ListingsProvider } from '../contexts/listingContext';
import "react-native-gesture-handler";
import { collection } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import ListingScreen from './Listing-Screen'; 

export default function Shop() {
    return (
        <ListingsProvider>
            <ShopContent />
        </ListingsProvider>
    );
}

const ShopContent = () => {
    const Stack = createStackNavigator();

    return (
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
}

const ShopMain = ({ navigation }) => {
    const {listings} = useContext(ListingsContext); 

    return (
        <SafeAreaView>
            <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollVerticalContainer} 
            >
                <Text style={styles.title}>Shop</Text>
                <View style={styles.textContainer}>
                    <Text>Search...</Text>
                </View>

                <View style={styles.container}>
                    <View style={styles.textContainer2}>
                        <Ionicons name="funnel" size = {20} color = "black"/>               
                    </View>
                    <View style={styles.textContainer2}>
                        <Text style={styles.h3}> My sizes </Text>
                    </View>
                    <View style={styles.textContainer3}>
                        <Text style={styles.h3}> Avalibility </Text>
                    </View>
                    <View style={styles.textContainer4}>
                        <Text style={styles.h3}> Delivery </Text>
                    </View>
                </View>

                <View style={styles.container2}>
                    <View style={styles.rowContainer}>
                        <View style={styles.gridItem}>
                            {listings.map((listing) => (
                                <TouchableOpacity key={listing.id} onPress={() => navigation.navigate('ListingScreen', { listing })}>
                                    <Image 
                                        source={{ uri: 'https://picsum.photos/200/300' }}
                                        style={{ width: 200, height: 300, margin: 5, borderRadius: 10}}
                                    />
                                </TouchableOpacity>
                            ))}
                            <Text>Reformation High Rise </Text>
                            <Text style = {{fontSize: 13, fontWeight: 2}}> Rent: $27 Size M </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
        

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 10,
        fontWeight: 2,
        fontFamily: 'BebasNeue',
        fontSize: 35,
        bottom: 5,
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc', 
        height: 20,  
        padding: 10,     
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    h2: {
        textAlign: 'left',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 18
    },

    textContainer: {
        alignSelf: 'stretch', 
        padding: 15,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        bottom: 10,
        margin: 5,
    },
    
    container: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignSelf: 'center',
    },

    textContainer2:{
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer3:{
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        padding: 5,
    },
    textContainer4:{
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        padding: 5,
    },
    h3: {
        textAlign: 'center',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 16,
    },

    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      rowContainer: {
        flexDirection: 'row',
      },
      gridItem: {
        flex: 1,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
      },
    scrollViewStyle: { 
        flex: 1,
        width: '100%',  
    },
    scrollContainer: { 
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: '2%'
    },
    scrollVerticalContainer: { 
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    image: {
        width: '90%', 
        height: 200, 
        borderRadius: 30,
        borderColor: 'black',
        borderWidth: 1,
    }
})

const items = [
    {
        id: 1,
        category: "Skirts",
        description: "Princess Polly black mini skirt",
        brand: "Princess Polly",
        price: 10.0,
        purchaseMode: {"buy" : 23.0},
        tags: ["Game Day"], 
        size: "Medium"
    },
]
