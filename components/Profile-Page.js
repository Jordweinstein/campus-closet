import { 
    SafeAreaView, 
    ScrollView,
    Image, 
    Text, 
    View, 
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import { useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import { signOut } from "firebase/auth";
import auth from '../firebase/auth'; 
import { createStackNavigator } from '@react-navigation/stack';
import '../firebase/firebase-config';
import CreateListing from './Create-Listing-Screen';
import EditProfile from './Edit-Profile-Screen';
import Listing from './Listing-Screen';
import { AuthContext } from '../contexts/authContext';
import { ListingsContext, ListingsProvider } from '../contexts/listingContext';

export default function Profile() {
    const Stack = createStackNavigator();
  
    return (
      <ListingsProvider>
        <Stack.Navigator>
          <Stack.Screen
            name="ProfileMain"
            component={ProfileMain}
            options={{ headerShown: false, headerTitle: "Back" }}
          />
          <Stack.Screen
            name="CreateListing"
            component={CreateListing}
            options={{ headerShown: true, headerTitle: "", headerTintColor: '#0e165c' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{ headerShown: true, headerTitle: "", headerTintColor: '#0e165c' }}
          />
        </Stack.Navigator>
      </ListingsProvider>
    );
  }
  
  const ProfileMain = () => {
    const navigation = useNavigation();
    const { userData, likedListingsData } = useContext(AuthContext);
    const { userListings } = useContext(ListingsContext);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
  
    const handleSignOut = () => {
      signOut(auth).then(() => {
        Alert.alert("Sign out successful.");
      }).catch((error) => {
        Alert.alert("Error", "Sign out unsuccessful.");
      });
    };
  
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
              <Text style={{fontFamily: 'optima'}}> email: {userData.email} </Text>
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
              <Text style={{fontFamily: 'optima'}}> email: </Text>
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
              <TouchableOpacity style={styles.listingImage} />
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
        </ScrollView>
  
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignOut}
          >
            <Text style={{fontFamily: 'optima'}}>Sign out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={{fontFamily: 'optima'}}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setHelpModalVisible(true)}
          >
            <Text style={{fontFamily: 'optima'}}>Help</Text>
          </TouchableOpacity>
        </View>
  
        <Modal
          animationType="slide"
          transparent={true}
          visible={helpModalVisible}
          onRequestClose={() => setHelpModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Campus Closet FAQs</Text>
              
              <Text style={styles.boldModalText}>What is Campus Closet?</Text>
              <Text style={styles.modalText}>Campus Closet was created to give UNC students the ability to rent 
                and sell clothes to each other to solve two achieve two goals: increased 
                sustainability, and not running out of cute outfits.</Text>

                <Text style={styles.boldModalText}>How does it work?</Text>
              <Text style={styles.modalText}>You can list your clothing items for rent, sale, or both! 
              You are able to rent from your fellow Tar Heels in increments of 3 days. After purchase 
              or rental, you will communicate with your seller and arrange a pick up/drop off.</Text>

              <Text style={styles.boldModalText}>What if my rented item comes back damaged?</Text>
              <Text style={styles.modalText}>Campus Closet is not responsible for any damage to your items. Upon registration,
              a user agrees to terms and conditions which oblige them repair or reimburse any damage to rented items. </Text>
              <Text style={{fontFamily: 'optima',}}>If you would like to submit a report, email to unccampuscloset@gmail.com</Text>
              

            <View style={[styles.buttonContainer]}>
              <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setHelpModalVisible(false)}
                >

                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => console.log("terms and conditions")}
                >

                <Text style={styles.closeButtonText}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>
              
            </View>
          </View>
        </Modal>
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
      fontWeight: "500",
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
      alignSelf: 'center',
      position: 'absolute',
      bottom: 10,
      backgroundColor: '#fff',
      width: '100%',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: 'lightgrey',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      margin: 10,
    },
    bioText: {
      textAlign: 'center',
      fontWeight: "200",
      fontFamily: 'optima',
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
      fontFamily: 'optima',
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
      alignItems: 'center',
      paddingBottom: 100, // Add padding to avoid overlap with bottom buttons
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
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    modalContent: {
      width: "80%",
      backgroundColor: "#fff",
      borderRadius: 8,
      padding: 20,
      alignItems: "center",
      maxHeight: "70%"
    },
    modalTitle: {
      fontSize: 18,
      marginBottom: 20,
      fontFamily: 'optima',
    },
    modalText: {
      fontSize: 14,
      marginBottom: 20,
      fontFamily: 'optima',
    },
    boldModalText: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'optima',
      },
    closeButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: "navy",
      borderRadius: 8,
      marginHorizontal: 5
    },
    closeButtonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: 'optima',
    }
});