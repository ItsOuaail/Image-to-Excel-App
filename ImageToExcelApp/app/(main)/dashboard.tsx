import React from 'react';
import { View, Text, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { GlobalStyles } from '../../styles/GlobalStyles';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { useImageToExcel } from '../../hooks/useImageToExcel';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth(); // Utiliser isLoading de useAuth pour le logout
  const {
    isLoading,
    imageUri,
    excelUrl,
    pickImage,
    uploadImage,
    downloadExcel,
    reset,
    error,
  } = useImageToExcel();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/'); // Rediriger vers l'écran de bienvenue/login après déconnexion
    } catch (err: any) {
      Alert.alert('Erreur de déconnexion', err.message || 'Impossible de se déconnecter.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcomeText}>
        Bienvenue, {user ? user.name : 'Utilisateur'} !
      </Text>
      <Text style={styles.instructionText}>
        Sélectionnez une image pour la convertir en Excel.
      </Text>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
          <CustomButton title="Changer l'image" onPress={pickImage} style={styles.changeImageButton} />
        </View>
      )}

      {!imageUri && (
        <CustomButton
          title="Sélectionner une image"
          onPress={pickImage}
          loading={isLoading}
          style={styles.selectImageButton}
        />
      )}

      {imageUri && (
        <CustomButton
          title="Convertir en Excel"
          onPress={uploadImage}
          loading={isLoading}
          disabled={!!excelUrl} // Désactiver si déjà converti
          style={styles.convertButton}
        />
      )}

      {excelUrl && (
        <View style={styles.excelActionsContainer}>
          <Text style={styles.excelReadyText}>Fichier Excel prêt !</Text>
          <CustomButton
            title="Télécharger & Ouvrir Excel"
            onPress={downloadExcel}
            loading={isLoading}
            style={styles.downloadButton}
          />
          <CustomButton
            title="Nouvelle conversion"
            onPress={reset}
            style={styles.resetButton}
            textStyle={styles.resetButtonText}
          />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

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
    backgroundColor: '#6c757d', // Grey button
    height: 40,
  },
  selectImageButton: {
    width: '80%',
    marginBottom: 20,
  },
  convertButton: {
    width: '80%',
    backgroundColor: '#28a745', // Green for convert
    marginBottom: 20,
  },
  excelActionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6ffe6', // Light green background
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
  downloadButton: {
    width: '90%',
    backgroundColor: '#17a2b8', // Info blue for download
    marginBottom: 10,
  },
  resetButton: {
    width: '90%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc3545', // Red border
  },
  resetButtonText: {
    color: '#dc3545', // Red text
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