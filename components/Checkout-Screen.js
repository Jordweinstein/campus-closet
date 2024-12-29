import React, { useState, useContext, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, Linking, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { AuthContext } from '../contexts/authContext';
import stripeService from '../util/stripeService';
import { Image as ExpoImage } from 'expo-image';
import { SwiperFlatList } from "react-native-swiper-flatlist";
import { OffersContext, OffersProvider } from '../contexts/offersContext';
import { useNavigation } from '@react-navigation/native';

export default function Checkout({ route }) {
    return (
        <OffersProvider>
            <CheckoutScreen route={route} />
        </OffersProvider>
    );
}

const CheckoutScreen = ({ route }) => {
    const { listing } = route.params;
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { userData, getAccountId } = useContext(AuthContext);
    const { getOfferByListingId, finalizeOffer } = useContext(OffersContext);
    const [offer, setOffer] = useState(null);
    const [paymentSheetReady, setPaymentSheetReady] = useState(false);
    const navigation = useNavigation();
    console.log(paymentSheetReady);

    useEffect(() => {
        const fetchOffer = async () => {
            const fetchedOffer = await getOfferByListingId(listing.id);
            setOffer(fetchedOffer);  // This triggers a re-render
            console.log("FETCHED " + JSON.stringify(fetchedOffer));
        };
    
        fetchOffer();
    }, []);
    
    useEffect(() => {
        if (offer) { 
            console.log("OFF IN EFF: " + JSON.stringify(offer));
            initializePaymentSheet();
        }
    }, [offer]);

    const formatDateRange = (start, end) => {
        const startDate = new Date(start.seconds * 1000);
        const endDate = new Date(end.seconds * 1000);
        const sMonth = startDate.getMonth() + 1;
        const sDay = startDate.getDate();
        const eMonth = endDate.getMonth() + 1;
        const eDay = endDate.getDate();
        return `${sMonth}/${sDay} to ${eMonth}/${eDay}`;
    };

    const initializePaymentSheet = async () => {
        console.log("OFFER IN INIT: " + offer);
        if (!offer) return; 

        const targetId = await getAccountId(listing.owner);
        const customerId = userData.customerId;
        const amount = offer.price * 100;
        const currency = "usd";
        const data = { customerId, amount, currency, targetId };

        try {
            const {
                paymentIntent,
                ephemeralKey,
                customer
            } = await stripeService.fetchPaymentParams(data);

            const { error } = await initPaymentSheet({
                merchantDisplayName: "Campus Closets, Inc.",
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                allowsDelayedPaymentMethods: false,
                defaultBillingDetails: {
                    name: 'Jane Doe',
                },
                returnURL: "campus-closets://redirect"
            });
            console.log("ERROR:" + error);
            console.log("successfully initialized payment sheet");

            if (error) {
                console.error('Error initializing payment sheet:', error);
                Alert.alert('Payment initialization failed', error.message);
            }
            setPaymentSheetReady(true);

        } catch (error) {
            console.error('Error initializing payment sheet:', error);
            Alert.alert('Payment initialization failed', error.message);
        } 
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();
        if (!error) {
            finalizeOffer(offer.id); 
            Alert.alert('Success', 'Your order is confirmed!\n\nVisit the Previous Transactions page to contact your seller.');
            navigation.navigate('ProfileMain');
        } else {
            console.log("ERROR opening payment sheet: " + JSON.stringify(error));
        }
    };

    return (
        <SafeAreaView style={[styles.screen, styles.dates]}>
            <View style={styles.imageContainer}>
                <SwiperFlatList index={0} showPagination>
                    {listing.images.map((image, index) => (
                        <View key={index}>
                            <ExpoImage
                                source={{ uri: image || "https://picsum.photos/200" }}
                                cachePolicy="memory-disk"
                                contentFit="cover"
                                style={styles.image}
                            />
                        </View>
                    ))}
                </SwiperFlatList>
            </View>
            <View style={styles.textView}>
                {offer && (
                    offer.isRental ? (
                        <View style={styles.dates}>
                            <Text style={styles.header}>Confirm Rental: ${offer.price}</Text>
                            <Text style={styles.subHeader}>{formatDateRange(offer.rentalPeriod[0], offer.rentalPeriod[1])}</Text>
                        </View>
                    ) : (
                        <Text style={styles.header}>Confirm Purchase: ${offer.price}</Text>
                    )
                )}
            </View>
            <TouchableOpacity
                onPress={openPaymentSheet}
                style={!paymentSheetReady ? styles.checkoutButtonDisabled : styles.checkoutButton}
                disabled={!paymentSheetReady}
            >
                <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        aspectRatio: 1,
        borderRadius: 10,
    },
    imageContainer: {
        width: "80%",
        aspectRatio: 1,
        alignSelf: "center",
        backgroundColor: "white",
        margin: 20,
    },
    checkoutButton: {
        backgroundColor: '#000747',
        padding: 10,
        alignItems: 'center',
        borderRadius: 10,
        position: 'absolute',
        bottom: 10, 
        left: 15,
        right: 15,
    },
    checkoutButtonDisabled: {
        backgroundColor: '#e2e2e2', 
        padding: 10,
        alignItems: 'center',
        borderRadius: 10,
        position: 'absolute',
        bottom: 10,
        left: 15,
        right: 15,
    },
    checkoutText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'optima',
    },
    screen: {
        height: '100%',
    },
    header: {
        fontFamily: "optima",
        fontSize: 24,
        fontWeight: "bold",
        margin: 20,
    },
    subHeader: {
        fontFamily: "optima",
        fontSize: 18,
        fontWeight: 400,
    },
    dates: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    }
});
