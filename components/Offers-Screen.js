import React, { useContext, useEffect, useState } from "react";
import { Text, FlatList, Dimensions, StyleSheet, View, Image, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { OffersProvider, OffersContext } from "../contexts/offersContext";
import { Entypo } from '@expo/vector-icons';
import { ListingsContext, ListingsProvider } from '../contexts/listingContext';
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import { AuthContext } from "../contexts/authContext";
import { doc, getDoc } from "@firebase/firestore";
import db from "../firebase/db";

export default function OffersContainer() {
    return (
        <ListingsProvider>
            <OffersProvider>
                <Offers />
            </OffersProvider>
        </ListingsProvider>
    );
}

const { width } = Dimensions.get('window');

const Offers = () => {
    const [loading, setLoading] = useState(true);  
    const { respondOffer, activeOffers, acceptedOffers, finalizeOffer, inactiveOffers } = useContext(OffersContext);
    const { fetchListingsByIds } = useContext(ListingsContext);
    const { user } = useContext(AuthContext);
    const [acceptedListings, setAcceptedListings] = useState([]);
    const [instaUsernames, setInstaUsernames] = useState({});
    const navigation = useNavigation();

    
    useEffect(() => {
        const fetchAcceptedOffers = async () => {
            listingIds = [];
            if (acceptedOffers.length > 0) {
                for (let i = 0; i < acceptedOffers.length; i++) {
                    listingIds.push(acceptedOffers[i].listing);
                }
                const offers = await fetchListingsByIds(listingIds);
                setAcceptedListings(offers);
            }
            setLoading(false);
        };

        fetchAcceptedOffers();
    }, [acceptedOffers]);

    const handleRespond = (response, offer) => {
        const message = (response === "accept") ?
            "If you accept this offer, you agree to the terms and conditions which include actively checking your direct messages (via Instagram) to arrange for pickup with the buyer/renter" :
            "Are you sure you would like to reject this offer?";
        response = response.charAt(0).toUpperCase() + response.slice(1);
        Alert.alert(
            `${response} Offer`,
            message,
            [
                { text: "Cancel", style: "cancel" },
                { text: response, onPress: () => respondOffer(offer, response) }
            ]
        );
    };

    const fetchInstaById = async (userId) => {
        try {
            const docRef = doc(db, "users", userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return data.insta || 'N/A';
            } else {
                console.log("No such document!");
                return 'N/A';
            }
        } catch (error) {
            console.log("error fetching insta by id in screen" + error);
            return 'N/A';
        }
    };

    const loadInstaUsernames = async (offers) => {
        if (!instaUsernames) {
            setInstaUsernames([]);
            return;
        }
        const usernames = { ...instaUsernames }; 
        for (const offer of offers) {
            if (!usernames[offer.owner]) {
                usernames[offer.owner] = await fetchInstaById(offer.owner);
            }
            if (!usernames[offer.sender]) {
                usernames[offer.sender] = await fetchInstaById(offer.sender);
            }
        }
        setInstaUsernames(usernames);
    };

    useEffect(() => {
        if (acceptedListings.length > 0) {
            loadInstaUsernames(acceptedListings);
        }
        if (activeOffers.length > 0) {
            loadInstaUsernames(activeOffers);
        }
    }, [acceptedListings, activeOffers]);

    const formatDateRange = (start, end) => {
        const startDate = start.toDate();
        const endDate = end.toDate();

        const sMonth = startDate.getMonth() + 1;
        const sDay = startDate.getDate();
        const eMonth = endDate.getMonth() + 1;
        const eDay = endDate.getDate();

        return `${sMonth}/${sDay} to ${eMonth}/${eDay}`;
    };

    const renderOffer = ({ item }) => (
        <View style={styles.offerContainer}>
            <Image
                source={{ uri: item.offerImg }}
                style={styles.image}
            />
            <View style={styles.textContainer}>
                <Text style={styles.text}>{item.offerItem}</Text>
                {(item.isRental) ? (
                    <>
                    <Text style={styles.text}>Rent ${item.price}</Text>
                    <Text style={styles.text}>{formatDateRange(item.rentalPeriod[0], item.rentalPeriod[1])} </Text>
                    </>
                ):
                    <Text style={styles.text}>Buy ${item.price}</Text>
                }
                <Text style={styles.text}>From: @{instaUsernames[item.sender] || 'N/A'}</Text>
            </View>
            {(item.isAccepted) ? 
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => {
                        Alert.alert(
                            "Finalize Offer",
                            `Are you sure you would like to mark this item as ${(item.isRental) ? "Rented" : "Sold"}? \n\n If sold, this will delete your listing from Campus Closet, and if rented the requested dates will be blocked off from other rentals.`,
                            [
                                {text: "Cancel", style: "cancel"},
                                {text: "Confirm", onPress: ()=> finalizeOffer(item.id)}
                            ]
                        );
                    }}
                >
                    <Text>Mark as {(item.isRental) ? "Rented" : "Sold"}</Text>
                </TouchableOpacity>
            :
                <>
                    <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleRespond('reject', item.id)}>
                    <Entypo name="cross" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleRespond('accept', item.id)}>
                        <Entypo name="check" size={22} color="black" />
                    </TouchableOpacity>
                </>
            }
        </View>
    );

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.description}>
                <Text style={[styles.header, {color: "white"}]}>How do offers work?</Text>
                <SwiperFlatList index={0} showPagination>
                    <View style={styles.viewContainer}>
                        <Text style={styles.p}>
                            1. Send an offer{'\n'} 
                            2. The seller will accept/reject your offer. If accepted it will show up here in "Accepted Offers"{'\n'}
                            3. Direct message the username displayed via Instagram to arrange for pickup and payment{'\n'}
                        </Text>
                    </View>
                    <View style={styles.viewContainer}>
                        <Text style={styles.p}>
                            1. Received offers display under "Received Offers" to be accepted or rejected.{'\n'}
                            2. If you accept, the buyer/renter is notified and you can finalize the offer. If you reject, the offer disappears.{'\n'}
                            3. Once the sale is final and the exchange has been made, you can mark the item as rented/sold. If purchased, the listing will be deleted.
                        </Text>
                    </View>
                </SwiperFlatList>
            </View>
            <View style={styles.acceptedDisplay}>   
                <Text style={styles.header}>Accepted Offers</Text>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollViewStyle}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {acceptedListings.length === 0 ?
                        <View style={styles.listingImagePlaceholder}></View>
                        :
                        acceptedListings.map((listing) => (
                            <TouchableOpacity 
                                key={listing.id} 
                                onPress={() => navigation.navigate('ListingScreen', { listing })}
                                style={styles.imgContainer}
                            >
                                <Image
                                    source={{ uri: listing.images[0] || 'https://picsum.photos/200/300' }}
                                    style={styles.listingImage}
                                />
                                <Text style={styles.username}>@{instaUsernames[listing.owner]}</Text>
                            </TouchableOpacity>
                        ))}
                </ScrollView>
            </View>
            
            <View style={styles.receivedDisplay}>
                <Text style={styles.header}>Received Offers</Text>
                {(activeOffers.length === 0) ? 
                    <View style={styles.offerPlaceholder} />
                :
                    <FlatList
                        data={activeOffers}
                        renderItem={renderOffer}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                    />
                }
            </View>
            

            {/* Button to navigate to another screen */}
            <TouchableOpacity 
                style={styles.navigationButton} 
                onPress={() => {
                    navigation.navigate('Archived');
                }}
            >
                <Text style={styles.navigationButtonText}>View Archived Offers</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 10,
    },
    offerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
    },
    acceptedDisplay: {
        height: '25%'
    },
    
    offerPlaceholder: {
        backgroundColor: '#ddd',
        borderRadius: 5,
        width: '90%',
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
        alignSelf: 'center',
        marginTop: 10,
    },
    header: {
        fontFamily: "optima",
        fontSize: 18,
        paddingTop: 10,
        paddingLeft: 10,
        fontWeight: "semibold",
    },
    image: {
        width: 75,
        height: 75,
        borderRadius: 5,
        marginRight: 20,
        margin: 5,
    },
    textContainer: {
        flex: 1,
    },
    iconButton: {
        padding: 5,
    },
    text: {
        fontFamily: 'optima',
        fontSize: 14
    },
    title: {
        paddingTop: 10,
        paddingLeft: 10,
        fontSize: 18,
        fontWeight: 500
    },
    scrollViewStyle: {
        width: '100%',
    },
    scrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    listingImage: {
        width: 125,
        height: 125,
        borderRadius: 5,
        marginRight: 10,
    },
    listingImagePlaceholder: {
        width: 125,
        height: 125,
        borderRadius: 5,
        backgroundColor: '#ddd',
        marginRight: 10,
    },
    p: {
        fontFamily: "optima",
        padding: 10,
        color: "white"
    },
    description: {
        backgroundColor: "#000747",
        padding: 3,
    },
    button: {
        padding: 10,
        backgroundColor: 'lightgray',
        borderRadius: 5,
        marginRight: 5,
    },
    viewContainer: {
        width: width,
        alignItems: 'center',
        padding: 5,
    },
    username: {
        fontSize: 14,
        fontFamily: "optima",
        padding: 5,
    },
    navigationButton: {
        backgroundColor: '#000747',
        padding: 10,
        alignItems: 'center',
        borderRadius: 10,
        position: 'absolute',
        bottom: 10, 
        left: 15,
        right: 15,
    },
    navigationButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'optima',
    },
});
