import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'history',
      title: 'Historique des scans',
      description: 'Consultez tous vos scans précédents',
      icon: '📋',
      color: '#007bff',
    },
    {
      id: 'templates',
      title: 'Modèles Excel',
      description: 'Créez et gérez vos modèles personnalisés',
      icon: '📄',
      color: '#28a745',
    },
    {
      id: 'cloud',
      title: 'Synchronisation Cloud',
      description: 'Sauvegardez vos données dans le cloud',
      icon: '☁️',
      color: '#17a2b8',
    },
    {
      id: 'ocr',
      title: 'Reconnaissance OCR',
      description: 'Améliorez la reconnaissance de texte',
      icon: '🔍',
      color: '#ffc107',
    },
    {
      id: 'export',
      title: 'Formats d\'export',
      description: 'Exportez vers différents formats',
      icon: '📊',
      color: '#dc3545',
    },
    {
      id: 'settings',
      title: 'Paramètres avancés',
      description: 'Configurez l\'application selon vos besoins',
      icon: '⚙️',
      color: '#6c757d',
    },
  ];

  const comingSoonFeatures = [
    {
      id: 'ai',
      title: 'IA Améliorée',
      description: 'Reconnaissance intelligente des données',
      icon: '🤖',
      status: 'Bientôt disponible',
      color: '#6f42c1',
    },
    {
      id: 'batch',
      title: 'Traitement par lots',
      description: 'Traitez plusieurs images simultanément',
      icon: '⚡',
      status: 'En développement',
      color: '#fd7e14',
    },
    {
      id: 'api',
      title: 'API Integration',
      description: 'Connectez-vous à vos systèmes existants',
      icon: '🔗',
      status: 'Planifié',
      color: '#20c997',
    },
  ];

  const handleFeaturePress = (featureId: string) => {
    setSelectedFeature(featureId);
    
    // Messages personnalisés selon la fonctionnalité
    const messages: { [key: string]: string } = {
      history: 'L\'historique des scans vous permettra de retrouver tous vos tableaux numérisés.',
      templates: 'Les modèles Excel personnalisés vous feront gagner du temps lors de vos exports.',
      cloud: 'La synchronisation cloud sécurisera vos données sur tous vos appareils.',
      ocr: 'L\'OCR amélioré reconnaîtra mieux le texte de vos tableaux manuscrits.',
      export: 'Exportez vos données vers PDF, CSV, JSON et bien d\'autres formats.',
      settings: 'Personnalisez la qualité de scan, les formats par défaut et plus encore.',
      ai: 'L\'IA détectera automatiquement les colonnes et lignes de vos tableaux.',
      batch: 'Scannez plusieurs pages d\'un coup et fusionnez-les automatiquement.',
      api: 'Intégrez vos scans directement dans vos logiciels de gestion existants.',
    };

    Alert.alert(
      'Fonctionnalité',
      messages[featureId] || 'Cette fonctionnalité sera disponible dans une prochaine version de l\'application.',
      [{ text: 'OK', onPress: () => setSelectedFeature(null) }]
    );
  };

  const handleSupportPress = (type: string) => {
    const messages: { [key: string]: string } = {
      guide: 'Le guide d\'utilisation détaillé sera bientôt disponible avec des tutoriels vidéo.',
      support: 'Notre équipe support est disponible pour vous aider avec vos scans et exports Excel.',
      rate: 'Votre avis nous aide à améliorer l\'application. Merci de nous évaluer !',
    };

    Alert.alert(
      'Information',
      messages[type] || 'Fonctionnalité en cours de développement.',
      [{ text: 'OK' }]
    );
  };

  const renderFeatureCard = (feature: any, isComingSoon = false) => (
    <TouchableOpacity
      key={feature.id}
      style={[
        styles.featureCard,
        selectedFeature === feature.id && styles.selectedFeatureCard,
        isComingSoon && styles.comingSoonCard,
      ]}
      onPress={() => handleFeaturePress(feature.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.featureIcon, { backgroundColor: feature.color || '#f8f9fa' }]}>
        <Text style={styles.featureIconText}>{feature.icon}</Text>
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
        {isComingSoon && (
          <Text style={styles.featureStatus}>{feature.status}</Text>
        )}
      </View>
      {!isComingSoon && (
        <Text style={styles.featureArrow}>→</Text>
      )}
      {isComingSoon && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonBadgeText}>Bientôt</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>📈 Statistiques d'utilisation</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Scans totaux</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Fichiers Excel</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>MB traités</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorer</Text>
        <Text style={styles.headerSubtitle}>Découvrez toutes les fonctionnalités</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        {renderStats()}

        {/* Fonctionnalités principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Fonctionnalités disponibles</Text>
          {features.map(feature => renderFeatureCard(feature))}
        </View>

        {/* Fonctionnalités à venir */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Prochainement</Text>
          {comingSoonFeatures.map(feature => renderFeatureCard(feature, true))}
        </View>

        {/* Aide et support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Aide et Support</Text>
          
          <TouchableOpacity 
            style={styles.supportCard}
            onPress={() => handleSupportPress('guide')}
            activeOpacity={0.7}
          >
            <Text style={styles.supportIcon}>📚</Text>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Guide d'utilisation</Text>
              <Text style={styles.supportDescription}>
                Apprenez à utiliser toutes les fonctionnalités de l'application
              </Text>
            </View>
            <Text style={styles.supportArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportCard}
            onPress={() => handleSupportPress('support')}
            activeOpacity={0.7}
          >
            <Text style={styles.supportIcon}>💬</Text>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Support technique</Text>
              <Text style={styles.supportDescription}>
                Contactez notre équipe pour obtenir de l'aide
              </Text>
            </View>
            <Text style={styles.supportArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportCard}
            onPress={() => handleSupportPress('rate')}
            activeOpacity={0.7}
          >
            <Text style={styles.supportIcon}>⭐</Text>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Évaluer l'application</Text>
              <Text style={styles.supportDescription}>
                Donnez votre avis sur l'App Store ou Google Play
              </Text>
            </View>
            <Text style={styles.supportArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Version et crédits */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 Dashboard Scan App</Text>
          <Text style={styles.footerSubText}>
            Application de scan de tableaux et génération Excel
          </Text>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
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
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedFeatureCard: {
    borderColor: '#007bff',
    borderWidth: 2,
    backgroundColor: '#f8f9ff',
  },
  comingSoonCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
    paddingRight: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  featureStatus: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 4,
  },
  featureArrow: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  comingSoonBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#212529',
  },
  supportCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  supportIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  supportContent: {
    flex: 1,
    paddingRight: 8,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  supportArrow: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});