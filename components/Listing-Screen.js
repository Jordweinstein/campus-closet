import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { DatePickerModal } from 'react-native-paper-dates';
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import { AuthContext } from "../contexts/authContext";
import { Image as ExpoImage } from 'expo-image';
import { ListingsContext } from "../contexts/listingContext";
import { OffersContext } from "../contexts/offersContext";

export default function Listing({ route }) {
  const { listing } = route.params;
  const { sendRentalOffer, sendBuyOffer, sentOffers } = useContext(OffersContext);
  const { addLikedListing, removeLikedListing, likedListings, user } = useContext(
    AuthContext
  );
  const { removeListing } = useContext(ListingsContext);

  const [isLiked, setIsLiked] = useState(likedListings.includes(listing.id));
  const [likeCount, setLikeCount] = useState(listing.likes);

  const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [hasOffered, setHasOffered] = useState(false);

  useEffect(
    () => {
      setIsLiked(likedListings.includes(listing.id));
    },
    [likedListings, listing.id]
  );

  useEffect(
    () => {
      for (let i = 0; i < sentOffers.length; i++) {
        if (sentOffers[i].listing === listing.id) {
          setHasOffered(true);
        }
      }
    }, [sentOffers, listing.id]
  );

  const disabledDates = [];

  if(listing.isRental){
    for (let i = 0; i < listing.unavailableStartDates.length; i++) {
      const start = listing.unavailableStartDates[i].toDate();
      const end = listing.unavailableEndDates[i].toDate();

      let currentDate = new Date(start);
      while (currentDate <= end) {
        disabledDates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (disabledDates[disabledDates.length - 1].getTime() !== end.getTime()) {
        disabledDates.push(new Date(end));
      }
    }
  }

  const onDismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = useCallback(
    ({ startDate, endDate }) => {
      if (startDate && endDate) {
        const dayInMillis = 24 * 60 * 60 * 1000;
        const differenceInDays = Math.round((new Date(endDate) - new Date(startDate)) / dayInMillis);
  
        if (differenceInDays % 3 !== 0 || differenceInDays < 3) {
          Alert.alert("Invalid Date Range", "Please select a date range in intervals of 3 days.");
          return;
        }
  
        setRange({ startDate, endDate });
        setOpen(false);
  
        Alert.alert(
          "Send Rental Offer",
          "By sending this rental offer, you agree to the Terms and Conditions which includes an agreement to uphold the payment for your selected dates. If accepted, you will receive contact information to arrange pickup and payment.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Send Offer", onPress: () => {
              sendRentalOffer(listing, [startDate, endDate]);
            }}
          ]
        );
  
      } else {
        Alert.alert("Invalid Date Range", "Both start date and end date must be selected.");
      }
    },
    [sendRentalOffer, listing]
  );

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
    (loading) ?
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
      </View>
    :
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <SwiperFlatList index={0} showPagination>
          {listing.images.map((image, index) =>
            <View key={index}>
              <ExpoImage
                  source={{ uri: image || "https://picsum.photos/200" }}
                  cachePolicy="memory-disk" 
                  contentFit="cover"
                  style={styles.image}
                />
            </View>
          )}
        </SwiperFlatList>
      </View>
      <View style={styles.contentContainer}>

        {/* price display for different purchase methods */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
        {hasOffered ? (
          <Text>Offer Sent</Text>
          ) : user && listing.owner !== user.uid ? ( // Check if current user is not the owner
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {listing.purchaseMethod.map((mode, index) => {
                return mode === "Rent" ? (
                  <TouchableOpacity key={index} onPress={() => setOpen(true)} style={styles.purchaseButton}>
                    <Text style={styles.buttonText}>
                      {mode} ${listing.price[index]}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={index}
                    style={styles.purchaseButton}
                    onPress={() => {
                      Alert.alert(
                        "Send Purchase Offer",
                        "By sending this purchase offer, you agree to the Terms and Conditions which includes an agreement to uphold the payment for your purchase. If your offer is accepted, you will receive contact information to arrange pickup and payment.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Send Offer", onPress: () => sendBuyOffer(listing) }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.buttonText}>
                      {mode} ${listing.price[index]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null } 
          <DatePickerModal
            locale="en"
            mode="range"
            visible={open}
            label="Select rental period"
            saveLabel="Send Offer"
            onDismiss={onDismiss}
            startDate={range.startDate}
            endDate={range.endDate}
            onConfirm={onConfirm}
            presentationStyle="pageSheet"
            validRange={{ disabledDates }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 7,
            }}
          >
            { (user && (listing.owner !== user.uid) ) ? (
              <>
                <TouchableOpacity onPress={() => {
                  handleLike();
                  
                  }}>
                    <AntDesign
                    name={isLiked ? "heart" : "hearto"}
                    size={24}
                    color="black"
                    />
                </TouchableOpacity>

                <Text style={{ margin: 10, fontFamily: 'optima' }}>
                    {likeCount === 0 ? "" : likeCount}
                </Text>
              </>
              )
              : (
                <TouchableOpacity
                    style = {{marginBottom: 5}}
                    onPress={() =>{
                      Alert.alert(
                        "Warning",
                        "Are you sure you want to delete this listing?",
                        [
                          {
                            
                            text: "Cancel",
                            onPress: () => {
                              console.log("Cancelled delete listing.")                       
                            },
                          },
                          {
                            text: "Confirm",
                            onPress: () => removeListing(listing),
                          },
                        ],
                        { cancelable: true }
                      )}
                    }
                  >
                    <MaterialIcons name="delete" size={30} color="black" />
                  </TouchableOpacity>
                )}
            
          </View>
        </View>

        <View style={styles.hContainer}>
          <Text style={{ paddingRight: 15, fontSize: 20, fontWeight: "bold", fontFamily: 'optima' }}>
            {(listing.brand || "No brand") + "   ‣"}
          </Text>
          <Text style={{ fontSize: 20, fontFamily: 'optima' }}>
            {listing.itemName && listing.itemName.length > 20 ? `${listing.itemName.substring(0, 19)}...` : listing.itemName || "No item name"}
          </Text>
        </View>
        <View style={styles.hContainer}>
          <Text style={{ fontFamily: 'optima'}}>
            {listing.description}
          </Text>
        </View>
        <View style={styles.hContainer}>
          <Text style={{ fontWeight: "bold", fontFamily: 'optima' }}>Size: </Text>
          <Text>
            {listing.size}
          </Text>
        </View>

        <View style={styles.hContainer}>
          {(listing.tags.size > 0) ? 
          <View style={styles.categoryTag}>
          <Text style={styles.customText}>
            {listing.tags}
          </Text>
        </View>
        :
        <></>
        
        }
          <View style={styles.categoryTag}>
            <Text style={styles.customText}>
              {listing.category}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 20,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-evenly",
    width: "80%",
  },
  hContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    width: "80%",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: 'optima',
  },
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
  },
  customText: {
    padding: 5,
    fontFamily: 'optima',
  },
  categoryTag: {
    backgroundColor: "#c4dbff",
    alignItems: "center",
    borderRadius: 30,
    minWidth: 70,
    padding: 5,
    marginRight: 10,
  },
  purchaseButton: {
    backgroundColor: "white",
    padding: 5,
    marginBottom: 15,
    marginRight: 15,
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    height: 40,
  },
  buttonText: {
    color: "navy",
    fontSize: 16,
    fontFamily: 'optima',
  },
});
