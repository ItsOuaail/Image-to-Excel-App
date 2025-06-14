import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
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
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://10.0.2.2:8000/api/register'; // ↔ change selon ton cas

  const handleRegister = async () => {
    /* --- validations --- */
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }

    setIsLoading(true);
    try {
      console.log('[REGISTER] Envoi →', { name, email });

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const isJson =
        res.headers.get('content-type')?.includes('application/json');
      const payload = isJson ? await res.json() : await res.text();

      console.log('[REGISTER] status', res.status, 'payload', payload);

      if (!res.ok) {
        const msg =
          (isJson && (payload.message || JSON.stringify(payload))) ||
          payload ||
          'Une erreur est survenue';
        return Alert.alert('Erreur d’inscription', msg);
      }

      /* --- succès --- */
      Alert.alert(
        'Inscription réussie',
        'Votre compte est créé, vous pouvez maintenant vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'), // redirection login
          },
        ],
      );
    } catch (err: any) {
      console.error('[REGISTER] Network error', err);
      Alert.alert(
        'Erreur réseau',
        err.message ?? 'Network request failed. Vérifiez votre connexion.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () =>
    Alert.alert('Google Sign-In', 'Implement Google OAuth');
  const handleAppleSignIn = () =>
    Alert.alert('Apple Sign-In', 'Implement Apple OAuth');

  /* ---------- UI ---------- */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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

        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={styles.alreadyHaveAccount}>
          <Text style={GlobalStyles.subtitle}>
            Already have an account?{' '}
            <Text style={GlobalStyles.linkText}>Sign in</Text>
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
