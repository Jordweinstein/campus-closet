import React, { useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  View,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import ListingScreen from "./Listing-Screen";
import { ListingsContext, ListingsProvider } from "../contexts/listingContext";

const Stack = createStackNavigator();

export default function Home() {
  return (
    <ListingsProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeMain"
          component={HomeMain}
          options={{ headerShown: false, headerTitle: "Back" }}
        />
        <Stack.Screen
          name="ListingScreen"
          component={ListingScreen}
          options={{ headerTitle: "", headerTintColor: "black" }}
        />
      </Stack.Navigator>
    </ListingsProvider>
  );
}
const HomeMain = ({ navigation }) => {
  const { trendingListings, recentListings } = useContext(ListingsContext);
  const GameDay = require("../assets/images/gameday.jpeg");

  return (
    <SafeAreaView>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollVerticalContainer}
      >
        <Text style={styles.title}>Campus Closet</Text>

        <Image source={GameDay} style={styles.image} />

        <View style={styles.textContainer}>
          <Text style={styles.h2}>Trending</Text>
        </View>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollContainer}
        >
          {trendingListings.map(listing =>
            <TouchableOpacity
              key={listing.id}
              onPress={() => navigation.navigate("ListingScreen", { listing })}
            >
              <Image
                source={{ 
                  uri: listing.images[0], 
                }}
                style={{ width: 125, height: 125, margin: 5, borderRadius: 10 }}
              />

            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.textContainer}>
          <Text style={styles.h2}>Just In</Text>
        </View>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollContainer}
        >
          {recentListings.map(listing =>
            <TouchableOpacity
              key={listing.id}
              onPress={() => navigation.navigate("ListingScreen", { listing })}
            >
              <Image
                source={{ uri: listing.images[0] }}
                style={{ width: 125, height: 125, margin: 5, borderRadius: 10 }}
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 56,
    paddingTop: 10,
    fontWeight: 5,
    fontFamily: "BebasNeue"
  },
  h2: {
    textAlign: "left",
    fontWeight: 2,
    fontFamily: "optima",
    fontSize: 18
  },
  textContainer: {
    alignSelf: "stretch",
    padding: 15
  },
  scrollViewStyle: {
    flex: 1,
    width: "100%"
  },
  scrollContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingLeft: "2%"
  },
  scrollVerticalContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    alignItems: "center"
  },
  image: {
    width: "100%",
    height: 220,
    marginVertical: 15
  }
});
