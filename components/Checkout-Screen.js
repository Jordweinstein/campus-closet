import React, { useState, useContext, useEffect } from 'react';
import { View, Button, Alert, Platform, Linking } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { AuthContext } from '../contexts/authContext';
import stripeService from '../util/stripeService';

export default function CheckoutScreen({ route }) {
    const { listing } = route.params;
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { userData, getAccountId } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleDeepLink = (event) => {
            let { url } = event;
            if (url.includes('stripe-redirect')) {
                Alert.alert('Stripe Redirect', 'Returned from Stripe!');
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        initializePaymentSheet();

        return () => {
            subscription.remove();
        };
    }, []);

    const initializePaymentSheet = async () => {
        const targetId = await getAccountId(listing.owner);
        const customerId = userData.customerId;
        const amount = getPrice(listing);
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
            if (!error) {
                setLoading(true);
            }
        } catch (error) {
            console.error('Error initializing payment sheet:', error);
            Alert.alert('Payment initialization failed', error.message);
        }
    };

    const getPrice = (listing) => {
        if (listing.price.length === 2) {
            return parseInt(listing.price[1], 10) * 100; 
        }
        return parseInt(listing.price[0], 10) * 100; 
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();
        if (error) {
            Alert.alert(`Payment Error: ${error.code}`, error.message);
        } else {
            Alert.alert('Success', 'Your order is confirmed!');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button
                title="Checkout"
                onPress={openPaymentSheet}
                disabled={!loading}
            />
        </View>
    );
}