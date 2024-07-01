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
import { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import { signOut } from "firebase/auth";
import auth from '../auth'; 
import { createStackNavigator } from '@react-navigation/stack';
import '../firebase-config';
import CreateListing from './Create-Listing-Screen';
import EditProfile from './Edit-Profile-Screen';
import { AuthContext } from '../contexts/authContext';
import { ListingsContext, ListingsProvider } from '../contexts/listingContext';

export default function Profile() {
    const Stack = createStackNavigator();

    return (
        <ListingsProvider>
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
                    options={{ headerShown: true, headerTitle: "", headerTintColor: '#0e165c'}}
                />
            </Stack.Navigator>
        </ListingsProvider> 
    )
}

const ProfileMain = () => {
    const navigation = useNavigation();
    const { userData, likedListingsData } = useContext(AuthContext);
    const { userListings } = useContext(ListingsContext);

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
                    <>
                        <Text style={styles.title}>{userData.displayName}</Text> 
                        <Text> email: {userData.email} </Text>
                        <View style={styles.profileContainer}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image
                                    source={{ uri: userData.profilePic || "https://picsum.photos/200" }}
                                    style={styles.profileImage} />
                                <View style={styles.bioContainer}>
                                    <Text style={styles.bioText}>{userData.bio || ''}</Text>
                                </View>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>User</Text> 
                        <Text> email: </Text>
                    </>
                )}
                
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
                    {userListings.length === 0 ? 
                        <TouchableOpacity style={styles.listingImage}></TouchableOpacity>
                    : 
                        userListings.map((listing) => (
                            <TouchableOpacity key={listing.id} onPress={() => navigation.navigate('ListingScreen', { listing })}>
                                <Image 
                                    source={{ uri: listing.images[0] || 'https://picsum.photos/200/300' }}
                                    style={styles.listingImage}
                                />
                            </TouchableOpacity>
                        ))
                    }
                    
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
                    {likedListingsData.length === 0 ? 
                        <TouchableOpacity style={styles.listingImage}/>
                    :
                        likedListingsData.map((listing) => (
                            <TouchableOpacity key={listing.id} onPress={() => navigation.navigate('ListingScreen', { listing })}>
                                <Image 
                                    source={{ uri: listing.images?.[0] || 'https://picsum.photos/200/300' }}
                                    style={styles.listingImage}
                                />
                            </TouchableOpacity>
                        ))
                    }
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
        backgroundColor: '#f0f0f0',
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