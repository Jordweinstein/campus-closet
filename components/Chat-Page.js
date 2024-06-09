import { SafeAreaView, Text, StyleSheet, View } from "react-native";

export default function Chat() {
    return (
        <>
        <SafeAreaView style={{alignItems: 'center'}}>
            <Text style={{margin: 10}}>Chat page</Text>
            <View style={styles.chatView}>
                <Text>Mom</Text>
                <Text style = {styles.messageText}>Hello Jordan</Text>
            </View>
            <View style={styles.chatView}>
                <Text>Robert</Text>
                <Text style = {styles.messageText}>Hello</Text>
            </View>
            <View style={styles.chatView}>
                <Text>Oren</Text>
                <Text style = {styles.messageText}>Hi</Text>
            </View>
        </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    chatView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#d9d9d9',
        borderColor: 'black',
        borderWidth: 1,
        width: '95%',
        padding: 20,
        borderRadius: 10,
        marginVertical: 7
    },
    messageText: {
        color: '#6b6b6b'
    }
})