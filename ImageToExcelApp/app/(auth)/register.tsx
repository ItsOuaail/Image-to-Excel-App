import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // 1. Validation des champs d'entrée
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return; // Arrête la fonction si les champs sont vides
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return; // Arrête la fonction si les mots de passe ne correspondent pas
    }

    console.log("Tentative d'enregistrement avec les données :", { name, email, password });

    try {
      // 2. Appel à l'API pour l'enregistrement
      console.log("Envoi de la requête vers l'API...");
      const response = await fetch('http://10.0.2.2:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          password_confirmation: confirmPassword, // Envoi de la confirmation du mot de passe
        }),
      });

      console.log("Réponse de l'API : ", response);

      const data = await response.json();
      console.log("Données reçues de l'API : ", data);

      if (response.ok) {
        // 3. Si l'enregistrement est réussi, affichage d'une alerte et redirection
        Alert.alert('Succès', 'Votre compte a été créé avec succès ! Vous êtes maintenant connecté.');
        router.replace('/(main)/dashboard'); // Redirige vers le tableau de bord
      } else {
        // 4. Si une erreur est renvoyée, afficher le message retourné par l'API
        Alert.alert('Erreur d\'Inscription', data.message || 'Une erreur est survenue');
      }
    } catch (error: any) {
      // 5. Gestion des erreurs de requête (échec réseau, etc.)
      console.error('Erreur d\'inscription :', error);
      Alert.alert('Erreur d\'Inscription', error.message);
    }
  };

  const handleGoogleSignIn = () => Alert.alert('Google Sign-In', 'Implement Google OAuth');
  const handleAppleSignIn = () => Alert.alert('Apple Sign-In', 'Implement Apple OAuth');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>
          Create an account so you can explore all the existing jobs
        </Text>

        <CustomInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.inputSpacing}
        />
        <CustomInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.inputSpacing}
        />
        <CustomInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.inputSpacing}
        />
        <CustomInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.inputSpacing}
        />

        <CustomButton
          title="Sign up"
          onPress={handleRegister}
          style={styles.signUpButton}
        />

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.alreadyHaveAccount}>
          <Text style={GlobalStyles.subtitle}>
            Already have an account? <Text style={GlobalStyles.linkText}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.orContinueWith}>Or continue with</Text>

        <SocialSignInButtons
          onGooglePress={handleGoogleSignIn}
          onApplePress={handleAppleSignIn}
          onFacebookPress={() => {}}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#fff',
    paddingVertical: 50,
  },
  headerTitle: {
    ...GlobalStyles.title,
    fontSize: 32,
    marginBottom: 10,
  },
  headerSubtitle: {
    ...GlobalStyles.subtitle,
    fontSize: 16,
    marginBottom: 40,
    paddingHorizontal: 0,
  },
  inputSpacing: {
    marginBottom: 20,
    width: '100%',
  },
  signUpButton: {
    width: '100%',
    marginBottom: 20,
    marginTop: 20,
  },
  alreadyHaveAccount: {
    marginTop: 10,
    marginBottom: 30,
  },
  orContinueWith: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
});
