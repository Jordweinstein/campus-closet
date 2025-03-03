import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  FlatList,
  SafeAreaView,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useState, useContext } from "react";
import sizes from "../util/sizes";
import {
  addDoc,
  collection,
} from "firebase/firestore";
import db from "../firebase/db";
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from "@react-navigation/native";
import { uploadImageAsync, pickImage } from "../util/imageService";
import { AuthContext } from "../contexts/authContext";
import * as Sentry from '@sentry/react-native';

export default function CreateListing() {
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [rentPrice, setRentPrice] = useState(null);
  const [itemName, setItemName] = useState("");
  const [buyPrice, setBuyPrice] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isRentFocused, setIsRentFocused] = useState(false);
  const [isBuyFocused, setIsBuyFocused] = useState(false);
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isSizeModalVisible, setIsSizeModalVisible] = useState(false);
  const [nextUploadableImageIndex, setNextUploadableImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const {user, addListingReferenceToUser, removeListingReferenceFromUser} = useContext(AuthContext);

  const navigator = useNavigation();

  if (user) {
    Sentry.setUser({
      id: user.uid,
      email: user.email,
    });
  }

  const renderSizeItem = ({ item }) =>
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSize(item.value);
        setIsSizeModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>
        {item.value}
      </Text>
    </TouchableOpacity>;

  const renderCategoryItem = ({ item }) =>
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedCategory(item.value);
        setIsCategoryModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>
        {item.value}
      </Text>
    </TouchableOpacity>;

  const renderThemeItem = ({ item }) =>
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        setSelectedTheme(item.value);
        setIsThemeModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>
        {item.value}
      </Text>
    </TouchableOpacity>;

  const verifyPresentInput = () => {
    if (!(images[0] && images[1])) {
      alert("You must upload at least two images.");
      return false;
    } else if (!itemName || !selectedCategory || !description || !size) {
      alert("Please enter all required fields.");
      return false;
    } else if (!(isRentFocused || isBuyFocused)) {
      alert("You must choose to enable rent, buy, or both");
      return false;
    } else if (
      (isRentFocused && (rentPrice === 0.0 || rentPrice === null)) ||
      (isBuyFocused && (buyPrice === 0.0 || buyPrice === null))
    ) {
      alert("Please enter a price amount greater than zero dollars.");
      return false;
    } else return true;
  };

  const handleImageUpload = async index => {
    if (index <= nextUploadableImageIndex) {
      const result = await pickImage(index, images, image => {
        const newImages = [...images];
        newImages[index] = image;
        setImages(newImages);
        setNextUploadableImageIndex(index + 1);
      });
    } else {
      alert("Please upload the previous images first.");
    }
  };

  const uploadedImageUrls = [];

  const handleUpload = async () => {
    setLoading(true);

    Sentry.addBreadcrumb({
      category: 'upload',
      message: 'Started listing upload process',
      level: "info",
    });

    if (verifyPresentInput()) {
      const uploadedImageUrls = [];

      for (const image of images) {
        try {
          Sentry.addBreadcrumb({
            category: 'upload',
            message: `Uploading image at index ${images.indexOf(image)}`,
            level: "info",
            data: { imageUri: image },
          });
          
          const img = await uploadImageAsync(image, "listingImages");
          uploadedImageUrls.push(img);

          Sentry.addBreadcrumb({
            category: 'upload',
            message: `Image uploaded successfully`,
            level: "info",
            data: { imageUrl: img },
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          Sentry.captureException(error); // Capture image upload error
        }
      }

      setImageUrls(uploadedImageUrls);

      let purchaseMethods = [];
      let prices = [];
      if (rentPrice) {
        purchaseMethods.push("Rent");
        prices.push(rentPrice);
      }
      if (buyPrice) {
        purchaseMethods.push("Buy");
        prices.push(buyPrice);
      }

      // Set context for the listing details
      Sentry.setContext("listingDetails", {
        brand,
        category: selectedCategory,
        description,
        itemName,
        size,
        rentPrice,
        buyPrice,
        images: uploadedImageUrls,
      });

      let listingRef;
      try {
        listingRef = await addDoc(collection(db, "listings"), {
          brand,
          category: selectedCategory,
          description,
          itemName,
          owner: user.uid,
          images: uploadedImageUrls,
          purchaseMethod: purchaseMethods,
          price: prices,
          size,
          tags: selectedTheme,
          timestamp: new Date(),
        });

        Sentry.addBreadcrumb({
          category: 'database',
          message: 'Created listing document in Firestore',
          level: "info",
          data: { listingId: listingRef.id },
        });
      } catch (error) {
        console.error("Error creating listing:", error);
        Sentry.captureException(error); // Capture listing creation error
      }

      try {
        await addListingReferenceToUser(listingRef.id);
      } catch (error) {
        console.log("Error adding listing reference:", error);
        Sentry.captureException(error); // Capture error adding listing reference
      }

      navigator.navigate("ProfileMain");
      setLoading(false);

      // Reset form fields
      setItemName("");
      setBrand("");
      setSelectedCategory("");
      setDescription("");
      setSize("");
      setRentPrice(null);
      setBuyPrice(null);
      setImages([]);
      setNextUploadableImageIndex(0);
    } else {
      setLoading(false);
    }
  };

  return loading
    ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    : <SafeAreaView style={styles.createListingView}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={100}
        >
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.scrollViewStyle}
            contentContainerStyle={styles.imageUploadView}
          >
            {[0, 1, 2, 3].map(index =>
              <TouchableOpacity
                key={index}
                style={styles.uploadButtonView}
                onPress={() => handleImageUpload(index)}
                disabled={index > nextUploadableImageIndex}
              >
                {images[index]
                  ? <ExpoImage
                      source={{ uri: images[index] }}
                      cachePolicy="memory-disk" 
                      contentFit="cover"
                      style={styles.image}
                    />
                  : index === nextUploadableImageIndex &&
                    <AntDesign name="pluscircleo" size={24} color="black" />}
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={{ alignItems: "center" }}>
            <TextInput
              placeholder="Item name"
              style={styles.itemNameView}
              value={itemName}
              onChangeText={text => setItemName(text)}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <TextInput
              placeholder="Item description"
              style={styles.descriptionView}
              value={description}
              onChangeText={text => setDescription(text)}
              autoCapitalize="sentences"
              maxLength={200}
              multiline={true}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
          <View style={styles.inputView}>
            <View style={styles.textInputView}>
              <Text style={styles.inputTitleText}>Brand: </Text>
              <TextInput
                placeholder="Enter brand name"
                style={styles.input}
                value={brand}
                maxLength={30}
                onChangeText={text => setBrand(text)}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
            <View style={styles.textInputView}>
              <Text style={styles.inputTitleText}>Category: </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsCategoryModalVisible(true)}
              >
                <Text style={styles.buttonText}>
                  {selectedCategory || "Select a category"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.textInputView}>
              <Text style={styles.inputTitleText}>Size: </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsSizeModalVisible(true)}
              >
                <Text style={styles.buttonText}>
                  {size || "Select a size"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.textInputView}>
              <Text style={styles.inputTitleText}>Themes: </Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsThemeModalVisible(true)}
              >
                <Text style={styles.buttonText}>
                  {selectedTheme || "Select a theme"}
                </Text>
              </TouchableOpacity>
            </View>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isSizeModalVisible}
              onRequestClose={() => setIsSizeModalVisible(false)}
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
                    onPress={() => setIsSizeModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isCategoryModalVisible}
              onRequestClose={() => setIsCategoryModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Category</Text>
                  <FlatList
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item.key}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsCategoryModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isThemeModalVisible}
              onRequestClose={() => setIsThemeModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Theme</Text>
                  <FlatList
                    data={themes}
                    renderItem={renderThemeItem}
                    keyExtractor={item => item.key}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsThemeModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.priceView}>
            <TouchableOpacity
              style={
                isRentFocused ? styles.activeButton : styles.disabledButton
              }
              onPress={() => setIsRentFocused(!isRentFocused)}
            >
              <Text
                style={
                  isRentFocused
                    ? styles.activeButtonText
                    : styles.disabledButtonText
                }
              >
                Rent ${" "}
              </Text>
              {isRentFocused &&
                <TextInput
                  style={{ flex: 1, color: "white" }}
                  placeholder="0.00"
                  value={rentPrice}
                  placeholderTextColor="white"
                  onChangeText={text => setRentPrice(text)}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />}
            </TouchableOpacity>
              
            {(isRentFocused) ?
            <TouchableOpacity onPress={() => setIsHelpVisible(true)}>
              <AntDesign name="questioncircle" size={24} color="gray" />
            </TouchableOpacity>
              
            
              :
              <></>

          }
          <Modal
              animationType="slide"
              transparent={true}
              visible={isHelpVisible}
              onRequestClose={() => setIsHelpVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>How does pricing work?</Text>
                  <Text style={styles.modalItemText}>The price you enter for a rental will be the price for a three-day rental interval. You can set the price to be whatever you think is fair!</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsHelpVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
                
              </View>
            </Modal>

            <TouchableOpacity
              style={isBuyFocused ? styles.activeButton : styles.disabledButton}
              onPress={() => setIsBuyFocused(!isBuyFocused)}
            >
              <Text
                style={
                  isBuyFocused
                    ? styles.activeButtonText
                    : styles.disabledButtonText
                }
              >
                Buy ${" "}
              </Text>
              {isBuyFocused &&
                <TextInput
                  value={buyPrice}
                  placeholder="0.00"
                  placeholderTextColor="white"
                  onChangeText={text => setBuyPrice(text)}
                  style={{ flex: 1, color: "white" }}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <TouchableOpacity onPress={handleUpload} style={styles.uploadButton}>
          <Text
            style={{ color: "white", fontSize: 16, fontFamily: "optima-bold" }}
          >
            Upload Listing
          </Text>
        </TouchableOpacity>
      </SafeAreaView>;
}

const styles = StyleSheet.create({
  scrollViewStyle: {
    height: "20%",
    width: "100%"
  },
  uploadButton: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050742",
    height: "8%"
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10
  },
  imageUploadView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    justifyContent: "flex-start"
  },
  createListingView: {
    width: "100%",
    flex: 1
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "flex-start"
  },
  uploadButtonView: {
    height: "80%",
    aspectRatio: 1,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "1%"
  },
  input: {
    flex: 1,
    textAlign: "left",
    fontFamily: "optima"
  },
  textInputView: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    height: 50,
    justifyContent: "space-between",
    width: "100%"
  },
  inputView: {
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 10,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 15,
    width: "90%",
    alignSelf: "center"
  },
  itemNameView: {
    width: "90%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10
  },
  inputTitleText: {
    width: "60%",
    fontFamily: "optima"

  },
  descriptionView: {
    height: 95,
    textAlignVertical: "top",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "white",
    width: "90%",
    marginTop: 10,
    lineHeight: 20
  },
  priceView: {
    flexDirection: "row",
    padding: 10,
    paddingHorizontal: 20,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: "5%",
    marginTop: '5%',
  },
  disabledButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#d3d3d3",
    alignItems: "center",
    flexDirection: "row",
    width: 120
  },
  activeButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#050742",
    alignItems: "center",
    flexDirection: "row",
    width: 120
  },
  disabledButtonText: {
    color: "#888888",
    fontSize: 16,
    fontFamily: "optima"
  },
  activeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "optima"
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start"
  },
  icon: {
    alignSelf: 'center'
  },

  // Modal styling
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
    fontFamily: "optima"
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
    fontFamily: "optima"
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: "optima"
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "navy",
    borderRadius: 8
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "optima"
  }
});

const categories = [
  { key: "1", value: "Dresses" },
  { key: "2", value: "Tops" },
  { key: "3", value: "Shorts" },
  { key: "4", value: "Pants" },
  { key: "5", value: "Jeans" },
  { key: "6", value: "Shoes" },
  { key: "7", value: "Accessories" },
  { key: "8", value: "Skirts" },
  { key: "9", value: "Sweaters" }
];

const themes = [
  { key: "1", value: "Game Day" },
  { key: "2", value: "Formal" },
  { key: "3", value: "Sundresses" },
  { key: "4", value: "Night Out" },
  { key: "5", value: "Casual" },
  { key: "6", value: "Beach" }
];
