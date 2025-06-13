import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import { GlobalStyles } from '../styles/GlobalStyles';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth.tsx'; // Assurez-vous que c'est .tsx

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Si l'utilisateur est déjà connecté et que le chargement initial est terminé,
  // rediriger vers le tableau de bord principal.
  if (!isLoading && user) {
    router.replace('/(main)/dashboard');
    return null; // ou un composant de chargement simple si la redirection prend du temps
  }

  // Si l'application est en cours de chargement (vérification du token, etc.)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GlobalStyles.button.backgroundColor} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ... (rest of your existing WelcomeScreen content) ... */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/welcome_image.png')}
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
          onPress={() => router.push('/(auth)/login')}
          style={styles.loginButton}
          textStyle={styles.loginButtonText}
        />
        <CustomButton
          title="Register"
          onPress={() => router.push('/(auth)/register')}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    width: '100%',
    height: width * 0.6,
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: GlobalStyles.button.backgroundColor,
  },
  loginButtonText: {
    color: GlobalStyles.button.backgroundColor,
  },
  registerButton: {
    flex: 1,
    marginLeft: 10,
  },
});