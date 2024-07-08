import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { DatePickerModal } from 'react-native-paper-dates';
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import { AuthContext } from "../contexts/authContext";
import { deleteDoc, doc } from "@firebase/firestore";
import db from "../firebase/db";
import { ref, getStorage, deleteObject } from "@firebase/storage";
import { useNavigation } from "@react-navigation/core";

export default function Listing({ route }) {
  const { listing } = route.params;
  const { addLikedListing, removeLikedListing, likedListings, user } = useContext(
    AuthContext
  );
  const [isLiked, setIsLiked] = useState(likedListings.includes(listing.id));
  const [likeCount, setLikeCount] = useState(listing.likes);

  const [range, setRange] = useState({ startDate: undefined, endDate: undefined });
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  const date = new Date(); // today's date


  useEffect(
    () => {
      setIsLiked(likedListings.includes(listing.id));
      
    },
    [likedListings, listing.id]
  );
  

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

        setOpen(false);
        setRange({ startDate, endDate });
        // add navigation to stripe page here
      } else {
        Alert.alert("Invalid Date Range", "Both start date and end date must be selected.");
      }
    },
    [setOpen, setRange]
  );

  const handleLike = async () => {
    console.log(listing);
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

  const handleDelete = async () => {
    // deleting images from storage
    const storage = getStorage();
    const promises = listing.images.map(async (url) => {
        const decodedUrl = decodeURIComponent(url);
        const startIndex = decodedUrl.indexOf("/o/") + 3;
        const endIndex = decodedUrl.indexOf("?alt=");
        const filePath = decodedUrl.substring(startIndex, endIndex);
    
        const imageRef = ref(storage, filePath);
        await deleteObject(imageRef).then(() => {
            console.log(filePath + " image deleted successfully");
        }).catch((error) => {
            console.log(error);
        })
      });
    
      // deleting document from firestore
      try {
        await Promise.all(promises);
        console.log("All files deleted successfully");
      } catch (error) {
        console.error("Error deleting files:", error);
      }

    await deleteDoc(doc(db, "listings", listing.id));
    navigation.goBack();
    alert("Listing successfully deleted.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <SwiperFlatList index={0} showPagination>
          {listing.images.map((image, index) =>
            <View key={index}>
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          )}
        </SwiperFlatList>
      </View>
      <View style={styles.contentContainer}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
          {listing.purchaseMethod.map((mode, index) => {
            return (mode === "Rent") ? (
              <TouchableOpacity key={index} onPress={() => setOpen(true)} style={styles.purchaseButton}>
                <Text style={styles.buttonText}>
                  {mode} ${listing.price[index]}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                key={index}
                style={styles.purchaseButton}
                onPress={() => console.log(`${mode} Button Pressed!`)}
              >
                <Text style={styles.buttonText}>
                  {mode} ${listing.price[index]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <DatePickerModal
          locale="en"
          mode="range"
          visible={open}
          label="Select rental period"
          onDismiss={onDismiss}
          startDate={range.startDate}
          endDate={range.endDate}
          onConfirm={onConfirm}
          presentationStyle="pageSheet"
        />

         
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingBottom: 7,
            }}
          >
            { (listing.owner !== user.uid ) ? (
              <>
                <TouchableOpacity onPress={handleLike}>
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
                    onPress={() =>
                      Alert.alert(
                        "Warning",
                        "Are you sure you want to delete this listing?",
                        [
                          {
                            
                            text: "Cancel",
                            onPress: () => {
                              console.log("Cancelled delete listing.")
                              console.log("my date: " + date);
                              console.log("start" + listing.datesAvailable[0]);
                              console.log("end" + listing.datesAvailable[1]);
                            
                            },
                          },
                          {
                            text: "Confirm",
                            onPress: () => handleDelete(),
                          },
                        ],
                        { cancelable: true }
                      )
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
            {listing.itemName || "No item name"}
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
