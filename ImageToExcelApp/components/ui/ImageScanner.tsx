import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

interface ImageScannerProps {
  onImageScanned: (imageUri: string) => void;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
}

export default function ImageScanner({ onImageScanned, isScanning, setIsScanning }: ImageScannerProps) {
  const [scanMode, setScanMode] = useState<'camera' | 'gallery'>('camera');

  const showImagePicker = () => {
    Alert.alert(
      'Sélectionner une source',
      'Comment souhaitez-vous ajouter une image?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Caméra', onPress: () => openCamera() },
        { text: 'Galerie', onPress: () => openGallery() },
      ]
    );
  };

  const openCamera = () => {
    setIsScanning(true);
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
      maxWidth: 2000,
      maxHeight: 2000,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      setIsScanning(false);
      handleImageResponse(response);
    });
  };

  const openGallery = () => {
    setIsScanning(true);
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
      maxWidth: 2000,
      maxHeight: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      setIsScanning(false);
      handleImageResponse(response);
    });
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorMessage) {
      Alert.alert('Erreur', response.errorMessage);
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        onImageScanned(imageUri);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📸 Scanner un Tableau</Text>
        <Text style={styles.instructionsText}>
          Prenez une photo claire du tableau ou sélectionnez une image depuis votre galerie.
        </Text>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Conseils :</Text>
          <Text style={styles.tipText}>• Assurez-vous que l'éclairage est bon</Text>
          <Text style={styles.tipText}>• Gardez l'appareil stable</Text>
          <Text style={styles.tipText}>• Centrez bien le tableau dans le cadre</Text>
        </View>
      </View>

      {/* Scan Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, styles.cameraButton]}
          onPress={openCamera}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📷</Text>
              <Text style={styles.buttonText}>Prendre une Photo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scanButton, styles.galleryButton]}
          onPress={openGallery}
          disabled={isScanning}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonText}>Choisir depuis la Galerie</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action */}
      <TouchableOpacity
        style={styles.quickScanButton}
        onPress={showImagePicker}
        disabled={isScanning}
      >
        <Text style={styles.quickScanIcon}>⚡</Text>
        <Text style={styles.quickScanText}>Scan Rapide</Text>
      </TouchableOpacity>

      {/* Status */}
      {isScanning && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.statusText}>Traitement en cours...</Text>
        </View>
      )}

      {/* Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>🚀 Fonctionnalités</Text>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureText}>Détection automatique</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Export Excel</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🖼️</Text>
            <Text style={styles.featureText}>Fusion d'images</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💾</Text>
            <Text style={styles.featureText}>Sauvegarde locale</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cameraButton: {
    backgroundColor: '#007bff',
  },
  galleryButton: {
    backgroundColor: '#28a745',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  quickScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffc107',
    padding: 14,
    borderRadius: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickScanIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  quickScanText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  statusContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#007bff',
    marginTop: 10,
    fontWeight: '500',
  },
  featuresContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#495057',
    textAlign: 'center',
    fontWeight: '500',
  },
});