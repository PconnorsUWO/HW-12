import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

export function AllergyWarning({ dangerousIngredients, visible = true }) {
  const [showModal, setShowModal] = useState(false);

  if (!dangerousIngredients || !dangerousIngredients.length || !visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.warningIcon} 
        onPress={() => setShowModal(true)}
      >
        <AlertTriangle size={20} color={COLORS.danger} />
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚠️ Allergy Warning</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <X size={24} color={COLORS.text} />
              </Pressable>
            </View>
            
            <Text style={styles.warningText}>
              Ingredients you have marked as dangerous are in this product!
            </Text>
            
            <ScrollView style={styles.ingredientsList} showsVerticalScrollIndicator={false}>
              {dangerousIngredients.map((ingredient, index) => (
                <View key={index} style={styles.dangerousIngredient}>
                  <Text style={styles.ingredientText}>• {ingredient}</Text>
                </View>
              ))}
            </ScrollView>
            
            <Pressable 
              style={styles.closeButton} 
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: SPACING.s,
  },
  warningIcon: {
    padding: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.l,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  warningText: {
    color: COLORS.danger,
    fontSize: 16,
    marginBottom: SPACING.m,
    lineHeight: 22,
  },
  ingredientsList: {
    maxHeight: 200,
    marginBottom: SPACING.l,
  },
  dangerousIngredient: {
    backgroundColor: COLORS.cardBackgroundLight,
    padding: SPACING.m,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.danger,
    marginBottom: SPACING.s,
  },
  ingredientText: {
    color: COLORS.text,
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
});