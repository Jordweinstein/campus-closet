import { 
    SafeAreaView, 
    ScrollView,
    Image, 
    Text, 
    View, 
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import auth from '../auth'; 
import { createStackNavigator } from '@react-navigation/stack';
import '../firebase-config';
import CreateListing from './Create-Listing-Screen';
import db from '../db'
import EditProfile from './Edit-Profile-Screen';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Profile() {
    const Stack = createStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="ProfileMain" 
                component={ ProfileMain }
                options={{ headerShown: false, headerTitle: "Back"}}
            />
            <Stack.Screen 
                name="CreateListing" 
                component={ CreateListing }
                options={{ headerShown: true, headerTitle: ""}}
            />
            <Stack.Screen
                name="EditProfile"
                component={ EditProfile }
                options={{ headerShown: true, headerTitle: ""}}
            />
        </Stack.Navigator>
    )
}

const ProfileMain = () => {
    const [userData, setUserData] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = () => {
            const user = getAuth().currentUser;
            if (user) {
                const docRef = doc(db, "users", user.uid);

                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        console.log("No such document!");
                    }
                });

                return () => unsubscribe();  // Clean up the listener on unmount
            }
        };

        const unsubscribeAuth = onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                fetchUserData(); 
            } else {
                navigation.navigate('Login');
            }
        });

        return unsubscribeAuth; 
    }, [navigation]);

    const handleSignOut = () => {
        signOut(auth).then(() => {
            Alert.alert("Sign out successful.");
        }).catch((error) => {
            Alert.alert("Error", "Sign out unsuccessful.");
        });
    }
    
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollVerticalContainer} 
            >
                {userData ? (   
                    <><Text style={styles.title}>{userData.displayName}</Text><Text> email: {auth.currentUser?.email} </Text><View style={styles.profileContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image
                                source={{ uri: userData.profilePic }}
                                style={styles.profileImage} />
                            <View style={styles.bioContainer}>
                                <Text style={styles.bioText}>{userData.bio}</Text>
                            </View>
                        </View>

                    </View></>
                ) : <Text>No user data</Text>}
                
                <View style={[styles.textContainer]}>
                    <Text style={styles.h2}>My Listings</Text>
                    <TouchableOpacity style={styles.addListingButton} onPress={() => navigation.navigate('CreateListing')}>
                        <Ionicons name="add-circle-outline" size={24} color="black" />
                    </TouchableOpacity>
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
                                style={styles.listingImage}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.textContainer}>
                    <Text style={styles.h2}>My favorites</Text>
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
                                style={styles.listingImage}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style = { styles.button }
                    onPress={ handleSignOut }
                >
                    <Text>Sign out</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style= { styles.button }
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text>Edit Profile</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>

            
            
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 56,
        paddingTop: 10,
        fontWeight: 5,
        fontFamily: 'BebasNeue',
    },
    profileContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        margin: 10,
    },
    bioText: {
        textAlign: 'center',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 15,
        marginHorizontal: 10,
    },
    bioContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%',
        margin: 10
    },
    h2: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
        textAlign: 'left'
    },
    textContainer: {
        paddingHorizontal: 20,
        width: '100%',
        marginBottom: 7,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    myListingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addListingButton: {
        paddingTop: 12,
        marginLeft: 10
    },
    profileDetail: {
        fontSize: 16,
        marginBottom: 5,
    },
    editButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 10,
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
    listingImage: {
        width: 125, 
        height: 125, 
        margin: 5, 
        borderRadius: 10,
    },
    button: {
        padding: 10,
        backgroundColor: '#e0edff',
        color: "white",
        marginTop: 20,
        margin: 7,
        borderRadius: 10,
        width: 125,
        alignItems: 'center'
    }
});

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
];
