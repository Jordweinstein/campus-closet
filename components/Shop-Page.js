import React, {useContext, useState} from 'react';
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
import "react-native-gesture-handler";
import Ionicons from '@expo/vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import ListingScreen from './Listing-Screen'; 
import { ListingsContext, ListingsProvider } from '../contexts/listingContext';

export default function Shop() {
    return (
        <ListingsProvider>
            <ShopContent />
        </ListingsProvider>
    );
}

function ShopContent() {

    const Stack = createStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen 
                name = "ShopMain" 
                component = { ShopMain }
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


const ShopMain = ({navigation}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState(null);
    const {listings} = useContext(ListingsContext);

    const renderImageRows = () => {
        let rows = [];
        for (let i = 0; i < listings.length; i += 2) {
            rows.push(
                <View key={i} style={styles.row}>
                    <TouchableOpacity 
                        key={listings[i].id} 
                        onPress={() => {
                            console.log("Shop page list" + listings[i]);
                            navigation.navigate('ListingScreen', { listing: listings[i] });
                        }}
                        style={styles.gridItem}
                    >
                        <Image 
                            source={{ uri: listings[i].images[0] }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                    {listings[i + 1] && (
                        <TouchableOpacity 
                            key={listings[i + 1].id} 
                            onPress={() => {

                                navigation.navigate('ListingScreen', { listing: listings[i + 1] });
                            }}
                            style={styles.gridItem}
                        >
                            <Image 
                                source={{ uri: listings[i+1].images[0] }}
                                style={styles.image}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            );
        }
        return rows;
    };

    return (
        
        <SafeAreaView>
            <Text style={styles.title}>Shop</Text>

            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Ionicons name="funnel" size = {20} color = "black"/>               
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.h3}> Avalibility </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.h3}> Delivery </Text>
                </View>
            </View>

            <ScrollView
                horizontal={false}
            >
                {renderImageRows()}

            </ScrollView>
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    scrollViewStyle: {
        width: '100%',
    },
    scrollContainer: {
        flexDirection: 'column',
        alignItems: 'center',        
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start', 
        width: '100%',
        marginBottom: 10,
    },
    gridItem: {
        flexBasis: '45%', 
        padding: 5,
        aspectRatio: 1 /1, 
        margin: '2.5%', 
    },
    image: {
        width: '100%', 
        height: '100%', 
        borderRadius: 10,
    },
    title: {
        fontSize: 10,
        fontWeight: 2,
        fontFamily: 'BebasNeue',
        fontSize: 35,
        bottom: 5,
        textAlign: 'center',
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc', 
        height: 20,  
        padding: 20,    
        backgroundColor: 'lightgrey', 
        borderRadius: 15,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    h2: {
        textAlign: 'left',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 18
    },
    container: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignSelf: 'center',
        width: '95%',
        marginBottom: 5,
    },
    textContainer:{
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    h3: {
        textAlign: 'center',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 16,
    },
    scrollVerticalContainer: { 
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
})
