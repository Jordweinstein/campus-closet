import { 
    View, 
    Text, 
    TouchableOpacity, 
    Alert, 
    FlatList, 
    SafeAreaView, 
    Image, 
    ScrollView, 
    StyleSheet, 
    TextInput, 
    Modal } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import themes from './Themes'
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from "firebase/storage";
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useCallback } from "react";
import { DatePickerModal } from 'react-native-paper-dates';
import { addDoc, collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
import categories from './Categories';
import db from '../db';
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function CreateListing() {
    const [brand, setBrand] = useState('');
    const [size, setSize] = useState('');
    const [description, setDescription] = useState('');
    const [rentPrice, setRentPrice] = useState(null)
    const [itemName, setItemName] = useState('');
    const [buyPrice, setBuyPrice] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('');
    const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
    const [isRentFocused, setIsRentFocused] = useState(false);
    const [isBuyFocused, setIsBuyFocused] = useState(false);
    const [images, setImages] = useState([]);
    const [imageUrls, setImageUrls] = useState([]);

    const [range, setRange] = useState({ startDate: null, endDate: null})
    const [open, setOpen] = useState(false);

    const auth = getAuth();
    const navigator = useNavigation();

    const onDismiss = useCallback(() => {
        setOpen(false);
      }, [setOpen]);
    
     const onConfirm = useCallback(
        ({ startDate, endDate }) => {
          setOpen(false);
          setRange({ startDate, endDate });
        },
        [setOpen, setRange]
      );

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setSelectedCategory(item.value);
                setIsCategoryModalVisible(false);
            }}
        >
            <Text style={styles.modalItemText}>{item.value}</Text>
        </TouchableOpacity>
    );

    const renderThemeItem = ({ item }) => (
        <TouchableOpacity
            style={styles.modalItem}
            onPress={() => {
                setSelectedTheme(item.value);
                setIsThemeModalVisible(false);
            }}
        >
            <Text style={styles.modalItemText}>{item.value}</Text>
        </TouchableOpacity>
    );

    const pickImage = async (index) => {
        const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];
        const cancelButtonIndex = 2;
    
        Alert.alert(
            'Select Photo',
            'Choose an option:',
            [{
                text: 'Take Photo',
                onPress: () => takePhoto(index)
            },
            {
                text: 'Choose from Gallery',
                onPress: () => chooseFromGallery(index)
            },
            {
                text: 'Cancel',
                style: 'cancel'
            }],
        );
    };
    
    const takePhoto = async (index) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }
    
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        if (!result.cancelled) {
            const newImages = [...images];
            newImages[index] = result.uri;
            setImages(newImages);
        }
    };
    
    const chooseFromGallery = async (index) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        console.log("result:" + result.uri);
    
        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImages = [...images];
            newImages[index] = result.assets[0].uri;
            setImages(newImages);
        } else {
            console.log('Image selection was canceled or failed');
        }
    };

    const uploadImages = async () => {
        const urls = [];
        let response, blob, fileRef, uploadTask;
    
        for (const image of images) {
            console.log("Uploading image with URI:", image);
    
            try {
                response = await fetch(image);
                blob = await response.blob();
                console.log("Fetched and blobbed image");
            } catch (error) {
                console.error("Fetching or blob conversion failed:", error);
                continue;  
            }
    
            try {
                fileRef = ref(getStorage(), `listingImages/${Date.now()}`);
                console.log("Created fileRef");
            } catch (error) {
                console.error("Firebase storage ref creation failed:", error);
                continue;
            }
    
            try {
                uploadTask = uploadBytesResumable(fileRef, blob);
                console.log("Created upload task");
    
                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Upload is ' + progress + '% done');
                        }, 
                        (error) => {
                            console.error("Upload failed: ", error);
                            reject(error);
                        }, 
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            urls.push(downloadURL);
                            resolve();
                        }
                    );
                });
            } catch (error) {
                console.error("Upload task failed:", error);
            }
        }
        
        return urls;  
    };

    const verifyPresentInput = () => {
        if (!(images[0] && images[1])) {
            alert("You must upload at least two images.");
            return false;
        } 
        if (!itemName || !selectedCategory || !description || !size) {
            alert("Please enter all required fields.");
            return false;
        }
        if (!(isRentFocused || isBuyFocused)) {
            alert("You must choose to enable rent, buy, or both");
            return false;
        }
        if (isRentFocused && (!range.startDate || !range.endDate || range.startDate < new Date())) {
            alert("Please enter valid dates during which your item is available for rent");
            return false;
        }
        if ((isRentFocused && rentPrice === 0.00) || (isBuyFocused && buyPrice === 0.00)) {
            alert("Please enter a price amount greater than zero dollars.");
            return false;
        }
        return true;
    }

    const addListingReferenceToUser = async (listingId) => {
        try {
            const user = getAuth().currentUser;
            const userRef = doc(db, "users", user.uid);
    
            await updateDoc(userRef, {
                listings: arrayUnion(listingId)
            });
    
            console.log("Successfully added listing reference to user document");
        } catch (error) {
            console.error("Error updating user document: ", error);
        }
    };

    const handleUpload = async () => {
        if (verifyPresentInput()) {
            const uploadedImageUrls = await uploadImages(); 
            setImageUrls(uploadedImageUrls); 
    
            console.log("Image urls:", uploadedImageUrls);  
    
            let purchaseMethods = [];
            let prices = [];
            let datesAvailable = [];
            if (isRentFocused) { 
                purchaseMethods.push("Rent");
                prices.push(rentPrice);
                datesAvailable = [range.startDate, range.endDate];
            }
            if (isBuyFocused) { 
                purchaseMethods.push("Buy");
                prices.push(buyPrice);
            }
            

            var listingRef;
            try {
                listingRef = await addDoc(collection(db, "listings"), {
                    brand: brand,
                    category: selectedCategory,
                    datesAvailable: datesAvailable,
                    description: description,
                    itemName: itemName,
                    likes: 0,
                    owner: auth.currentUser.uid,  
                    images: uploadedImageUrls,  
                    purchaseMethod: purchaseMethods,
                    price: prices,
                    size: size,
                    tags: selectedTheme
                });                

                console.log("Successfully uploaded listings");
            } catch (error) {
                console.error("Error creating listing: ", error);
            }

            await addListingReferenceToUser(listingRef.id);

            setItemName('');
            setBrand('');
            setSelectedCategory('');
            setDescription('');
            setSize('');
            setSelectedTheme('');
            setRentPrice(0.00);
            setBuyPrice(0.00);
            setImages([]);
            setRange({undefined, undefined});
            setIsRentFocused(false);
            setIsBuyFocused(false);
            navigator.navigate('Profile');
        }

    };

    return (
        <SafeAreaView style={styles.createListingView}>
            <ScrollView
                horizontal={false}
                contentContainerStyle={{ height: '100%', justifyContent: 'flex-start' }}
            >
                 <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false} 
                    style={styles.scrollViewStyle}
                    contentContainerStyle={styles.imageUploadView}
                >
                    {[0, 1, 2, 3].map((index) => (
                        <TouchableOpacity key={index} style={styles.uploadButtonView} onPress={() => pickImage(index)}>
                            {images[index] ? (
                                <Image source={{ uri: images[index] }} style={{ width: 100, height: 100, borderRadius: 10 }} />
                            ) : (
                                <AntDesign name="pluscircleo" size={24} color="black" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={{alignItems: 'center'}}>
                    <TextInput
                        placeholder = "Item name"
                        style = {styles.itemNameView}
                        value= { itemName }
                        onChangeText={text => setItemName(text)}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.inputView}>
                    <View style={styles.textInputView}>
                        <Text>Brand:    </Text>
                        <TextInput
                            placeholder = "Enter brand name"
                            style = {styles.input}
                            value= { brand }
                            onChangeText={text => setBrand(text)}
                            autoCapitalize="words"
                        />
                    </View>
                    <View style={styles.textInputView}>
                        <Text>Category:    </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setIsCategoryModalVisible(true)}
                        >
                            <Text style={styles.buttonText}>
                                {selectedCategory || 'Select a category'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.textInputView}>
                        <Text>Description:    </Text>
                        <TextInput
                            placeholder = "Describe your item"
                            style = {styles.input}
                            value= { description }
                            onChangeText={text => setDescription(text)}
                            autoCapitalize="sentences"
                        />
                    </View>
                    <View style={styles.textInputView}>
                        <Text>Size:    </Text>
                        <TextInput
                            placeholder = "Enter size"
                            style = {styles.input}
                            value= { size }
                            onChangeText={text => setSize(text)}
                        />
                    </View>
                    <View style={styles.textInputView}>
                        <Text>Themes:    </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setIsThemeModalVisible(true)}
                        >
                            <Text style={styles.buttonText}>
                                {selectedTheme || 'Select a theme'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
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
                                    keyExtractor={(item) => item.key}
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
                                    keyExtractor={(item) => item.key}
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
                        style={isRentFocused ? styles.activeButton : styles.disabledButton}
                        onPress={() => setIsRentFocused(!isRentFocused)}
                    >
                        <Text style={isRentFocused ? styles.activeButtonText : styles.disabledButtonText}>Rent $ </Text>
                        {isRentFocused && (
                            <TextInput
                                style={{ flex: 1, color: 'white' }}
                                placeholder="0.00"
                                value={rentPrice}
                                placeholderTextColor='white'
                                onChangeText={text => setRentPrice(text)}
                                keyboardType="decimal-pad"
                            />
                        )}
                    </TouchableOpacity>
                    {isRentFocused ? (
                        <TouchableOpacity onPress={() => setOpen(true)}>
                            <FontAwesome name="calendar" size={24} color="black" style={{paddingTop: 15, paddingRight: 30}} />
                        </TouchableOpacity>
                    ) : (
                        <></>
                    )}
                    <DatePickerModal
                        locale='en'
                        mode='range'
                        visible={open}
                        onDismiss={onDismiss}
                        startDate={range.startDate}
                        endDate={range.endDate}
                        onConfirm={onConfirm}
                    />

                    <TouchableOpacity
                        style={isBuyFocused ? styles.activeButton : styles.disabledButton}
                        onPress={() => setIsBuyFocused(!isBuyFocused)}
                    >
                        <Text style={isBuyFocused ? styles.activeButtonText : styles.disabledButtonText}>Buy $ </Text>
                        {isBuyFocused && (
                            <TextInput
                            value={buyPrice}
                            placeholder="0.00"
                            placeholderTextColor='white'

                            onChangeText={text => setBuyPrice(text)}
                            style={{ flex: 1, color: 'white' }}
                            keyboardType="decimal-pad"
                            
                        />
                        )}
                </TouchableOpacity>
                </View>
            </ScrollView>
            <TouchableOpacity onPress={ handleUpload } style={styles.uploadButton}>
                <Text style={{color: 'white', fontSize: 16}}>Upload Listing</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollViewStyle: {
        height: 100, 
    },
    uploadButton: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050742',
        height: '8%',
    },
    imageUploadView: {
        flexDirection: 'row',
        alignItems: 'center', 
        padding: 5,
        justifyContent: 'flex-start',
    },
    createListingView: {
        flex: 1,  
        alignItems: 'center',  
        justifyContent: 'flex-start', 
        width: '100%',
    },
    uploadButtonView: {
        width: 100, 
        height: 100,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10, 
    },
    textInputView: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        height: 50,
        justifyContent: 'space-between',
        width: '100%',
    },
    inputView: {
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 10,
        marginTop: 15,
        paddingVertical: 7,
        paddingHorizontal: 7,
        borderRadius: 15,
        width: '90%',
        alignSelf: 'center',
    },
    itemNameView: {
        width: '90%',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
    },
    button: {
        padding: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        width: '40%',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    modalItemText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: 'navy',
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    priceView: {
        flexDirection: 'row',
        margin: 15,
        padding: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 50,
    },
    rentPriceView: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 10,
        marginRight: 10,
        borderRadius: 10,
        flex: 1
    },
    buyPriceView: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        marginLeft: 10,
        borderRadius: 10,
        flex: 1,
    },
    disabledButton: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#d3d3d3', 
        alignItems: 'center',
        marginTop: 20,
        flexDirection: 'row',
        width: 120,

    },
    activeButton: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#050742',  
        alignItems: 'center',
        marginTop: 20,
        flexDirection: 'row',
        width: 120,

    },
    disabledButtonText: {
        color: '#888888',  
        fontSize: 16,
    },
    activeButtonText: {
        color: '#FFFFFF',  
        fontSize: 16,
    },
});

