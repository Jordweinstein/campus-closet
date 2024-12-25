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
    const { getOfferByListingId } = useContext(OffersContext);
    const [loading, setLoading] = useState(false);
    const [offer, setOffer] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        initializePaymentSheet();
        console.log("Called initPaymentSheet")

        const fetchOffer = async () => {
            const fetchedOffer = await getOfferByListingId(listing.id);
            setOffer(fetchedOffer);
        };

        fetchOffer();
    }, []);

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
        if (!offer) return; 

        setLoading(true);
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

            if (error) {
                console.error('Error initializing payment sheet:', error);
                Alert.alert('Payment initialization failed', error.message);
            }
        } catch (error) {
            console.error('Error initializing payment sheet:', error);
            Alert.alert('Payment initialization failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const openPaymentSheet = async () => {
        console.log("about to call present");
        const { error } = await presentPaymentSheet();
        if (!error) {
            Alert.alert('Success', 'Your order is confirmed!');
            navigation.navigate('ProfileMain');
        }
    };

    return (
        loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        ) : (
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
                            <Text>Confirm Purchase: ${offer.price}</Text>
                        )
                    )}
                </View>
                <TouchableOpacity
                    onPress={openPaymentSheet}
                    style={styles.checkoutButton}
                    disabled={loading}
                >
                    <Text style={styles.checkoutText}>Checkout</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
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
