import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ApiResponse } from '../types'; // Assurez-vous que ApiResponse est défini

const API_BASE_URL = Constants?.expoConfig?.extra?.API_BASE_URL || process.env.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface UploadResponse {
  excel_url: string; // URL du fichier Excel généré
  message: string;
}

/**
 * Uploade une image vers le backend pour conversion en Excel.
 * @param imageUri URI de l'image sur l'appareil.
 * @param filename Nom du fichier à utiliser pour l'upload.
 * @returns Promise résolue avec l'URL du fichier Excel ou une erreur.
 */
export const uploadImageForExcelConversion = async (imageUri: string, filename: string): Promise<UploadResponse> => {
  try {
    // Créez un objet FormData pour l'upload de fichier
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: 'image/jpeg', // Ou image/png, selon le type de fichier
    } as any); // Le 'as any' est souvent nécessaire pour le type de React Native Blob/File

    const response = await api.post<ApiResponse<UploadResponse>>('/convert-image-to-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Indispensable pour l'upload de fichiers
      },
    });

    if (response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'La conversion a échoué sans message d\'erreur.');
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de l\'image:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Échec de la conversion de l\'image en Excel.';
  }
};

/**
 * Télécharge et ouvre un fichier à partir d'une URL.
 * @param fileUrl URL du fichier à télécharger.
 * @param filename Nom sous lequel enregistrer le fichier.
 */
export const downloadAndOpenExcel = async (fileUrl: string, filename: string = 'converted_excel.xlsx'): Promise<void> => {
  try {
    const fileExtension = filename.split('.').pop();
    const localUri = FileSystem.documentDirectory + filename;

    const { uri: downloadedUri } = await FileSystem.downloadAsync(fileUrl, localUri);

    console.log('Fichier téléchargé vers:', downloadedUri);

    // Vérifiez si le partage est disponible
    if (!(await Sharing.isAvailableAsync())) {
      console.warn("Le partage n'est pas disponible sur cette plateforme");
      alert("Le partage de fichiers n'est pas disponible sur votre appareil.");
      return;
    }

    // Ouvre le fichier avec l'application par défaut
    await Sharing.shareAsync(downloadedUri);

  } catch (error) {
    console.error('Erreur lors du téléchargement ou de l\'ouverture du fichier:', error);
    throw new Error('Échec du téléchargement ou de l\'ouverture du fichier Excel.');
  }
};