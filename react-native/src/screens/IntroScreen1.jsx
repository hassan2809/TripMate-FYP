import React from 'react'
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Nature from '../../assets/images/signup.jpg'

const IntroScreen1 = ({ navigation }) => {
    return (
        <LinearGradient
            colors={['#3B82F6', '#9333EA']} // Gradient colors
            style={styles.container}
        >
            <View style={styles.card}>
                <Image
                    source={Nature} // Replace with your image path
                    style={styles.image}
                />
                <Text style={styles.title}>Welcome to Our App</Text>
                <Text style={styles.description}>
                    Easily book accommodations, plan tours, and manage your profile with a seamless experience.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('IntroScreen2')} // Ensure you have a route named 'IntroScreen2'
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'linear-gradient(to bottom, #3B82F6, #9333EA);', // Equivalent to Tailwind's bg-gray-100
        // padding: 16,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white', 
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: 'white', 
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        width: '100%',
        backgroundColor: 'transparent', 
        paddingVertical: 12,
        borderWidth: 2,
        borderRadius: 6,
        borderColor:'white',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default IntroScreen1