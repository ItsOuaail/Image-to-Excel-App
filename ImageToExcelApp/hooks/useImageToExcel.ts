import { useState, useRef, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:8000/api';
const POLL_DELAY   = 4000;   // 4 s
const MAX_POLLS    = 45;     // ~3 min

/* --------------- utilitaire de téléchargement --------------- */
const downloadConversion = async (conversionId: number) => {
  const token = await AsyncStorage.getItem('authToken');
  if (!token) throw new Error('Jeton d’authentification introuvable');

  const url       = `${API_BASE_URL}/conversions/${conversionId}/download`;
  const filename  = `conversion_${conversionId}.xlsx`;
  const destPath  = FileSystem.documentDirectory + filename;

  // ① Téléchargement
  const { uri } = await FileSystem.downloadAsync(url, destPath, {
    headers: { Authorization: `Bearer ${token}` },
  });

  /* ---------------- Android ---------------- */
  if (Platform.OS === 'android') {
    // Expo 49+ : transforme file:// en content:// sharable
    const contentUri = await FileSystem.getContentUriAsync(uri);

    // ② Ouvre Excel / Office / WPS…
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data : contentUri,
      type : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      flags: 1,                               // FLAG_GRANT_READ_URI_PERMISSION
    });
  }
  /* ---------------- iOS -------------------- */
  else {
    await Sharing.shareAsync(uri);
  }
};


/* -------------------- hook principal ------------------------ */
export const useImageToExcel = () => {
  const [imageUri, setImageUri]   = useState<string | null>(null);
  const [convId,   setConvId]     = useState<number | null>(null);
  const [isBusy,   setIsBusy]     = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ----------- Sélection d’image ----------- */
  const pickImage = async () => {
    reset();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l’accès à la galerie.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes   : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect       : [4, 3],
      quality      : 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  /* ------------- Upload + polling ------------- */
  const uploadImage = async () => {
    if (!imageUri) return setError('Sélectionnez une image.');
    setIsBusy(true); setError(null);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Authentification requise.');

      const ext  = imageUri.split('.').pop() || 'jpg';
      const form = new FormData();
      form.append('image', { uri: imageUri, name: `image.${ext}`, type: `image/${ext}` } as any);

      const res   = await fetch(`${API_BASE_URL}/conversions`, {
        method : 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        body   : form,
      });
      const json  = await res.json();
      if (!res.ok) throw new Error(json.message || 'Erreur serveur');

      pollStatus(json.id, token, 0);      // ▶️ lancement du polling
    } catch (e: any) {
      setError(e.message); setIsBusy(false);
    }
  };

  /* --------------- polling récursif --------------- */
  /* --------------- polling récursif --------------- */
  const pollStatus = async (id: number, token: string, attempt: number) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/conversions/${id}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();          // <-- toujours parser la réponse

      /* -------- 1️⃣ fichier prêt -------- */
      if (res.status === 200 && json?.data?.status === 'completed') {
        setConvId(id);
        await downloadConversion(id);         // 📥 ouvre automatiquement
        Alert.alert('Succès', 'Le fichier Excel s’est ouvert.');
        setIsBusy(false);
        return;                               // stop le polling
      }

      /* -------- 2️⃣ encore en cours -------- */
      if (res.status === 202) {
        if (attempt >= MAX_POLLS)
          throw new Error('Temps dépassé, réessayez plus tard.');
        timerRef.current = setTimeout(
          () => pollStatus(id, token, attempt + 1),
          POLL_DELAY
        );
        return;
      }

      /* -------- 3️⃣ échec remonté -------- */
      throw new Error(
        json?.message || 'La conversion a échoué, veuillez réessayer.'
      );
    } catch (e: any) {
      setError(e.message);
      setIsBusy(false);
    }
  };


  /* ----------------- reset & cleanup ----------------- */
  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setImageUri(null); setConvId(null); setError(null); setIsBusy(false);
  };

  useEffect(() => () => reset(), []);   // cleanup automatique au démontage

  return {
    imageUri,
    conversionId : convId,
    isLoading    : isBusy,
    error,
    pickImage,
    uploadImage,
    reset,            // plus besoin de downloadExcel ici
  };
};
