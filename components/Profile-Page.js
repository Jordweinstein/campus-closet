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
import Offers from './Offers-Screen';
import { AuthContext } from '../contexts/authContext';
import { ListingsContext, ListingsProvider } from '../contexts/listingContext';
import SwiperFlatList from 'react-native-swiper-flatlist';
import Login from './Login-Screen';

export default function Profile() {
    const Stack = createStackNavigator();
  
    return (
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
          <Stack.Screen
            name="Offers"
            component={Offers}
            options={{ headerShown: true, headerTitle: "", headerTintColor: '#0e165c' }}
          />
         
        </Stack.Navigator>
    );
  }
  
  const ProfileMain = () => {
    const navigation = useNavigation();
    const { userData, likedListingsData } = useContext(AuthContext);
    const { userListings } = useContext(ListingsContext);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
  
    const handleSignOut = () => {
      signOut(auth).then(() => {
        navigation.navigate(Login);
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
  
          <View style={styles.textContainer}>
            <Text style={styles.h2}>My Listings</Text>
            <TouchableOpacity style={[styles.offerButton, {marginLeft: '30%'}]} onPress={() => navigation.navigate('Offers')}>
              <Text style={styles.closeButtonText}>View Offers</Text>
            </TouchableOpacity>
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
              <Text style={styles.modalTitle}>Campus Closet FAQs (Swipe!)</Text>
              <View style={{width: 250, height: 300}}>
                <SwiperFlatList
                  
                  data={faqs}
                  renderItem={({ item }) => (
                    <View style={styles.questionView}>
                      <Text style={styles.boldModalText}>{item.title}</Text>
                      <Text style={styles.modalText}>{item.content}</Text>
                    </View>
                  )}
                />
              </View>

            <View style={[styles.buttonContainer]}>
              <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setHelpModalVisible(false)}
                >

                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                
              </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  )};
  
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
    questionView: {
      flex: 1,
      alignItems: 'center',
      padding: 10,
      width: 250,
    },
    profileContainer: {
      alignItems: 'center',
      marginVertical: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      backgroundColor: '#fff',
      width: '100%',
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: 'lightgrey',
      position: 'absolute',
      bottom: 0,  
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
    },
    bioContainer: {
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      width: '50%',
      margin: 10,
    },
    h2: {
      fontSize: 18,
      fontFamily: 'optima',
      marginBottom: 10,
      marginTop: 20,
      textAlign: 'left',
    },
    textContainer: {
      paddingHorizontal: 20,
      width: '100%',
      marginBottom: 10,
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
      marginLeft: 10,
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
      paddingLeft: '2%',
    },
    scrollVerticalContainer: {
      flexDirection: 'column',
      flexWrap: 'wrap',
      alignItems: 'center',
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
      marginTop: 10,
      marginBottom: 10,
      borderRadius: 10,
      width: '35%',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "80%",
      backgroundColor: "#fff",
      borderRadius: 8,
      padding: 20,
      alignItems: "center",
      height: "40%"
    },
    modalTitle: {
      fontSize: 18,
      marginBottom: 10,
      fontFamily: 'optima',
    },
    modalText: {
      fontSize: 14,
      marginBottom: 10,
      fontFamily: 'optima',
    },
    offerButton: {
      padding: 10,
      backgroundColor: "#000747",
      borderRadius: 8,
      marginHorizontal: 5,
      marginTop: 10,
    },
    boldModalText: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: 'optima',
      },
    closeButton: {
      marginTop: 10,
      marginBottom: 10,
      padding: 10,
      backgroundColor: "#000747",
      borderRadius: 8,
      marginHorizontal: 5,
    },
    closeButtonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: 'optima',
    }
});

const faqs =[
  {
    title: "What is Campus Closet?",
    content: "Campus Closet was created to give UNC students the ability to rent " +
             "and sell clothes to each other to solve two achieve two goals: increased " +
             "sustainability, and not running out of cute outfits."
  },
  {
    title: "How does it work?",
    content: "You can list your clothing items for rent, sale, or both! " +
             "You are able to rent from your fellow Tar Heels in increments of 3 days. After purchase " +
             "or rental, you will communicate with your seller and arrange a pick up/drop off."
  },
  {
    title: "What if my rented item comes back damaged?",
    content: "Campus Closet is not responsible for any damage to your items. Upon registration, " +
             "a user agrees to terms and conditions which oblige them to repair or reimburse any damage to rented items. " +
             "If you would like to submit a report, email to unccampuscloset@gmail.com"
  }
];