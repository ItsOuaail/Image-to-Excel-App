import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /** ⚡ Met ton URL dans une constante pour la logguer facilement */
  const API_URL = 'http://10.0.2.2:8000/api/login';   // ← change-la si besoin

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);

    try {
      /* ---- Avant l’envoi ---- */
      console.log('[LOGIN] Envoi vers', API_URL, { email, password });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      /* ---- Après réception HTTP ---- */
      console.log('[LOGIN] Status HTTP =>', response.status);

      let data: any;
      try {
        data = await response.json();
        console.log('[LOGIN] Payload JSON =>', data);
      } catch (jsonErr) {
        console.warn('[LOGIN] Impossible de parser le JSON :', jsonErr);
      }

      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
        console.log('[LOGIN] Token stocké OK');
        Alert.alert('Succès', 'Connexion réussie !');
        router.replace('/(main)/dashboard');
      } else {
        console.warn('[LOGIN] Erreur renvoyée par l’API :', data?.message);
        Alert.alert('Erreur de Connexion', data?.message ?? 'Une erreur est survenue');
      }
    } catch (err: any) {
      /* ---- Erreur réseau ou fetch ---- */
      console.error('[LOGIN] Network / Fetch error =>', err);
      Alert.alert('Erreur de Connexion', err.message ?? 'Network request failed');
    } finally {
      setIsLoading(false);
    }
  };

  /* ----- UI inchangée ----- */
  const handleForgotPassword = () => Alert.alert('Mot de passe oublié', 'Fonctionnalité à implémenter.');
  const handleGoogleSignIn = () => Alert.alert('Google Sign-In', 'Implement Google OAuth');
  const handleAppleSignIn = () => Alert.alert('Apple Sign-In', 'Implement Apple OAuth');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Login here</Text>
        <Text style={styles.headerSubtitle}>Welcome back you've been missed!</Text>

        <CustomInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          style={styles.inputSpacing}
          editable={!isLoading}
        />
        <CustomInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.inputSpacing}
          editable={!isLoading}
        />

        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPassword}
          disabled={isLoading}
        >
          <Text style={GlobalStyles.linkText}>Forgot your password?</Text>
        </TouchableOpacity>

        <CustomButton title="Sign in" onPress={handleLogin} loading={isLoading} style={styles.signInButton} />

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/register')} 
          style={styles.createAccount}
          disabled={isLoading}
        >
          <Text style={GlobalStyles.subtitle}>
            Create new account? <Text style={GlobalStyles.linkText}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.orContinueWith}>Or continue with</Text>

        <SocialSignInButtons
          onGooglePress={handleGoogleSignIn}
          onApplePress={handleAppleSignIn}
          onFacebookPress={() => {}}
          disabled={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles pour le composant
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  signInButton: {
    width: '100%',
    marginBottom: 20,
  },
  createAccount: {
    marginTop: 10,
    marginBottom: 30,
  },
  orContinueWith: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
});
