import React, { useContext, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import ListingScreen from "./Listing-Screen";
import { ListingsContext, ListingsProvider } from "../contexts/listingContext";

export default function Shop() {
  return (
    <ListingsProvider>
      <ShopContent />
    </ListingsProvider>
  );
}

function ShopContent() {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShopMain"
        component={ShopMain}
        options={{ headerShown: false, headerTitle: "Back" }}
      />
      <Stack.Screen
        name="ListingScreen"
        component={ListingScreen}
        options={{ headerTitle: "", headerTintColor: "black" }}
      />
    </Stack.Navigator>
  );
}

const ShopMain = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(null);
  const { listings } = useContext(ListingsContext);

  const renderItem = ({ item, index }) =>
    <View style={styles.row}>
      <View style={styles.itemInfo}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ListingScreen", { listing: item })}
          style={styles.gridItem}
        >
          <Image source={{ uri: item.images[0] }} style={styles.image} />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={styles.itemTextContainer}>
            <Text
              style={{ fontWeight: "bold", marginLeft: 10, marginRight: 5 }}
            >
              {item.brand} ‣
            </Text>
            <Text>
              {item.itemName}
            </Text>
          </View>

          <Text style={{ fontSize: 12, marginRight: 10, fontWeight: 500 }}>
            {item.size}
          </Text>
        </View>
      </View>

      {index % 2 === 0 &&
        index === listings.length - 1 &&
        <View style={[styles.gridItem, styles.placeholder]} />}
    </View>;

  return (
    <SafeAreaView>
      <Text style={styles.title}>Shop</Text>

      <TextInput
        placeholder="Search for your favorite brand..."
        value={searchQuery}
        style={styles.searchContainer}
        onChangeText={text => setSearchQuery(text)}
      />
      <View style={styles.container}>
        <TouchableOpacity style={styles.textContainer}>
          <Ionicons name="funnel" size={20} color="black" />
          <Text style={styles.h3}>Size</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textContainer}>
          <FontAwesome name="calendar" size={20} color="black" />
          <Text style={styles.h3}> Availability </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.textContainer}>
          <FontAwesome name="dollar" size={20} color="black" />
          <Text style={styles.h3}> Price </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: "95%",
    marginBottom: 5,
  },
  searchContainer: {
    width: "90%",
    backgroundColor: "lightgrey",
    padding: 15,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 15,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 7,
    backgroundColor: "lightgrey",
    borderRadius: 40,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  h3: {
    textAlign: "center",
    fontWeight: 2,
    marginLeft: 5,
    fontFamily: "JosefinSans",
    fontSize: 15,
  },
  title: {
    fontSize: 56,
    paddingTop: 10,
    fontWeight: 5,
    alignSelf: "center",
    fontFamily: "BebasNeue",
  },
  itemTextContainer: {
    flexDirection: "row",
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
  },
  list: {
    paddingHorizontal: 10,
  },
});
