import React, {useState} from 'react';
import { 
    SafeAreaView, 
    ScrollView,
    Image, 
    Text, 
    View, 
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import "react-native-gesture-handler";
import Ionicons from '@expo/vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import ListingScreen from './Listing-Screen'; 

export default function Shop() {

    const Stack = createStackNavigator();

    return (
        <Stack.Navigator>
            <Stack.Screen 
                name = "ShopMain" 
                component = { ShopMain }
                options = {{ headerShown: false, headerTitle: "Back"}}
            />
            <Stack.Screen 
                name = "ListingScreen" 
                component = { ListingScreen }
                options = {{ headerTitle: "", headerTintColor: "black"}}
            />
        </Stack.Navigator>
    )
}


const ShopMain = ({navigation}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState(items);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query) {
            const filtered = items.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredItems(filtered);
        } else {
            setFilteredItems(items);
        }
    };


    return (
        <SafeAreaView>
            <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollVerticalContainer} 
            >
                <Text style={styles.title}>Shop</Text>

                <View style={styles.textContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                </View>

                <View style={styles.container}>
                <View style={styles.textContainer2}>
                <Ionicons name="funnel" size = {20} color = "black"/>               
                </View>
                <View style={styles.textContainer2}>
                    <Text style={styles.h3}> My sizes </Text>
                </View>
                <View style={styles.textContainer3}>
                    <Text style={styles.h3}> Avalibility </Text>
                </View>
                <View style={styles.textContainer4}>
                    <Text style={styles.h3}> Delivery </Text>
                </View>
                </View>

                <View style={styles.container2}>
                <View style={styles.rowContainer}>
                    <View style={styles.gridItem}>
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 200, height: 300, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                    <Text>Reformation High Rise </Text>
                    <Text style = {{fontSize: 13, fontWeight: 2}}> Rent: $27 Size M </Text>
                    </View>
                    <View style={styles.gridItem}>
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 200, height: 300, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                    <Text> Siedres Cow Print Top </Text>
                    <Text style = {{fontSize: 13, fontWeight: 2}}> Rent: $85 Size S </Text>
                    </View>
                </View>
                </View>

                <View style={styles.container2}>
                <View style={styles.rowContainer}>
                    <View style={styles.gridItem}>
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 200, height: 300, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                    <Text>Princess Polly Skirt </Text>
                    <Text style = {{fontSize: 13, fontWeight: 2}}> Rent: $10 Size XS </Text>
                    </View>
                    <View style={styles.gridItem}>
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 200, height: 300, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                    <Text> Louis Vutton Small Bag </Text>
                    <Text style = {{fontSize: 13, fontWeight: 2}}> Rent: $100 Size S </Text>
                    </View>
                </View>
                </View>

                <View style={styles.container2}>
                    
                <View style={styles.rowContainer}>
                    <View style={styles.gridItem}>
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 200, height: 300, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                    <Text>Are You Am I Dress </Text>
                    <Text style = {{fontSize: 13, fontWeight: 2}}> Rent: $33 Size XS </Text>
                    </View>
                    <View style={styles.gridItem}>
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 200, height: 300, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                    <Text> Missoni Knitted Tank </Text>
                    <Text style = {{fontSize: 13, fontWeight: 2}}> Rent: $48 Size XS </Text>
                    </View>
                    
                </View>
                </View>

                

            

                
                











{/* <ScrollView 
                >
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 125, height: 125, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView> */} 

                {/* <ScrollView 
                    horizontal={true}
                    showsHorizontalScrollIndicator={false} 
                    style={styles.scrollViewStyle} 
                    contentContainerStyle={styles.scrollContainer} 
                >
                    {items.map((item) => (
                        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ListingScreen', { item })}>
                            <Image 
                                source={{ uri: 'https://picsum.photos/200/300' }}
                                style={{ width: 200, height: 200, margin: 5, borderRadius: 10}}
                            />
                        </TouchableOpacity>
                    ))}
                    
                </ScrollView> */}
            </ScrollView>
            
        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 10,
        fontWeight: 2,
        fontFamily: 'BebasNeue',
        fontSize: 35,
        bottom: 5,
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc', 
        height: 20,  
        padding: 10,     // borderWidth: 1,
        // borderRadius: 5,
        // paddingHorizontal: 10,
        // marginHorizontal: 20,
        // marginBottom: 20,
    },
    h2: {
        textAlign: 'left',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 18
    },

    textContainer: {
        alignSelf: 'stretch', 
        padding: 15,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        bottom: 10,
        margin: 5,
    },
    
    container: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignSelf: 'center',
    },

    textContainer2:{
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer3:{
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        padding: 5,
    },
    textContainer4:{
        flex: 1,
        marginHorizontal: 10,
        backgroundColor: 'lightgrey',
        borderRadius: 80,
        padding: 5,
    },
    h3: {
        textAlign: 'center',
        fontWeight: 2,
        fontFamily: 'JosefinSans',
        fontSize: 16,
    },

    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      rowContainer: {
        flexDirection: 'row',
      },
      gridItem: {
        flex: 1,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
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
        alignItems: 'center'
    },
    image: {
        width: '90%', 
        height: 200, 
        borderRadius: 30,
        borderColor: 'black',
        borderWidth: 1,
    }
})

const items = [
    {
        id: 1,
        category: "Skirts",
        description: "Princess Polly black mini skirt",
        brand: "Princess Polly",
        price: 10.0,
        purchaseMode: {"buy" : 23.0},
        tags: ["Game Day"], 
        size: "Medium"
    },
]






































// const Shop = () => {
//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           flexDirection: 'column',
//         },
//       ]}>
//       <View style={{flex: 1, backgroundColor: 'red'}} />
//       <View style={{flex: 2, backgroundColor: 'darkorange'}} />
//       <View style={{flex: 3, backgroundColor: 'green'}} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
// });

// export default Shop;




    // <SafeAreaView style={styles.container}>
    //   <ScrollView style={styles.scrollView}>
    //     <Text style={styles.text}>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    //       eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
    //       minim veniam, quis nostrud exercitation ullamco laboris nisi ut
    //       aliquip ex ea commodo consequat. Duis aute irure dolor in
    //       reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
    //       pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
    //       culpa qui officia deserunt mollit anim id est laborum.
    //     </Text>
    //   </ScrollView>
    // </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: StatusBar.currentHeight,
//   },
//   scrollView: {
//     backgroundColor: 'pink',
//     //marginHorizontal: 20,
//   },
//   text: {
//     fontSize: 42,
//   },
// });

// export default Shop;




















// import iconSet from "@expo/vector-icons/build/Fontisto";
// import { StyleSheet, 
//     Alert, 
//     Text, 
//     TouchableWithoutFeedback ,
//     Image, 
//     SafeAreaView, 
//     Button,
//     StatusBar,
//     Platform,
//     View, } from "react-native";

// export default function Shop() {
//     return (
//        <View
//         style= {{
//             backgroundColor: "white",
//             flexDirection: "row", 
//             flex: 1,// horizontal
//             justifyContent: "center", //main 
//             alignItems: "center",
//         }}
//         >

//         <View style={{
//             backgroundColor: "tomato",
//             width: 100,
//             height: 100,
//             flexBasis: 100,
//             //alignSelf:"flex-start"
//         }}
//         />
//         <View style={{
//             backgroundColor: "dodgerblue",
//             width: 100,
//             height: 100,
//             right: 10,
//             position: "relative",
//             top:20,
//             left: 20,
//         }}
//         />
//         <View style={{
//             backgroundColor: "pink",
//             width: 100,
//             height: 100
//         }}
//         />
//         </View>
//     );
//     }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "pink",
//         justifyContent: "center",
//         alignItems: "center",

//     },
//     })


    // export default function Shop() {
    //     return (
    //        <SafeAreaView style={styles.container}>
    //         <Text> Hello React Native</Text>
    //         <TouchableWithoutFeedback onPress = {()=> console.log("Image tapped")}> 
    //         <Image 
    //         source ={{ 
    //             width: 200,
    //             height: 300,
    //             uri: "https://picsum.photos/200/300"}} />
    //         </TouchableWithoutFeedback>
    //        </SafeAreaView>
    //     );
    // }

    // export default function Shop() {
    //     return (
    //        <SafeAreaView style={styles.container}>
    //         <Button 
    //         color = "orange"
    //         title = "Click Me" 
    //         onPress= { () => Alert.prompt("My Title", "My message",)}
    //         />
    //        </SafeAreaView>
    //     );
    // }


    // export default function Shop() {
    //     return (
    //        <View
    //         style= {{
    //             backgroundColor: "black",
    //             flexDirection: "row", 
    //             flex: 1,// horizontal
    //             justifyContent: "center", //main 
    //             alignItems: "center",
    //             alignContent: "center", // align content only works for wrapping
    //             flexWrap:"wrap"
    //         }}
    //         >
    
    //         <View style={{
    //             backgroundColor: "tomato",
    //             width: 100,
    //             height: 100,
    //             flexBasis: 100,
    //             //alignSelf:"flex-start"
    //         }}
    //         />
    //         <View style={{
    //             backgroundColor: "dodgerblue",
    //             width: 100,
    //             height: 100
    //         }}
    //         />
    //         <View style={{
    //             backgroundColor: "pink",
    //             width: 100,
    //             height: 100
    //         }}
    //         />
    //         <View style={{
    //             backgroundColor: "grey",
    //             width: 100,
    //             height: 100
    //         }}
    //         />
    //         <View style={{
    //             backgroundColor: "greenyellow",
    //             width: 100,
    //             height: 100
    //         }}
    //         />
    //         </View>
    //     );
    //     }