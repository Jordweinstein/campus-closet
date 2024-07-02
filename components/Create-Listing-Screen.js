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
    Dimensions 
} from "react-native";
import themes from './Themes'
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useCallback } from "react";
import { DatePickerModal } from 'react-native-paper-dates';
import { addDoc, collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
import categories from './Categories';
import db from '../firebase/db';
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { uploadImageAsync, pickImage } from '../util/imageHandling';
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
        if ((isRentFocused && (rentPrice === 0.00 || rentPrice === null)) 
                || (isBuyFocused && (buyPrice === 0.00 || buyPrice === null))) {
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
            const uploadedImageUrls = await uploadImageAsync(images, 'listingImages'); 
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
            navigator.navigate('ProfileMain');
        }

    };

    const { width, height } = Dimensions.get('window');

    return (
        <SafeAreaView 
            style={styles.createListingView}
        >
            <KeyboardAvoidingView
                style={{ flex: 1}}
                behavior="padding"
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false} 
                    style={styles.scrollViewStyle}
                    contentContainerStyle={styles.imageUploadView}
                >
                    {[0, 1, 2, 3].map((index) => (
                        <TouchableOpacity key={index} style={styles.uploadButtonView} onPress={() => pickImage(index, images, setImages)}>
                            {images[index] ? (
                                <Image source={{ uri: images[index] }} style={{ width: width * 0.3, height: width * 0.3, borderRadius: 10 }} />
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
                    <TextInput
                        placeholder = "Item description"
                        style = {styles.descriptionView}
                        value= { description }
                        onChangeText={text => setDescription(text)}
                        autoCapitalize="sentences"
                        maxLength={200}
                        multiline={true}
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
            </KeyboardAvoidingView>

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
        width: '100%',
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    uploadButtonView: {
        width: 125,
        height: 125,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: '3%',
    },
    input: {
        flex: 1,
        textAlign: 'left',
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
        marginTop: 10,
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
    descriptionView: {
        height: 95,
        textAlignVertical: 'top',
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'white',
        width: '90%',
        marginTop: 10,
        lineHeight: 20,
    },
    priceView: {
        flexDirection: 'row',
        padding: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: '5%',
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
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },

    // Modal styling
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
    
});