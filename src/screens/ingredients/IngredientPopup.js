import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';
import { X, ExternalLink, Award, TrendingUp, AlertCircle, Clock, BookOpen } from 'lucide-react-native';
import { COLORS, SPACING } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const GRADE_COLORS = {
    'A': COLORS.success,
    'B': COLORS.warning,
    'C': COLORS.danger,
    'D': COLORS.danger,
    'F': COLORS.danger,
};

const MAGNITUDE_COLORS = {
    'Strong': COLORS.success,
    'Moderate': COLORS.warning,
    'Minor': COLORS.textSecondary,
    'Negative': COLORS.danger,
};

export default function IngredientPopup({ visible, ingredient, onClose }) {
    if (!ingredient) return null;

    const openLink = (url) => {
        Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <Text style={styles.title}>{ingredient.name}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        {ingredient.tags && ingredient.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {ingredient.tags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Summary */}
                        {ingredient.summary && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Summary</Text>
                                <Text style={styles.summaryText}>{ingredient.summary}</Text>
                            </View>
                        )}

                        {/* Evidence Map */}
                        {ingredient.evidenceMap && ingredient.evidenceMap.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Award size={20} color={COLORS.primary} />
                                    <Text style={styles.sectionTitle}>Evidence</Text>
                                </View>
                                {ingredient.evidenceMap.map((evidence, index) => (
                                    <View key={index} style={styles.evidenceCard}>
                                        <View style={styles.evidenceHeader}>
                                            <Text style={styles.effectName}>{evidence.effect}</Text>
                                            <View style={styles.gradeBadge}>
                                                <Text style={[styles.gradeText, { color: GRADE_COLORS[evidence.grade] || COLORS.text }]}>
                                                    {evidence.grade}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.evidenceMeta}>
                                            <View style={[styles.magnitudeBadge, { backgroundColor: MAGNITUDE_COLORS[evidence.magnitude] || COLORS.surface }]}>
                                                <TrendingUp size={12} color={COLORS.text} />
                                                <Text style={styles.magnitudeText}>{evidence.magnitude}</Text>
                                            </View>
                                            <View style={styles.consistencyBadge}>
                                                <Text style={styles.consistencyText}>{evidence.consistency}</Text>
                                            </View>
                                        </View>
                                        {evidence.details && (
                                            <Text style={styles.evidenceDetails}>{evidence.details}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Dosage */}
                        {ingredient.dosage && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Clock size={20} color={COLORS.secondary} />
                                    <Text style={styles.sectionTitle}>Dosage</Text>
                                </View>
                                {ingredient.dosage.instruction && (
                                    <View style={styles.dosageCard}>
                                        <Text style={styles.dosageLabel}>Instruction</Text>
                                        <Text style={styles.dosageText}>{ingredient.dosage.instruction}</Text>
                                    </View>
                                )}
                                {ingredient.dosage.timing && (
                                    <View style={styles.dosageCard}>
                                        <Text style={styles.dosageLabel}>Timing</Text>
                                        <Text style={styles.dosageText}>{ingredient.dosage.timing}</Text>
                                    </View>
                                )}
                                {ingredient.dosage.notes && (
                                    <View style={styles.dosageCard}>
                                        <Text style={styles.dosageLabel}>Notes</Text>
                                        <Text style={styles.dosageText}>{ingredient.dosage.notes}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Citations */}
                        {ingredient.citations && ingredient.citations.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <BookOpen size={20} color={COLORS.primary} />
                                    <Text style={styles.sectionTitle}>Citations</Text>
                                </View>
                                {ingredient.citations.map((citation, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.citationCard}
                                        onPress={() => citation.link && openLink(citation.link)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.citationText}>{citation.text}</Text>
                                        {citation.link && (
                                            <ExternalLink size={16} color={COLORS.secondary} style={styles.linkIcon} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: COLORS.overlayDark,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.m,
    },
    container: {
        width: '100%',
        maxWidth: 500,
        maxHeight: SCREEN_HEIGHT * 0.9,
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: COLORS.background,
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING.s,
        gap: SPACING.xs,
    },
    tag: {
        backgroundColor: COLORS.cardBackground,
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    tagText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.l,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    summaryText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    evidenceCard: {
        backgroundColor: COLORS.cardBackgroundLight,
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    evidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    effectName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
    },
    gradeBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    gradeText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    evidenceMeta: {
        flexDirection: 'row',
        gap: SPACING.s,
        marginBottom: SPACING.s,
    },
    magnitudeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    magnitudeText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text,
    },
    consistencyBadge: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    consistencyText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    evidenceDetails: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    dosageCard: {
        backgroundColor: COLORS.cardBackgroundLight,
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    dosageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
    },
    dosageText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    citationCard: {
        backgroundColor: COLORS.cardBackgroundLight,
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    citationText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        flex: 1,
        lineHeight: 20,
    },
    linkIcon: {
        marginLeft: SPACING.s,
    },
});

