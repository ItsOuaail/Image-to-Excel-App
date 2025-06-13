import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import CustomButton from '../components/CustomButton';
import { GlobalStyles } from '../styles/GlobalStyles';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth'; // To check auth status

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth(); // Check if user is logged in

  // If user is already logged in, redirect to main app screen (e.g., dashboard)
  // This is a common pattern for authentication flows
  if (!isLoading && user) {
    router.replace('/(main)/dashboard'); // Assuming you'll have a main authenticated dashboard route
    return null; // Or a loading spinner
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/welcome_image.png')} // Replace with your actual image
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Convertis tes images en fichiers Excel, en un clic !</Text>
      <Text style={styles.subtitle}>
        Automatise la saisie manuelle. Gagne du temps avec notre technologie OCR intelligente.
      </Text>
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Login"
          onPress={() => router.push('/auth/login')}
          style={styles.loginButton}
          textStyle={styles.loginButtonText}
        />
        <CustomButton
          title="Register"
          onPress={() => router.push('/auth/register')}
          style={styles.registerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.6, // Adjust as needed
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    ...GlobalStyles.title,
    fontSize: 26,
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    ...GlobalStyles.subtitle,
    fontSize: 15,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  loginButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'transparent', // Make it transparent
    borderWidth: 1,
    borderColor: GlobalStyles.button.backgroundColor, // Use primary blue for border
  },
  loginButtonText: {
    color: GlobalStyles.button.backgroundColor, // Primary blue text
  },
  registerButton: {
    flex: 1,
    marginLeft: 10,
  },
});