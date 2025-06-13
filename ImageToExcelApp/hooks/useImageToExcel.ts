import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageForExcelConversion, downloadAndOpenExcel } from '../services/excelService';
import { Alert } from 'react-native';

interface ImageToExcelResult {
  isLoading: boolean;
  imageUri: string | null;
  excelUrl: string | null;
  pickImage: () => Promise<void>;
  uploadImage: () => Promise<void>;
  downloadExcel: () => Promise<void>;
  reset: () => void;
  error: string | null;
}

export const useImageToExcel = (): ImageToExcelResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [excelUrl, setExcelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    setError(null);
    setExcelUrl(null); // Clear previous excel URL on new image pick
    setIsLoading(true); // Indicate loading while picker is open (permissions, etc.)
    try {
      // Demander la permission d'accéder à la galerie de photos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder à votre galerie.');
        setError('Permission d\'accès à la galerie refusée.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Dépend de si vous voulez permettre l'édition
        quality: 1, // Haute qualité
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (err: any) {
      console.error("Erreur lors de la sélection de l'image:", err);
      setError('Échec de la sélection de l\'image: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('Image manquante', 'Veuillez sélectionner une image d\'abord.');
      setError('Aucune image sélectionnée.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setExcelUrl(null);

    try {
      // Générez un nom de fichier unique ou significatif
      const filename = `image_to_convert_${Date.now()}.jpeg`; // Assurez-vous que l'extension correspond au type réel
      const response = await uploadImageForExcelConversion(imageUri, filename);
      setExcelUrl(response.excel_url);
      Alert.alert('Succès', 'Image uploadée et convertie ! Le fichier Excel est prêt à être téléchargé.');
    } catch (err: any) {
      console.error("Erreur lors de l'upload:", err);
      setError(err.message || 'Échec de l\'upload de l\'image.');
      Alert.alert('Erreur', err.message || 'Échec de l\'upload de l\'image.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (!excelUrl) {
      Alert.alert('Fichier introuvable', 'Aucun fichier Excel à télécharger.');
      setError('Aucune URL Excel disponible.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await downloadAndOpenExcel(excelUrl, 'converted_data.xlsx');
      Alert.alert('Succès', 'Le fichier Excel a été téléchargé et ouvert.');
    } catch (err: any) {
      console.error("Erreur lors du téléchargement:", err);
      setError(err.message || 'Échec du téléchargement du fichier Excel.');
      Alert.alert('Erreur', err.message || 'Échec du téléchargement du fichier Excel.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setImageUri(null);
    setExcelUrl(null);
    setError(null);
    setIsLoading(false);
  };

  return { isLoading, imageUri, excelUrl, pickImage, uploadImage, downloadExcel, reset, error };
};