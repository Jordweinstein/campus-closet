import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, Keyboard } from "react-native"
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
    const [loading, setLoading] = useState(false);

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
          if (email.endsWith('.edu')) {
            updates.email = email;
          } else {
            Alert.alert("Error", "Email must end in .edu");
            return;
          }
        }
        if (phoneNumber !== null) updates.phoneNumber = phoneNumber;
    
        if (Object.keys(updates).length > 0) {
          setLoading(true);
          try {
            const userRef = doc(db, "users", auth.currentUser?.uid);
            await updateDoc(userRef, updates);
            navigation.navigate('ProfileMain');
          } catch (error) {
            console.error("Error updating document: ", error);
            Alert.alert("Error", "Failed to update profile.");
          } finally {
            setLoading(false);
          }
        } else {
          console.log("No changes to save.");
        }
      };

    return (
        (loading) ?     
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" />
        </View>
         :
        <View style={styles.editProfileView}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={{fontFamily: 'optima', marginBottom: 10}}>Select a field to edit your profile</Text>
            
            <View style={styles.inputView}>
                <Text style={styles.label}>Name:  </Text>
                <TextInput
                    placeholder="Jane Doe"
                    value={name}
                    onChangeText={setName}
                    style={styles.textInput}
                    returnKeyType="done"
                />
            </View>

            <View style={styles.inputView}>
                <Text style={styles.label}>Bio:  </Text>
                <TextInput
                    placeholder="A fun fact about me is..."
                    value={bio}
                    onChangeText={setBio}
                    style={styles.textInput}
                    maxLength={100}
                    returnKeyType="done"
                />
            </View>

            <View style={styles.inputView}>
                <Text style={styles.label}>Email:  </Text>
                <TextInput
                    placeholder="example@unc.edu"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    style={styles.textInput}
                    returnKeyType="done"
                />
            </View>

            <View style={styles.inputView}>
                <Text style={styles.label}>Phone Number:  </Text>
                <TextInput
                    placeholder="123 456 7890"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    style={styles.textInput}
                    maxLength={10}
                    returnKeyType="done"
                />
            </View>

            <View style={styles.inputView}>
                <Text style={styles.label}>Profile Picture:  </Text>
                <TouchableOpacity 
                    style={ styles.uploadImageButton }
                    onPress={() => pickImage(0, [], setImage) }
                >
                    <Text style={{fontFamily: 'optima'}}>Upload Image</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={{ color: 'white', fontWeight: '500', fontFamily: 'optima' }}>Submit Changes</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    editProfileView: {
        alignItems: 'center',
        padding: 10,
    },
    title: {
        fontSize: 48,
        margin: 10,
        fontFamily: 'BebasNeue',
    },
    inputView: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        minWidth: '90%',
        margin: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        height: 45,
        color: '#000',
    },
    label: {
        fontFamily: 'optima',
        marginRight: 10,
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
});
