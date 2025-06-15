import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import CustomButton from '../../components/CustomButton'; // Assuming CustomButton can handle style overrides
import { GlobalStyles } from '../../styles/GlobalStyles';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { useImageToExcel } from '../../hooks/useImageToExcel';

// Simple icon component for placeholders, you can replace with a real icon library
const Icon = ({ name, color }) => (
  <Text style={{ color, fontSize: 40, marginBottom: 10 }}>
    {name === 'image' ? '🖼️' : '✔️'}
  </Text>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();

  const {
    imageUri,
    conversionId,
    isLoading,
    error,
    pickImage,
    uploadImage,
    reset,
  } = useImageToExcel();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bienvenue, {user?.name ?? 'Utilisateur'}!
        </Text>
        <Text style={styles.instructionText}>
          Commencez par sélectionner une image à convertir.
        </Text>
      </View>

      {/* --- Image Selection Area --- */}
      {!imageUri && (
        <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder} disabled={isLoading}>
          <Icon name="image" color="#a0aec0" />
          <Text style={styles.placeholderText}>Appuyez pour choisir une image</Text>
        </TouchableOpacity>
      )}

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
        </View>
      )}

      {/* --- Action Buttons Area --- */}
      <View style={styles.actionsContainer}>
        {imageUri && !conversionId && (
            <>
                <CustomButton
                    title="Convertir en Excel"
                    onPress={uploadImage}
                    loading={isLoading}
                    style={[styles.button, styles.convertButton]}
                    textStyle={styles.buttonTextPrimary}
                />
                <CustomButton
                    title="Changer d'image"
                    onPress={pickImage}
                    style={[styles.button, styles.changeImageButton]}
                    textStyle={styles.buttonTextSecondary}
                />
            </>
        )}

        {!imageUri && (
           <CustomButton
                title="Sélectionner une image"
                onPress={pickImage}
                loading={isLoading}
                style={[styles.button, styles.selectImageButton]}
                textStyle={styles.buttonTextPrimary}
            />
        )}
      </View>

      {/* --- Success Message --- */}
      {conversionId && (
        <View style={styles.successContainer}>
          <Icon name="check" color="#38a169" />
          <Text style={styles.successTitle}>Conversion Réussie !</Text>
          <Text style={styles.successSubtitle}>Votre fichier est prêt.</Text>
          <CustomButton
            title="Effectuer une nouvelle conversion"
            onPress={reset}
            style={[styles.button, styles.resetButton]}
            textStyle={styles.resetButtonText}
          />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* --- Logout Section --- */}
      <View style={styles.logoutContainer}>
        <CustomButton
          title="Déconnexion"
          onPress={handleLogout}
          loading={authLoading}
          style={[styles.button, styles.logoutButton]}
          textStyle={styles.logoutButtonText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F7F9FC', // A soft, light grey background
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    // Assuming GlobalStyles.title exists, otherwise define it
    // ...GlobalStyles.title,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C', // Darker text for better contrast
    textAlign: 'center',
  },
  instructionText: {
    // ...GlobalStyles.subtitle,
    fontSize: 16,
    color: '#718096', // Softer color for secondary text
    textAlign: 'center',
    marginTop: 8,
  },
  // --- Image Styles ---
  imagePlaceholder: {
    height: 200,
    width: '100%',
    backgroundColor: '#EDF2F7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    color: '#a0aec0',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 250,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  // --- Button Styles ---
  actionsContainer: {
      width: '100%',
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
   buttonTextSecondary: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectImageButton: {
      backgroundColor: '#3182CE', // A nice, professional blue
  },
  convertButton: {
    backgroundColor: '#38A169', // A clear, success green
  },
  changeImageButton: {
      backgroundColor: '#EDF2F7',
  },
  // --- Success State ---
  successContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F0FFF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#9AE6B4',
    marginTop: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F855A',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#2F855A',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#38A169',
    shadowOpacity: 0, // No shadow for outline buttons
    elevation: 0,
  },
  resetButtonText: {
    color: '#38A169',
    fontWeight: 'bold',
  },
  // --- Other Styles ---
  errorText: {
    color: '#E53E3E',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutContainer: {
    marginTop: 32, // More space before logout
    width: '100%',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E53E3E',
    shadowOpacity: 0,
    elevation: 0,
  },
  logoutButtonText: {
    color: '#E53E3E',
    fontWeight: 'bold',
  },
});
