import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
#
export default function Listing( { route }) {
    const { item } = route.params;
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(true);

    const handleLike = () => {
        if (!isLiked) {
            setLikeCount(likeCount - 1);
            setIsLiked(true);
            // add item to users liked listings
        } else {
            setLikeCount(likeCount + 1);
            setIsLiked(false); 
            // remove item from users liked listings 
        }
    }

    return (
        <SafeAreaView style={ styles.container }>
            <Image 
                source={{ uri: 'https://picsum.photos/200/300'}}
                style={styles.image}
            />
            <View style= {styles.contentContainer}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <View style={{ flexDirection: 'row'}}>
                        {item.purchaseMode && Object.entries(item.purchaseMode).map(([mode, price], index) => (
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
                            <AntDesign name= {(isLiked) ? "hearto" : "heart"} size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={{margin: 10}}>
                            {(likeCount === 0) ? '' : likeCount}
                        </Text>
                    </View>
                     
                </View>

                <View style={styles.hContainer}>
                    <Text style={{paddingRight: 15, fontSize: 20, fontWeight: 'bold'}}>
                        {( item.brand || "No Brand" )+ "   ‣"}
                    </Text>
                    <Text style={{fontSize: 20}}>{ item.category || "No Category"}</Text>
                </View>
                <View style={styles.hContainer}><Text>{item.description}</Text></View>
                <View style={styles.hContainer}>
                    <Text style={{fontWeight: 'bold'}}>Size: </Text>
                    <Text>{item.size}</Text>
                </View>

                <View style= {styles.hContainer}>
                    {item.tags && item.tags.map((tag, index) => (
                        <View key={index} style={styles.categoryTag}>
                            <Text style={styles.customText}>{tag}</Text>
                        </View>
                    ))}
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
        width: '80%',
        height: '50%',
        margin: 20,
        borderRadius: 20,
        borderColor: 'black',
        borderWidth: 1
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
})