import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { useImageToExcel } from '../../hooks/useImageToExcel';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>
        Bienvenue, {user?.name ?? 'Utilisateur'} !
      </Text>
      <Text style={styles.instructionText}>
        Sélectionnez une image pour la convertir en Excel.
      </Text>

      {/* Aperçu de l’image sélectionnée */}
      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
          <CustomButton
            title="Changer l'image"
            onPress={pickImage}
            style={styles.changeImageButton}
          />
        </View>
      )}

      {/* Bouton de sélection initial si aucune image */}
      {!imageUri && (
        <CustomButton
          title="Sélectionner une image"
          onPress={pickImage}
          loading={isLoading}
          style={styles.selectImageButton}
        />
      )}

      {/* Bouton d’upload → conversion */}
      {imageUri && (
        <CustomButton
          title="Convertir en Excel"
          onPress={uploadImage}
          loading={isLoading}
          disabled={!!conversionId}
          style={styles.convertButton}
        />
      )}

      {/* Message + action une fois la conversion terminée */}
      {conversionId && (
        <View style={styles.excelActionsContainer}>
          <Text style={styles.excelReadyText}>
            Fichier ouvert dans Excel ✔️
          </Text>
          <CustomButton
            title="Nouvelle conversion"
            onPress={reset}
            style={styles.resetButton}
            textStyle={styles.resetButtonText}
          />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Déconnexion */}
      <View style={styles.logoutContainer}>
        <CustomButton
          title="Déconnexion"
          onPress={handleLogout}
          loading={authLoading}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  welcomeText: {
    ...GlobalStyles.title,
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionText: {
    ...GlobalStyles.subtitle,
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
  },
  imagePreview: {
    width: '90%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  changeImageButton: {
    width: '70%',
    backgroundColor: '#6c757d',
    height: 40,
  },
  selectImageButton: {
    width: '80%',
    marginBottom: 20,
  },
  convertButton: {
    width: '80%',
    backgroundColor: '#28a745',
    marginBottom: 20,
  },
  excelActionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6ffe6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  excelReadyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 15,
  },
  resetButton: {
    width: '90%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  resetButtonText: {
    color: '#dc3545',
  },
  errorText: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
  },
  logoutContainer: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    width: '50%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutButtonText: {
    color: '#dc3545',
  },
});
