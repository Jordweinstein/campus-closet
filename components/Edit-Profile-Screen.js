import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler";
import db from '../firebase/db';
import { useNavigation } from "@react-navigation/core";
import auth from '../firebase/auth';
import { updateDoc, doc } from "firebase/firestore"; 
import { pickImage, uploadImageAsync } from "../util/imageHandling";

export default function EditProfile() {
    const [name, setName] = useState(null);
    const [bio, setBio] = useState(null);
    const [email, setEmail] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const [image, setImage] = useState(null);
    const navigation = useNavigation();

    const handleSubmit = async () => {
        const updates = {};
        let profilePicUrl = image;
    
        if (image) {
            profilePicUrl = await uploadImageAsync(image, 'profilePictures');
            updates.profilePic = profilePicUrl;
        }
    
        if (name !== null) updates.displayName = name;
        if (bio !== null) updates.bio = bio;
        if (email !== null) {
            if (email.endsWith('.edu')){ 
                updates.email = email;
            } else {
                Alert.alert("Error", "Email must end in .edu");
                return;
            }
        }
        if (phoneNumber !== null) updates.phoneNumber = phoneNumber;
    
        if (Object.keys(updates).length > 0) {
            const userRef = doc(db, "users", auth.currentUser?.uid);
            await updateDoc(userRef, updates);
            console.log("Information uploaded successfully.");
            navigation.navigate('ProfileMain');
        } else {
            console.log("No changes to save.");
        }
    };

    return (
        <View style={styles.editProfileView}>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.inputView}>
                <Text>Name:  </Text>
                <TextInput
                    placeholder="Jane Doe"
                    value={name}
                    onChangeText={setName} 
                />
            </View>

            <View style={styles.inputView}>
                <Text style={{marginTop: 5}}>Bio: </Text>
                <TextInput
                    placeholder="A fun fact about me is..."
                    value={bio}
                    onChangeText={setBio}
                    multiline={true}
                    style={styles.textInput}
                    maxLength={100}
                />
            </View>

            <View style={styles.inputView}>
                <Text>Email:  </Text>
                <TextInput
                    placeholder="example@unc.edu"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            
            <View style={styles.inputView}>
                <Text>Phone Number:  </Text>
                <TextInput
                    placeholder="123 456 7890"
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={10}
                /> 
            </View>
            <View style={styles.pictureInputView}>
                <Text>Profile Picture:  </Text>
                <TouchableOpacity 
                    style={ styles.uploadImageButton }
                    onPress={() => pickImage(0, [], setImage) }
                >
                    <Text>Upload Image</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={{ color: 'white', fontWeight: '500' }}>Submit Changes</Text>
            </TouchableOpacity>
        </View>
        
    )
}

const styles = StyleSheet.create({
    editProfileView: {
        alignItems: 'center',
        padding: 10,
    },
    title: {
        fontSize: 24,
        margin: 10,
    },
    inputView: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        width: '95%',
        margin: 5,
        borderRadius: 10,
    },
    textInput: {
        flex: 1,
        height: 45,
        color: '#000',
        textAlignVertical: 'top',
    },
    pictureInputView: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: 'white',
        width: '95%',
        margin: 5,
        borderRadius: 10,
        justifyContent: 'space-between',
    },
    uploadImageButton: {
        marginHorizontal: 20,
        backgroundColor: '#e3e3e3',
        padding: 5,
        borderRadius: 7,
    },
    submitButton: {
        marginTop: '25%',
        backgroundColor: '#0e165c',
        padding: 15,
        borderRadius: 10,
    }
})