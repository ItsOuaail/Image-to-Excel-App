import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    try {
      await login(email, password);
      // Login successful, redirect to authenticated area
      router.replace('/(main)/dashboard'); // Redirect to your main app screen
    } catch (error: any) {
      Alert.alert('Erreur de Connexion', error);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Mot de passe oublié', 'Fonctionnalité à implémenter.');
  };

  const handleGoogleSignIn = () => Alert.alert('Google Sign-In', 'Implement Google OAuth');
  const handleAppleSignIn = () => Alert.alert('Apple Sign-In', 'Implement Apple OAuth');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Login here</Text>
        <Text style={styles.headerSubtitle}>Welcome back you've been missed!</Text>

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

        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
          <Text style={GlobalStyles.linkText}>Forgot your password?</Text>
        </TouchableOpacity>

        <CustomButton
          title="Sign in"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.signInButton}
        />

        <TouchableOpacity onPress={() => router.push('/auth/register')} style={styles.createAccount}>
          <Text style={GlobalStyles.subtitle}>
            Create new account? <Text style={GlobalStyles.linkText}>Sign up</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.orContinueWith}>Or continue with</Text>

        <SocialSignInButtons
          onGooglePress={handleGoogleSignIn}
          onApplePress={handleAppleSignIn}
          onFacebookPress={() => {}} // Placeholder if you add Facebook
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
    paddingVertical: 50, // Added padding for scrollview
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
    paddingHorizontal: 0, // Remove padding from global subtitle
  },
  inputSpacing: {
    marginBottom: 20, // Add more space between inputs
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