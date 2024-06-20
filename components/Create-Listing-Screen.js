import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, TextInput } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';
import { useState } from "react";
import { SelectList } from 'react-native-dropdown-select-list'
import categories from './categories';

export default function CreateListing() {
    const [brand, setBrand] = useState('');
    const [selected, setSelected] = useState('');
    const [size, setSize] = useState('');
    const [description, setDescription] = useState('');

    return (
        <SafeAreaView style={styles.createListingView}>
            <Text style={{ margin: 20, fontSize: 22 }}>New Listing</Text>
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false} 
                style={styles.scrollViewStyle}
                contentContainerStyle={styles.imageUploadView}
            >
                <View style={styles.uploadButtonView}>
                    <TouchableOpacity>
                        <AntDesign name="pluscircleo" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.uploadButtonView}>
                    <TouchableOpacity>
                        <AntDesign name="pluscircleo" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.uploadButtonView}>
                    <TouchableOpacity>
                        <AntDesign name="pluscircleo" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={styles.uploadButtonView}>
                    <TouchableOpacity>
                        <AntDesign name="pluscircleo" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.inputView}>
                <View style={styles.textInputView}>
                    <Text>Brand:    </Text>
                    <TextInput
                        placeholder = "Enter brand name"
                        style = {styles.input}
                        value= { brand }
                        onChangeText={text => setBrand(text)}
                    />
                </View>
                <View style={styles.textInputView}>
                    <Text>Category:    </Text>
                    <View style={{width: '50%'}}>
                        <SelectList 
                            setSelected={(val) => setSelected(val)} 
                            data={categories} 
                            save="value"
                            boxStyles={{width: '100%'}}
                        />
                    </View>
                </View>
                <View style={styles.textInputView}>
                    <Text>Description:    </Text>
                    <TextInput
                        placeholder = "Describe your item"
                        style = {styles.input}
                        value= { description }
                        onChangeText={text => setDescription(text)}
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
            </View>
                
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollViewStyle: {
        height: 100, 
    },
    imageUploadView: {
        flexDirection: 'row',
        alignItems: 'center', 
        padding: 5,
        justifyContent: 'flex-start'
    },
    createListingView: {
        justifyContent: 'flex-start',
    },
    uploadButtonView: {
        width: 100, 
        height: 100,
        backgroundColor: '#c8d2e3',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5, 
    },
    textInputView: {
        flexDirection: 'row',
        width: '90%',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputView: {
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 10,
        marginTop: 25,
        paddingVertical: 7,
        borderRadius: 15
    }
});

