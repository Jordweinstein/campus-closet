import React, { useContext, useState, useEffect } from "react";
import { Text, View, Image, FlatList, Dimensions, StyleSheet, SafeAreaView } from "react-native";
import { OffersContext, OffersProvider } from "../contexts/offersContext";
import { AuthContext } from "../contexts/authContext";
import { doc, getDoc } from "@firebase/firestore";
import db from "../firebase/db";

const screenWidth = Dimensions.get('window').width;

export default function Archived() {
    return (
        <OffersProvider>
            <ArchivedOffers />
        </OffersProvider>
    );
}

const ArchivedOffers = () => {
    const { inactiveOffers, inactiveSentOffers } = useContext(OffersContext);
    const { user } = useContext(AuthContext);
    const [usernames, setUsernames] = useState({});

    useEffect(() => {
        const fetchUsernames = async () => {
            if ((!inactiveOffers || inactiveOffers.length === 0) && 
                (!inactiveSentOffers || inactiveSentOffers.length === 0)) {
                return;
            }

            const allUserIds = [
                ...inactiveOffers.map(offer => offer.sender),
                ...inactiveOffers.map(offer => offer.receiver),
                ...inactiveSentOffers.map(offer => offer.sender),
                ...inactiveSentOffers.map(offer => offer.receiver)
            ];
            const uniqueIds = [...new Set(allUserIds)]; // Remove duplicates

            const usernamePromises = uniqueIds.map(async id => {
                const docRef = doc(db, "users", id);
                const docSnap = await getDoc(docRef);
                return { id, username: docSnap.exists() ? docSnap.data().insta : 'N/A' };
            });

            const users = await Promise.all(usernamePromises);
            const newUsernames = users.reduce((acc, { id, username }) => {
                acc[id] = username;
                return acc;
            }, {});

            setUsernames(newUsernames);
        };

        fetchUsernames();
    }, [inactiveOffers, inactiveSentOffers]);

    const formatDateRange = (start, end) => {
        const startDate = start.toDate();
        const endDate = end.toDate();

        const sMonth = startDate.getMonth() + 1;
        const sDay = startDate.getDate();
        const eMonth = endDate.getMonth() + 1;
        const eDay = endDate.getDate();

        return `${sMonth}/${sDay} to ${eMonth}/${eDay}`;
    };

    const renderOffer = ({ item }) => {
        if (!item) return null;  // Null check to ensure item exists

        return (
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
                            <Text style={styles.text}>{formatDateRange(item.rentalPeriod[0], item.rentalPeriod[1])}</Text>
                        </>
                    ) : (
                        <Text style={styles.text}>Buy ${item.price}</Text>
                    )}
                    <Text style={styles.text}>
                        {(item.sender === user.uid) ? 
                            `To: @${usernames[item.receiver] || 'N/A'}` : 
                            `From: @${usernames[item.sender] || 'N/A'}`
                        }
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Completed Transactions</Text>
            </View>
            <View style={styles.display}>
                <Text style={{ fontFamily: 'optima', fontSize: 18 }}>Received Offers</Text>
                {inactiveOffers && inactiveOffers.length > 0 ? (
                    <FlatList
                        data={inactiveOffers}
                        renderItem={renderOffer}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                    />
                ) : (
                    <Text style={styles.text}>No received offers</Text>
                )}
            </View>
            <View style={styles.display}>
                <Text style={{ fontFamily: 'optima', fontSize: 18 }}>Sent Offers</Text>
                {inactiveSentOffers && inactiveSentOffers.length > 0 ? (
                    <FlatList
                        data={inactiveSentOffers}
                        renderItem={renderOffer}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                    />
                ) : (
                    <Text style={styles.text}>No sent offers</Text>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    offerContainer: {
        width: '100%', 
        backgroundColor: 'lightgray',
        flexDirection: 'row',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        alignSelf: 'center', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
    },
    image: {
        width: 75,
        height: 75,
        borderRadius: 5,
        marginRight: 10, 
    },
    textContainer: {
        flex: 1, 
        justifyContent: 'center', 
    },
    header: {
        backgroundColor: '#000747',
        justifyContent: 'center',
        height: '10%',
    },
    headerText: {
        fontFamily: 'optima',
        alignSelf: 'center',
        fontSize: 20,
        color: 'white',
    },
    listContainer: {
        padding: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', 
    },
    display: {
        flex: 1,
        borderRadius: 10,
        margin: 15,
    },
    text: {
        fontFamily: 'optima',
        fontSize: 16,
    }
});
