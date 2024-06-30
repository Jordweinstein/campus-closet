import React, { useState, useContext, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { AuthContext } from '../contexts/authContext';

export default function Listing({ route }) {
    const { listing } = route.params;
    const { addLikedListing, removeLikedListing, likedListings } = useContext(AuthContext);
    const [isLiked, setIsLiked] = useState(likedListings.includes(listing.id));
    const [likeCount, setLikeCount] = useState(listing.likes);

    useEffect(() => {
        setIsLiked(likedListings.includes(listing.id));
    }, [likedListings, listing.id]);

    const handleLike = async () => {
        if (isLiked) {
            setIsLiked(false);
            setLikeCount(likeCount - 1);
            await removeLikedListing(listing.id);
        } else {
            setIsLiked(true);
            setLikeCount(likeCount + 1);
            await addLikedListing(listing.id);
        }
    };

    return (
        <SafeAreaView style={ styles.container }>
            <View style={styles.imageContainer}>
                <SwiperFlatList
                    index={0}
                    showPagination
                >
                {listing.images.map((image, index) => (
                    <View key={index}>
                        <Image source={{ uri: image }} style={styles.image} />
                    </View>
                ))}
                </SwiperFlatList>
            </View>
            <View style= {styles.contentContainer}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View style={{ flexDirection: 'row'}}>
                        {listing.purchaseMethod && Object.entries(listing.purchaseMethod).map(([mode, price], index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.purchaseButton}
                                onPress={() => console.log(`${mode} Button Pressed!`)}
                            >
                                <Text style={styles.buttonText}>{mode} ${price}</Text>
                            </TouchableOpacity>         
                        ))}   
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', paddingBottom: 7}}>
                        <TouchableOpacity
                            onPress={handleLike}
                        >
                            <AntDesign name={isLiked ? "heart" : "hearto"} size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={{margin: 10}}>
                            {likeCount === 0 ? '' : likeCount}
                        </Text>
                    </View>
                </View>

                <View style={styles.hContainer}>
                    <Text style={{paddingRight: 15, fontSize: 20, fontWeight: 'bold'}}>
                        {( listing.brand || "No Brand" )+ "   ‣"}
                    </Text>
                    <Text style={{fontSize: 20}}>{ listing.category || "No Category"}</Text>
                </View>
                <View style={styles.hContainer}><Text>{listing.description}</Text></View>
                <View style={styles.hContainer}>
                    <Text style={{fontWeight: 'bold'}}>Size: </Text>
                    <Text>{listing.size}</Text>
                </View>

                <View style={styles.categoryTag}>
                    <Text style={styles.customText}>{listing.tags}</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 20,
        padding: 20,
    },
    contentContainer: {
        flex: 1,  
        justifyContent: 'space-evenly',  
        width: '80%',  
    },
    hContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems:'flex-end',
        width: '80%',
        marginBottom: 15
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        aspectRatio: 1,
        borderRadius: 10,
    },
    imageContainer: {
        width: '80%',
        aspectRatio: 1,
        alignSelf: 'center',
        backgroundColor: 'white',
    },
    customText: {
        padding: 5
    },
    categoryTag: {
        backgroundColor: "#c4dbff",
        alignItems: 'center',
        borderRadius: 30,
        minWidth: 70, 
        padding: 5,
        marginRight: 10
    },
    purchaseButton: {
        backgroundColor: 'white',
        padding: 5,
        marginBottom:15,
        marginRight: 15,
        borderRadius: 10,
        borderColor: 'black',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
        height: 40
    },
    buttonText: {
        color: 'navy',
        fontSize: 16
    }
});