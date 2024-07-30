import React, { useContext, useEffect, useState } from "react";
import { Text, FlatList, StyleSheet, View, Image, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { OffersProvider, OffersContext } from "../contexts/offersContext";
import { Entypo } from '@expo/vector-icons';
import { ListingsContext, ListingsProvider } from '../contexts/listingContext';
import { ScrollView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

export default function OffersContainer() {
    return (
        <ListingsProvider>
            <OffersProvider>
                <Offers />
            </OffersProvider>
        </ListingsProvider>
    );
}


const Offers = () => {
    const { respondOffer, receivedOffers, acceptedListings } = useContext(OffersContext);
    const { fetchListingsByIds } = useContext(ListingsContext);
    const [acceptedOffers, setAcceptedOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation(); 

    useEffect(() => {
        const fetchAcceptedOffers = async () => {
            setLoading(true);
            const offers = await fetchListingsByIds(acceptedListings);
            setAcceptedOffers(offers);
            setLoading(false);
        }

        fetchAcceptedOffers();
    }, [acceptedListings]);

    const handleRespond = (response, offer) => {
        const message = (response === "accept") ?
            "If you accept this offer, you agree to the terms and conditions which include actively checking your direct messages (via Instagram) to arrange for pickup with the buyer/renter" :
            "Are you sure you would like to reject this offer?"
        response = response.charAt(0).toUpperCase() + response.slice(1);
        Alert.alert(
            `${response} Offer`,
            message,
            [
                { text: "Cancel", style: "cancel" },
                { text: response, onPress: () => respondOffer(offer, response) }
            ]
        )
    }

    const renderOffer = ({ item }) => (
        <View style={styles.offerContainer}>
            <Image 
                source={{ uri: item.offerImg }}
                style={styles.image}
            />
            <View style={styles.textContainer}>
                <Text style={styles.text}>{item.offerItem}</Text>
                <Text style={styles.text}>{item.price}</Text>
            </View>
            <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => handleRespond('reject', item.id)}>
                <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleRespond('accept', item.id)}>
                <Entypo name="check" size={22} color="black" />            
            </TouchableOpacity>
        </View>
    );

    return (
        loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        ) : (
            <SafeAreaView>
                <Text style={styles.header}>Accepted Offers</Text>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollViewStyle}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {acceptedOffers.length === 0 ? 
                    <View style={styles.listingImagePlaceholder}></View>
                    :
                    acceptedOffers.map((listing) => (
                        <TouchableOpacity key={listing.id} onPress={() => navigation.navigate('ListingScreen', { listing })}>
                            <Image
                                source={{ uri: listing.images[0] || 'https://picsum.photos/200/300' }}
                                style={styles.listingImage}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.header}>Received Offers</Text>
                <FlatList
                    data={receivedOffers}
                    renderItem={renderOffer}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            </SafeAreaView>
        )
    );
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
    }
});