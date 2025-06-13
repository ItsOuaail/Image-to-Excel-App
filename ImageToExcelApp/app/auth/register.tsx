import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState(''); // Assuming your Laravel backend registers with a name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await register(name, email, password, confirmPassword);
      // Registration successful, redirect to authenticated area
      Alert.alert('Succès', 'Votre compte a été créé avec succès ! Vous êtes maintenant connecté.');
      router.replace('/(main)/dashboard'); // Redirect to your main app screen
    } catch (error: any) {
      Alert.alert('Erreur d\'Inscription', error);
    }
  };

  const handleGoogleSignIn = () => Alert.alert('Google Sign-In', 'Implement Google OAuth');
  const handleAppleSignIn = () => Alert.alert('Apple Sign-In', 'Implement Apple OAuth');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          loading={isLoading}
          style={styles.signUpButton}
        />

        <TouchableOpacity onPress={() => router.replace('/auth/login')} style={styles.alreadyHaveAccount}>
          <Text style={GlobalStyles.subtitle}>
            Already have an account? <Text style={GlobalStyles.linkText}>Sign in</Text>
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
    marginTop: 20, // Add some space before the button
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