import React, { useContext, useState, useEffect } from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  View,
  StyleSheet,
  Image,
  Keyboard,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Switch
} from "react-native";
import "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import { ListingsContext } from "../contexts/listingContext";
import sizes from "../util/sizes";
import { Image as ExpoImage } from 'expo-image';

export const ShopMain = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [sizeModalVisible, setSizeModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  const [availModalVisible, setAvailModalVisible] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false); // true means the user selected to only see currently available items
  const toggleSwitch = () => setIsAvailable(previousState => !previousState);

  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const { listings, fetchMoreListings, loadingMore } = useContext(ListingsContext);
  const [filteredListings, setFilteredListings] = useState(listings);
  const [filtersActive, setFiltersActive] = useState(false);

  // get filtered listings based on user selection
  useEffect(() => {
    const filtered = filterListings(listings, selectedSize, minPrice, maxPrice, searchQuery);
    setFilteredListings(filtered);

    const areFiltersActive = selectedSize || minPrice || maxPrice || searchQuery || isAvailable;
    setFiltersActive(areFiltersActive);
  }, [selectedSize, isAvailable, minPrice, maxPrice, listings, searchQuery]);

  // prefetch images to optimize display times
  useEffect(() => {
    if (filteredListings) {
      const prefetchImages = async () => {
        const prefetchPromises = filteredListings.map((listing) => 
          Image.prefetch(listing.images[0])
        );
        
        try {
          await Promise.all(prefetchPromises);
        } catch (error) {
          console.error("Image prefetch failed:", error);
        }
      };
  
    if (filteredListings.length > 0) {
      prefetchImages();
    }
  }
}, [filteredListings, listings]);

  // method to filter listings based on queries
  const filterListings = (listings, selectedSize, minPrice, maxPrice, searchQuery) => {
    const currDate = new Date();
  
    return listings.filter((listing) => {
      const matchesSize = selectedSize ? listing.size === selectedSize : true;
      const matchesMinPrice = minPrice
        ? listing.price >= parseFloat(minPrice)
        : true;
      const matchesMaxPrice = maxPrice
        ? listing.price <= parseFloat(maxPrice)
        : true;
      const matchesSearchQuery = searchQuery
        ? listing.itemName.includes(searchQuery) || listing.brand.includes(searchQuery)
        : true;
  
      let matchesAvailability = true;

      if (listing.unavailableStartDates && listing.unavailableEndDates) {
        matchesAvailability = !listing.unavailableStartDates.some((startTimestamp, index) => {
          const startDate = startTimestamp.toDate();
          const endDate = listing.unavailableEndDates[index].toDate();
  
          return startDate <= currDate && currDate <= endDate;
        });
      }
  
      return (
        matchesSize &&
        matchesAvailability &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesSearchQuery
      );
    });
  };

  // method to reset filters
  const resetFilters = () => {
    setFilteredListings(listings);
    setSearchQuery('');
    setSelectedSize('');
    setIsAvailable(false);
    setMinPrice(null);
    setMaxPrice(null);
    setFiltersActive(false);
  }

  // render single listing item
  const renderItem = ({ item, index }) =>
    <View style={{ width: "48%" }}>
      <TouchableOpacity
        onPress={() => navigation.navigate("ListingScreen", { listing: item })}
        style={styles.gridItem}
      >
        <ExpoImage
          source={{ uri: item.images[0] }}
          cachePolicy="memory-disk" 
          placeholderContent={(
            <ActivityIndicator
              color="#000"
              size="small"
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            />
          )}
          contentFit="cover" 
          style={styles.image}
        />
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <View style={styles.itemTextContainer}>
          <Text
            style={{
              fontWeight: "bold",
              marginLeft: 10,
              marginRight: 5,
              fontFamily: "optima"
            }}
          >
            {item.brand.substring(0, 17)} ‣
          </Text>
          <Text style={{ fontFamily: "optima" }}>
            {item.size}
          </Text>
        </View>

      </View>
    </View>;

  const renderSizeItem = ({ item }) =>
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedSize(item.value);
        setSizeModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>
        {item.value}
      </Text>
    </TouchableOpacity>;

  return (
    <SafeAreaView style={{flex: 1}}>
      <Text style={styles.title}>Shop</Text>

      <TextInput
        placeholder="Search for your favorite brand..."
        value={searchQuery}
        style={styles.searchContainer}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
        onChangeText={text => setSearchQuery(text)}
      />
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.textContainer}
          onPress={() => setSizeModalVisible(true)}
        >
          <Ionicons name="funnel" size={18} color="black" />
          <Text style={styles.h3}>Size</Text>
            
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.textContainer}
          onPress={() => setAvailModalVisible(true)}
        >
          <FontAwesome name="calendar" size={18} color="black" />
          <Text style={styles.h3}> Availability </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.textContainer}
          onPress={() => setPriceModalVisible(true)}
        >
          <FontAwesome name="dollar" size={18} color="black" />
          <Text style={styles.h3}> Price </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.removeFilterContainer, filtersActive ? styles.filterActive : styles.filterInactive]}
          onPress={resetFilters}
        >
          <Text style={filtersActive ? styles.textActive : styles.textInactive}>Remove Filters</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredListings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        onEndReached={fetchMoreListings}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && filteredListings.length > 6 ? (
            <View style={{ marginVertical: 25 }}>
                <ActivityIndicator />
            </View>
          ) : null
          }
      />

      {/* Size filter modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sizeModalVisible}
        onRequestClose={() => setSizeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Size</Text>
            <FlatList
              data={sizes}
              renderItem={renderSizeItem}
              keyExtractor={item => item.key}
            />

            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSizeModalVisible(false)}
              >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Availability filter modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={availModalVisible}
        onRequestClose={() => setAvailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isAvailable
              ? <Text style={styles.modalTitle}>Available items</Text>
              : <Text style={styles.modalTitle}>View all items</Text>}
            <Switch
              trackColor={{ false: "white", true: "#2f487a" }}
              thumbColor={isAvailable ? "#040936" : "white"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isAvailable}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAvailModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Price filter modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={priceModalVisible}
        onRequestClose={() => setPriceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Price Range</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text>$ </Text>
              <TextInput
                placeholder="Minimum Price"
                value={minPrice}
                onChangeText={text => setMinPrice(text)}
                keyboardType="decimal-pad"
                style={{
                  padding: 10,
                  width: 100,
                  borderColor: "lightgrey",
                  borderWidth: 1,
                  borderRadius: 10,
                  margin: 5,
                  fontFamily: 'optima',
                }}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text>$ </Text>
              <TextInput
                placeholder="Maximum Price"
                value={maxPrice}
                onChangeText={text => setMaxPrice(text)}
                keyboardType="decimal-pad"
                style={{
                  padding: 10,
                  width: 100,
                  borderColor: "lightgrey",
                  borderWidth: 1,
                  borderRadius: 10,
                  margin: 5,
                  fontFamily: "optima"
                }}
              />
            </View>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPriceModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>

              {/* change function of this */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPriceModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    width: "95%",
    marginBottom: 5
  },
  searchContainer: {
    width: "95%",
    backgroundColor: "lightgrey",
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 15,
    fontFamily: 'optima',
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 7,
    backgroundColor: "lightgrey",
    borderRadius: 20,
    padding: '3%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  removeFilterContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 7,
    borderRadius: 40,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  filterActive: {
    backgroundColor: "#040936",
    color: "white",
  },
  filterInactive: {
    backgroundColor: "lightgrey",
    color: "black",
  },
  textActive: {
    color: "white", 
    fontFamily: "optima",
    fontWeight: "medium"
  },
  textInactive: {
    color: "black", 
    fontFamily: "optima",
    fontWeight: "medium"
  },
  h3: {
    textAlign: "center",
    fontWeight: 2,
    fontFamily: "optima",
    fontSize: 15,
    marginLeft: 2,
  },
  title: {
    fontSize: 56,
    fontWeight: 5,
    alignSelf: "center",
    fontFamily: "BebasNeue"
  },
  itemTextContainer: {
    flexDirection: "row"
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10
  },
  gridItem: {
    flex: 1,
    margin: 5
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10
  },
  placeholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10
  },
  list: {
    paddingHorizontal: 10
  },

  // modals
  button: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "40%",
    backgroundColor: "#fff",
    alignItems: "center",
    alignSelf: "flex-start"
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'optima',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    maxHeight: "70%"
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'optima',
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'optima',
  },
  closeButton: {
    marginTop: 20,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: "#040936",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'optima',
  }
});

export default ShopMain;
