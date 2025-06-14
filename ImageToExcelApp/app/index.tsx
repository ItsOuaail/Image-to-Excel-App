import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import CustomButton from '../components/CustomButton';
import { GlobalStyles } from '../styles/GlobalStyles';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth(); // Correction de la typo "isLoatding"

  // Effet pour gérer la redirection après login réussi
  useEffect(() => {
    // Si l'utilisateur est connecté et que le chargement est terminé
    if (!isLoading && user) {
      console.log('Utilisateur connecté, redirection vers dashboard...');
      // Utilise replace pour éviter que l'utilisateur puisse revenir en arrière
      router.replace('/(dash)');
    }
  }, [user, isLoading, router]);

  // Si l'application est en cours de chargement (vérification du token, etc.)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GlobalStyles.button.backgroundColor} />
        <Text style={styles.loadingText}>Chargement...</Text>
        <Text style={styles.loadingSubText}>Vérification de la session...</Text>
      </View>
    );
  }

  // Si l'utilisateur est connecté, on montre un loader pendant la redirection
  if (user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GlobalStyles.button.backgroundColor} />
        <Text style={styles.loadingText}>Connexion réussie!</Text>
        <Text style={styles.loadingSubText}>Redirection vers le dashboard...</Text>
      </View>
    );
  }

  // Interface de bienvenue pour les utilisateurs non connectés
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/welcome_image.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      
      <Text style={styles.title}>
        Convertis tes images en fichiers Excel, en un clic !
      </Text>
      
      <Text style={styles.subtitle}>
        Automatise la saisie manuelle. Gagne du temps avec notre technologie OCR intelligente.
      </Text>
      
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Connexion"
          onPress={() => {
            console.log('Navigation vers login...');
            router.push('/(auth)/login');
          }}
          style={styles.loginButton}
          textStyle={styles.loginButtonText}
        />
        <CustomButton
          title="Inscription"
          onPress={() => {
            console.log('Navigation vers register...');
            router.push('/(auth)/register');
          }}
          style={styles.registerButton}
        />
      </View>
      
      {/* Section informative supplémentaire */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Fonctionnalités principales :</Text>
        <Text style={styles.featureItem}>📸 Scan de tableaux intelligents</Text>
        <Text style={styles.featureItem}>📊 Génération Excel automatique</Text>
        <Text style={styles.featureItem}>🔍 Reconnaissance OCR avancée</Text>
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
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    lineHeight: 32,
  },
  subtitle: {
    ...GlobalStyles.subtitle,
    fontSize: 15,
    marginBottom: 40,
    paddingHorizontal: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 30,
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
  featuresContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
});