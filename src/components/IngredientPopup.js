import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Dimensions, Animated, Linking } from 'react-native';
import { X, ExternalLink, Activity, Clock, BookOpen, AlertTriangle } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'dosage', label: 'Dosage' },
    { id: 'citations', label: 'Citations' },
];

const GradeBadge = ({ grade }) => {
    const getColor = (g) => {
        switch (g) {
            case 'A': return COLORS.success;
            case 'B': return COLORS.primary;
            case 'C': return COLORS.warning;
            case 'D': return COLORS.danger;
            default: return COLORS.textSecondary;
        }
    };
    return (
        <View style={[styles.gradeBadge, { backgroundColor: getColor(grade) }]}>
            <Text style={styles.gradeText}>{grade}</Text>
        </View>
    );
};

export default function IngredientPopup({ visible, onClose, data }) {
    const [activeTab, setActiveTab] = useState('overview');
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible || !data) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>What is it?</Text>
                        <Text style={styles.bodyText}>{data.summary}</Text>

                        <View style={styles.tagsContainer}>
                            {data.tags && data.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            case 'evidence':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Human Effect Matrix</Text>
                        <Text style={styles.subtitle}>Scientific consensus on effects.</Text>

                        {data.evidenceMap && data.evidenceMap.map((item, index) => (
                            <View key={index} style={styles.evidenceCard}>
                                <View style={styles.evidenceHeader}>
                                    <Text style={styles.evidenceEffect}>{item.effect}</Text>
                                    <GradeBadge grade={item.grade} />
                                </View>
                                <View style={styles.evidenceRow}>
                                    <Text style={styles.evidenceLabel}>Magnitude:</Text>
                                    <Text style={styles.evidenceValue}>{item.magnitude}</Text>
                                </View>
                                <View style={styles.evidenceRow}>
                                    <Text style={styles.evidenceLabel}>Consistency:</Text>
                                    <Text style={styles.evidenceValue}>{item.consistency}</Text>
                                </View>
                                <Text style={styles.evidenceDetails}>{item.details}</Text>
                            </View>
                        ))}
                    </View>
                );
            case 'dosage':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>How to take</Text>

                        <View style={styles.infoBox}>
                            <View style={styles.infoRow}>
                                <Activity size={20} color={COLORS.primary} />
                                <Text style={styles.infoTitle}>Recommended Dosage</Text>
                            </View>
                            <Text style={styles.bodyText}>{data.dosage.instruction}</Text>
                        </View>

                        <View style={styles.infoBox}>
                            <View style={styles.infoRow}>
                                <Clock size={20} color={COLORS.warning} />
                                <Text style={styles.infoTitle}>Timing</Text>
                            </View>
                            <Text style={styles.bodyText}>{data.dosage.timing}</Text>
                        </View>

                        <View style={[styles.infoBox, { borderColor: COLORS.danger }]}>
                            <View style={styles.infoRow}>
                                <AlertTriangle size={20} color={COLORS.danger} />
                                <Text style={[styles.infoTitle, { color: COLORS.danger }]}>Notes</Text>
                            </View>
                            <Text style={styles.bodyText}>{data.dosage.notes}</Text>
                        </View>
                    </View>
                );
            case 'citations':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Scientific References</Text>
                        {data.citations && data.citations.map((cite, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.citationCard}
                                onPress={() => cite.link && Linking.openURL(cite.link)}
                            >
                                <Text style={styles.citationId}>[{cite.id}]</Text>
                                <Text style={styles.citationText}>{cite.text}</Text>
                                <ExternalLink size={16} color={COLORS.primary} style={{ marginTop: 4 }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} />

                <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1, marginRight: SPACING.s }}>
                            <Text style={styles.title}>{data.name}</Text>
                            <Text style={styles.headerSubtitle}>Ingredient Analysis</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        {TABS.map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Content */}
                    <ScrollView contentContainerStyle={styles.content}>
                        {renderContent()}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    container: {
        height: '85%',
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tab: {
        marginRight: SPACING.l,
        paddingVertical: SPACING.xs,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.primary,
        color: '#FFF',
    },
    // Content
    content: {
        padding: SPACING.m,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        fontStyle: 'italic',
    },
    bodyText: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 24,
        marginBottom: SPACING.m,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: SPACING.s,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    // Evidence Card
    evidenceCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    evidenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    evidenceEffect: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    gradeBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradeText: {
        fontWeight: '800',
        color: '#000',
    },
    evidenceRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    evidenceLabel: {
        color: COLORS.textSecondary,
        width: 100,
        fontWeight: '600',
    },
    evidenceValue: {
        color: '#FFF',
    },
    evidenceDetails: {
        marginTop: SPACING.s,
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    // Info Box (Dosage)
    infoBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
        gap: 8,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    // Citations
    citationCard: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: SPACING.m,
        paddingBottom: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    citationId: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    citationText: {
        flex: 1,
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
});
