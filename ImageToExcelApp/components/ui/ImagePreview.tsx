import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { ScannedImage } from '../../dash/index';

interface ImagePreviewProps {
  images: ScannedImage[];
  onDeleteImage: (imageId: string) => void;
  onClearAll: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ImagePreview({ images, onDeleteImage, onClearAll }: ImagePreviewProps) {
  const [selectedImage, setSelectedImage] = useState<ScannedImage | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openImageModal = (image: ScannedImage) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsModalVisible(false);
  };

  const confirmDelete = (imageId: string) => {
    Alert.alert(
      'Supprimer l\'image',
      'Êtes-vous sûr de vouloir supprimer cette image?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            onDeleteImage(imageId);
            if (selectedImage?.id === imageId) {
              closeImageModal();
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderImageItem = ({ item }: { item: ScannedImage }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => openImageModal(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      <View style={styles.imageInfo}>
        <Text style={styles.imageName}>{item.name}</Text>
        <Text style={styles.imageDate}>{formatDate(item.timestamp)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📷</Text>
      <Text style={styles.emptyTitle}>Aucune image scannée</Text>
      <Text style={styles.emptyText}>
        Commencez par scanner des tableaux depuis l'onglet Scanner
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Images Scannées</Text>
        <Text style={styles.headerCount}>
          {images.length} image{images.length !== 1 ? 's' : ''}
        </Text>
      </View>
      {images.length > 0 && (
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={onClearAll}
        >
          <Text style={styles.clearAllText}>Tout effacer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {images.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
          
          {/* Fusion Preview */}
          <View style={styles.fusionContainer}>
            <Text style={styles.fusionTitle}>🔗 Aperçu de la Fusion</Text>
            <Text style={styles.fusionDescription}>
              Les images seront fusionnées dans l'ordre affiché ci-dessus
            </Text>
            <TouchableOpacity style={styles.previewFusionButton}>
              <Text style={styles.previewFusionText}>Prévisualiser la Fusion</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Full Screen Image Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={closeImageModal}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              {selectedImage && (
                <>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalImageName}>{selectedImage.name}</Text>
                    <Text style={styles.modalImageDate}>
                      {formatDate(selectedImage.timestamp)}
                    </Text>
                  </View>
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalDeleteButton}
                      onPress={() => confirmDelete(selectedImage.id)}
                    >
                      <Text style={styles.modalDeleteText}>🗑️ Supprimer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={closeImageModal}
                    >
                      <Text style={styles.modalCloseText}>✖️ Fermer</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerCount: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  clearAllButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearAllText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  imageItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  imageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  imageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  imageDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
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
  fusionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fusionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  fusionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  previewFusionButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewFusionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    alignItems: 'center',
  },
  fullImage: {
    width: screenWidth - 40,
    height: screenHeight * 0.6,
    borderRadius: 12,
  },
  modalInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  modalImageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  modalImageDate: {
    fontSize: 14,
    color: '#6c757d',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  modalDeleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  modalDeleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});