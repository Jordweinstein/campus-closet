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
import '../firebase-config';
import CreateListing from './Create-Listing-Screen';
import db from '../db'
import EditProfile from './Edit-Profile-Screen';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Profile() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="ProfileMain" 
                component={ProfileMain}
                options={{ headerShown: false, headerTitle: "Back"}}
            />
        </Stack.Navigator>
    );
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
                <Text style={styles.title}>Megan Adams</Text>

                <View style={styles.profileContainer}>
                    <Image 
                        source={ ProfilePic }
                        style={styles.profileImage}
                    />
                <View style={styles.friendsContainer}>
                            <Text style={styles.friendsCount}>Friends: 150</Text>
                            <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
                                <Ionicons name="add-circle-outline" size={24} color="black" />
                            </TouchableOpacity>
                </View>
                    <View style = {styles.bioContainer}>
                        <Text style={styles.bioText}>Hi! Looking for gameday outfits, cocktail dresses, and formal dresses. Located near Franklin St. DM me for more info!</Text>
                        <TouchableOpacity style={styles.editButton} onPress={handleEditBio}>
                                <Ionicons name="create-outline" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.h2}>My Sizes</Text>
                    <View style={styles.sizesContainer}>
                        <View style={styles.sizeColumn}>
                            <Text style={styles.profileDetail}>Top: Medium</Text>
                            <Text style={styles.profileDetail}>Bottom: Small</Text>
                            <Text style={styles.profileDetail}>Shoes: 8</Text>
                        </View>
                        <View style={styles.sizeColumn}>
                            <Text style={[styles.profileDetail, styles.rightAligned]}>Dresses: 8</Text>
                            <Text style={[styles.profileDetail, styles.rightAligned]}>Jeans: 10</Text>
                            <Text style={[styles.profileDetail, styles.rightAligned]}>Skirts: 8</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.textContainer, styles.alignedContainer]}>
                    <View style={styles.myListingsTextContainer}>
                        <Text style={styles.h2}>My Listings</Text>
                    </View>
                    <TouchableOpacity style={styles.addListingButton} onPress={handleUpload}>
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
    friendsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    friendsCount: {
        fontSize: 16,
        marginRight: 10,
    },
    addFriendButton: {
        padding: 5,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
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
        padding: 30,
        marginTop: 10,
        alignItems: 'center',
        width: '90%',
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
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    sizesContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center',
    },
    sizeColumn: {
        flex: 1,
    },
    myListingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    myListingsTextContainer: {
        flex: 1,
        alignItems: 'left',
    },
    addListingButton: {
        padding: 5,
        marginLeft: 10
    },
    profileDetail: {
        fontSize: 16,
        marginBottom: 5,
    },
    rightAligned: {
        textAlign: 'right',
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

    uploadButton: {
        padding: 5
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
    alignedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
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
