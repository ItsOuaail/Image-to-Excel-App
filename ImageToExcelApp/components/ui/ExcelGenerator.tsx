import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { ScannedImage } from '../../app/(dash)/index';

interface ExcelGeneratorProps {
  images: ScannedImage[];
  onSuccess: () => void;
}

interface ExcelSettings {
  fileName: string;
  includeTimestamp: boolean;
  includeImageNames: boolean;
  autoSave: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
}

export default function ExcelGenerator({ images, onSuccess }: ExcelGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<ExcelSettings>({
    fileName: 'Tableaux_Scannes',
    includeTimestamp: true,
    includeImageNames: true,
    autoSave: true,
    compressionLevel: 'medium',
  });
  const [progress, setProgress] = useState(0);

  const updateSettings = (key: keyof ExcelSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const generateExcel = async () => {
    if (images.length === 0) {
      Alert.alert('Aucune image', 'Veuillez d\'abord scanner des images avant de générer le fichier Excel.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulation du processus de génération
      const steps = [
        'Préparation des images...',
        'Analyse des contenus...',
        'Fusion des données...',
        'Création du fichier Excel...',
        'Optimisation du fichier...',
        'Sauvegarde...',
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // Ici, vous intégrerez la vraie logique de génération Excel
      // avec une librairie comme react-native-xlsx ou similaire

      onSuccess();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la génération du fichier Excel.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const previewData = () => {
    Alert.alert(
      'Aperçu des données',
      `${images.length} images seront incluses dans le fichier Excel.\n\nNom du fichier: ${settings.fileName}.xlsx`,
      [{ text: 'OK' }]
    );
  };

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.settingsTitle}>⚙️ Paramètres de génération</Text>
      
      {/* Nom du fichier */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Nom du fichier</Text>
        <TextInput
          style={styles.textInput}
          value={settings.fileName}
          onChangeText={(text) => updateSettings('fileName', text)}
          placeholder="Nom du fichier Excel"
          placeholderTextColor="#6c757d"
        />
      </View>

      {/* Options */}
      <View style={styles.settingItem}>
        <View style={styles.switchRow}>
          <Text style={styles.settingLabel}>Inclure les horodatages</Text>
          <Switch
            value={settings.includeTimestamp}
            onValueChange={(value) => updateSettings('includeTimestamp', value)}
            thumbColor={settings.includeTimestamp ? '#007bff' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.switchRow}>
          <Text style={styles.settingLabel}>Inclure les noms d'images</Text>
          <Switch
            value={settings.includeImageNames}
            onValueChange={(value) => updateSettings('includeImageNames', value)}
            thumbColor={settings.includeImageNames ? '#007bff' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.switchRow}>
          <Text style={styles.settingLabel}>Sauvegarde automatique</Text>
          <Switch
            value={settings.autoSave}
            onValueChange={(value) => updateSettings('autoSave', value)}
            thumbColor={settings.autoSave ? '#007bff' : '#f4f3f4'}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
      </View>

      {/* Niveau de compression */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Niveau de compression</Text>
        <View style={styles.compressionButtons}>
          {(['low', 'medium', 'high'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.compressionButton,
                settings.compressionLevel === level && styles.compressionButtonActive
              ]}
              onPress={() => updateSettings('compressionLevel', level)}
            >
              <Text style={[
                styles.compressionButtonText,
                settings.compressionLevel === level && styles.compressionButtonTextActive
              ]}>
                {level === 'low' ? 'Faible' : level === 'medium' ? 'Moyen' : 'Élevé'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>📊 Statistiques</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{images.length}</Text>
          <Text style={styles.statLabel}>Images</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.round(images.length * 2.5)}</Text>
          <Text style={styles.statLabel}>MB estimés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Fichier Excel</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>Aucune donnée à exporter</Text>
      <Text style={styles.emptyText}>
        Scannez d'abord des images pour pouvoir générer un fichier Excel
      </Text>
    </View>
  );

  if (images.length === 0) {
    return renderEmptyState();
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderStats()}
      {renderSettings()}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={previewData}
          disabled={isGenerating}
        >
          <Text style={styles.previewButtonText}>👁️ Aperçu des données</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generateExcel}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <View style={styles.generatingContent}>
              <ActivityIndicator color="#ffffff" size="small" />
              <Text style={styles.generateButtonText}>Génération...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.generateIcon}>📥</Text>
              <Text style={styles.generateButtonText}>Générer Excel</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Barre de progression */}
      {isGenerating && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}

      {/* Informations supplémentaires */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ Informations</Text>
        <Text style={styles.infoText}>
          • Le fichier Excel contiendra toutes les données extraites des images scannées
        </Text>
        <Text style={styles.infoText}>
          • Les images seront analysées et leurs contenus seront structurés en tableaux
        </Text>
        <Text style={styles.infoText}>
          • Le fichier sera sauvegardé dans le dossier Téléchargements de votre appareil
        </Text>
        <Text style={styles.infoText}>
          • Format de sortie: .xlsx (compatible avec Excel, Google Sheets, etc.)
        </Text>
      </View>

      {/* Formats supportés */}
      <View style={styles.formatsContainer}>
        <Text style={styles.formatsTitle}>📋 Formats de sortie supportés</Text>
        <View style={styles.formatsList}>
          <View style={styles.formatItem}>
            <Text style={styles.formatIcon}>📊</Text>
            <Text style={styles.formatText}>Excel (.xlsx)</Text>
          </View>
          <View style={styles.formatItem}>
            <Text style={styles.formatIcon}>📑</Text>
            <Text style={styles.formatText}>CSV (.csv)</Text>
          </View>
          <View style={styles.formatItem}>
            <Text style={styles.formatIcon}>📄</Text>
            <Text style={styles.formatText}>PDF (.pdf)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#495057',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compressionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compressionButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    alignItems: 'center',
  },
  compressionButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  compressionButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  compressionButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  previewButton: {
    backgroundColor: '#17a2b8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  generateIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  generatingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 6,
  },
  formatsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  formatsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  formatItem: {
    alignItems: 'center',
    flex: 1,
  },
  formatIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  formatText: {
    fontSize: 12,
    color: '#495057',
    textAlign: 'center',
  },
});