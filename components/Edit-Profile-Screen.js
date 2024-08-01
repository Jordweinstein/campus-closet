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
    const [nFocus, setNFocus] = useState(false);
    const [bFocus, setBFocus] = useState(false);
    const [eFocus, setEFocus] = useState(false);
    const [pFocus, setPFocus] = useState(false);
    const [ppFocus, setPpFocus] = useState(false);

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
            
            <TouchableOpacity 
                onPress = {() => setNFocus(!nFocus)}
                style={[styles.inputView, (nFocus) ? styles.activeInput : styles.inactiveInput]}
            >
                <Text style={[{fontFamily: 'optima'}, (nFocus) ? styles.activeText : styles.inactiveText]}>Name:  </Text>
                <TextInput
                    placeholder="Jane Doe"
                    value={name}
                    onChangeText={setName} 
                    editable={nFocus}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss()}
                />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress = {() => setBFocus(!bFocus)}
                style={[styles.inputView, (bFocus) ? styles.activeInput : styles.inactiveInput]}
            >
                <Text style={[{fontFamily: 'optima', marginTop: 5}, (bFocus) ? styles.activeText : styles.inactiveText]}>Bio:  </Text>
                <TextInput
                    placeholder="A fun fact about me is..."
                    value={bio}
                    onChangeText={setBio}
                    multiline={true}
                    style={styles.textInput}
                    maxLength={100}
                    editable={bFocus}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss()}
                />
            </TouchableOpacity>

            <TouchableOpacity 
                onPress = {() => setEFocus(!eFocus)}
                style={[styles.inputView, (eFocus) ? styles.activeInput : styles.inactiveInput]}
            >
                <Text style={[{fontFamily: 'optima'}, (eFocus) ? styles.activeText : styles.inactiveText]}>Email:  </Text>
                <TextInput
                    placeholder="example@unc.edu"
                    value={email}
                    keyboardType='email-address'
                    onChangeText={setEmail}
                    editable={eFocus}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss()}
                />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress = {() => setPFocus(!pFocus)}
                style={[styles.inputView, (pFocus) ? styles.activeInput : styles.inactiveInput]}
            >
                <Text style={[{fontFamily: 'optima'}, (pFocus) ? styles.activeText : styles.inactiveText]}>Phone Number:  </Text>
                <TextInput
                    placeholder="123 456 7890"
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={10}
                    editable={pFocus}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}

                /> 
            </TouchableOpacity>
            <TouchableOpacity 
                onPress = {() => setPpFocus(!ppFocus)}
                style={[styles.inputView, (ppFocus) ? styles.activeInput : styles.inactiveInput]}
            >
                <Text style={[{fontFamily: 'optima', marginRight: '29%'}, (ppFocus) ? styles.activeText : styles.inactiveText]}>Profile Picture:  </Text>
                <TouchableOpacity 
                    style={ styles.uploadImageButton }
                    onPress={() => pickImage(0, [], setImage) }
                >
                    <Text style={{fontFamily: 'optima'}}>Upload Image</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={{ color: 'white', fontWeight: '500', fontFamily: 'optima' }}>Submit Changes</Text>
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
    },
    activeInput: {
        backgroundColor: 'white',
    },
    inactiveInput: {
        backgroundColor: 'darkgrey',
    },
    activeText: {
        color: 'black'
    },
    inactiveText: {
        color: 'grey'
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
        alignSelf: "flex-end"
    },
    submitButton: {
        marginTop: '25%',
        backgroundColor: '#0e165c',
        padding: 15,
        borderRadius: 10,
    }
})