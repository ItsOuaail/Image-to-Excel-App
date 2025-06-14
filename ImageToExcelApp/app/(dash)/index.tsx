import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageScanner from '../../components/ui/ImageScanner';
import ImagePreview from '../../components/ui/ImagePreview';
import ExcelGenerator from '../../components/ui/ExcelGenerator';

export interface ScannedImage {
  id: string;
  uri: string;
  name: string;
  timestamp: Date;
}

export default function DashboardScreen() {
  const [scannedImages, setScannedImages] = useState<ScannedImage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'preview' | 'excel'>('scan');

  const handleImageScanned = (imageUri: string) => {
    const newImage: ScannedImage = {
      id: Date.now().toString(),
      uri: imageUri,
      name: `Tableau_${scannedImages.length + 1}`,
      timestamp: new Date(),
    };
    
    setScannedImages(prev => [...prev, newImage]);
    Alert.alert('Succès', 'Image scannée avec succès!');
  };

  const handleDeleteImage = (imageId: string) => {
    Alert.alert(
      'Supprimer l\'image',
      'Êtes-vous sûr de vouloir supprimer cette image?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setScannedImages(prev => prev.filter(img => img.id !== imageId));
          },
        },
      ]
    );
  };

  const clearAllImages = () => {
    Alert.alert(
      'Effacer tout',
      'Êtes-vous sûr de vouloir supprimer toutes les images?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => setScannedImages([]),
        },
      ]
    );
  };

  const renderTabButton = (tab: 'scan' | 'preview' | 'excel', title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'scan':
        return (
          <ImageScanner
            onImageScanned={handleImageScanned}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />
        );
      case 'preview':
        return (
          <ImagePreview
            images={scannedImages}
            onDeleteImage={handleDeleteImage}
            onClearAll={clearAllImages}
          />
        );
      case 'excel':
        return (
          <ExcelGenerator
            images={scannedImages}
            onSuccess={() => Alert.alert('Succès', 'Fichier Excel généré avec succès!')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Scan</Text>
        <Text style={styles.headerSubtitle}>
          {scannedImages.length} image{scannedImages.length !== 1 ? 's' : ''} scannée{scannedImages.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('scan', 'Scanner', '📷')}
        {renderTabButton('preview', 'Aperçu', '🖼️')}
        {renderTabButton('excel', 'Excel', '📊')}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  activeTabButton: {
    backgroundColor: '#007bff',
  },
  tabIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});