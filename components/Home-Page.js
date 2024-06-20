import React from 'react';
import { 
    SafeAreaView, 
    ScrollView,
    Image, 
    Text, 
    View, 
    StyleSheet,
    TouchableOpacity 
} from 'react-native';
import "react-native-gesture-handler";
import { createStackNavigator } from '@react-navigation/stack';
import ListingScreen from './Listing-Screen'; 
import GameDay from '../assets/images/gameday.jpeg';

const Stack = createStackNavigator();

export default function Home() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name = "HomeMain" 
                component = { HomeMain }
                options = {{ headerShown: false, headerTitle: "Back"}}
            />
            <Stack.Screen 
                name = "ListingScreen" 
                component = { ListingScreen }
                options = {{ headerTitle: "", headerTintColor: "black"}}
            />
        </Stack.Navigator>
    )
}
const HomeMain = ({ navigation }) => {
    return (
        <SafeAreaView>
            <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollVerticalContainer} 
            >
                <Text style={styles.title}>Campus Closets</Text>

                <Image 
                    source = { GameDay }
                    style = { styles.image }
                />

                <View style={styles.textContainer}>
                    <Text style={styles.h2}>Trending</Text>
                </View>
                <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false} 
                    style={styles.scrollViewStyle} 
                    contentContainerStyle={styles.scrollContainer} 
                >
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 125, height: 125, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.textContainer}>
                    <Text style={styles.h2}>Just In</Text>
                </View>
                <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false} 
                    style={styles.scrollViewStyle} 
                    contentContainerStyle={styles.scrollContainer} 
                >
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 125, height: 125, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </ScrollView>
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 56,
        paddingTop: 10,
        fontWeight: 5,
        fontFamily: 'BebasNeue',
    },
    h2: {
        textAlign: 'left',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 18
    },
    textContainer: {
        alignSelf: 'stretch', 
        padding: 15 
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
        width: '100%', 
        height: 220, 
        marginVertical: 15
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
    {
        id: 2,
        category: "Dresses",
        description: "Floral maxi dress",
        brand: "Revolve",
        price: 21.0,
        purchaseMode: {"rent": 12.0},
        tags: ["Formal"],
        size: "Small"

    },
    {
        id: 3,
        category: "Tops",
        description: "black crop top",
        brand: "Edikted",
        price: [19.0, 41.0],
        purchaseMode: {"rent": 10.0, "buy": 15.0},
        tags: ["Going Out", "Date Night"],
        size: "M"

    },
    {
        id: 4,
        category: "Accessories",
        description: "White UNC Trucker Hat",
        brand: "Shrunken Head",
        price: [15.0, 30.0],
        purchaseMode: {"rent" : 9.0, "buy": 15.0},
        tags: ["Game Day"],
        size: "One Size"
    }
]

