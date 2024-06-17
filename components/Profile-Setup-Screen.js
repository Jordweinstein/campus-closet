import { View, StyleSheet, Text, TouchableOpacity, TextInput,SafeAreaView } from 'react-native';
import { collection, getDocs } from "firebase/firestore"; 
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSetup() {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [profilePic, setProfilePic] = useState('');

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        console.log(result);

        if (!result.canceled) {
        setImage(result.assets[0].uri);
        }
    }

    const handleNameChange = () => {

    }

    return (
        <SafeAreaView style= { styles.setupContainer }>
            <Text style= { styles.title }>Welcome to Campus Closet</Text>
            <Text style={{fontSize: 21, paddingVertical: 10}}>Enter your information below: </Text>
            <View style={ styles.inputContainer }>
                <View style={styles.singleInputContainer}>
                    <Text>Name: </Text>
                    <TextInput
                        placeholder = "Jane Doe"
                        style = {styles.input}
                        value = { displayName }
                        onChangeText = { text => setDisplayName(text) }
                    />
                </View>
                <View style={styles.singleInputContainer}>
                    <Text>Bio: </Text>
                    <TextInput
                        placeholder = "Tell us about yourself"
                        style = {styles.input}
                        value = { bio }
                        onChangeText = { text => setBio(text) }
                    />
                </View>
                <View style={styles.singleInputContainer}>
                    <Text>Grad Year: </Text>
                    <TextInput
                        placeholder = "2026"
                        style = {styles.input}
                        value = { graduationYear }
                        onChangeText = { text => setGraduationYear(text) }
                    />
                </View>
                
            </View>
            
            <TouchableOpacity
                style={styles.uploadImageButton}
                onPress={pickImage}
            >
                <Text>Upload Profile Picture</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        fontFamily: 'BebasNeue',
        padding: 15
    },
    input: {
        fontSize: 18,
        padding: 5,
        margin: 3
    },
    setupContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#e0edff',
        flex:1,
    },
    inputContainer: {
        width: '90%',
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,

    },
    singleInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    uploadImageButton: {
        backgoundColor: '#1a266b',
        width: 200,
        alignItems: 'center'
    }
})