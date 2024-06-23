import { useState } from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"
export default function EditProfile() {
    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');

    return (
        <View>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.inputView}>
                <Text>Bio: </Text>
                <TextInput
                    placeholder="Hi! My name is..."
                    value={bio}
                    onChange={(text) => setBio(text)}
                />
            </View>

            <View style={styles.inputView}>
                <Text>Email: </Text>
                <TextInput
                    placeholder="example@unc.edu"
                    value={email}
                    onChange={(text) => setEmail(text)}
                />
            </View>
            
            <View style={styles.inputView}>
                <Text>Phone Number: </Text>
                
            </View>
        </View>
        
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24
    },
    inputView: {
        flexDirection: 'row'
    }
})