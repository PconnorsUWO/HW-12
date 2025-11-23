import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, Easing, Modal, ScrollView, TouchableWithoutFeedback, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, XCircle, BookOpen, Activity, ChevronRight, List, ShieldAlert, Link as LinkIcon, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../constants/theme';
import { MODAL_TYPES, SCORE_THRESHOLDS, CARD_TITLES, LABELS, ERROR_MESSAGES, LOADING_MESSAGES, EMPTY_STATES, UI_TEXT } from '../constants/types';
import { uploadImage } from '../services/api';
import IngredientPopup from '../components/IngredientPopup';
import sampleIngredientData from '../data/sampleIngredient.json';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Info Card Component ---
const InfoCard = ({ title, icon: Icon, color, onPress, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
        ]).start();
    }, []);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity style={styles.infoCard} onPress={handlePress} activeOpacity={0.7}>
                <View style={[styles.iconContainer, { backgroundColor: color }]}>
                    <Icon size={24} color={COLORS.black} />
                </View>
                <Text style={styles.cardMainTitle}>{title}</Text>
                <ChevronRight size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- Detail Modal Component ---
const DetailModal = ({ visible, onClose, title, color, children, icon: Icon }) => {
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

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalBackdrop} />
                </TouchableWithoutFeedback>
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    <View style={[styles.modalHeader, { backgroundColor: color }]}>
                        <View style={styles.modalHeaderTop}>
                            {Icon && <Icon size={24} color="#000" />}
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <XCircle size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody}>
                        {children}
                        <View style={{ height: 50 }} />
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

export default function ResultsScreen({ route, navigation }) {
    const { imageUri } = route.params;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const insets = useSafeAreaInsets();

    // Animation for loading bar
    const progress = useRef(new Animated.Value(0)).current;

    // Modal State
    const [activeModal, setActiveModal] = useState(null);

    // Ingredient Popup State
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [showIngredientPopup, setShowIngredientPopup] = useState(false);

    const handleIngredientPress = (ingredientName) => {
        // For demonstration, we'll use the sample Caffeine data if the user clicks "Caffeine"
        // In a real app, you'd fetch specific data for the clicked ingredient
        if (ingredientName.toLowerCase().includes('caffeine')) {
            setSelectedIngredient(sampleIngredientData);
        } else {
            // Fallback or fetch logic would go here
            // For now, let's just show the sample data for ANY click to demonstrate the UI
            setSelectedIngredient({
                ...sampleIngredientData,
                name: ingredientName, // Just to show dynamic title
            });
        }
        setShowIngredientPopup(true);
    };

    useEffect(() => {
        // Start Loading Animation
        Animated.timing(progress, {
            toValue: 0.7,
            duration: 2000,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
        }).start();

        const fetchData = async () => {
            try {
                const result = await uploadImage(imageUri);
                const analysisData = result.analysis || result;

                // Data is now already in the correct format from backend
                setData(analysisData);
            } catch (err) {
                console.error(err);
                setError(ERROR_MESSAGES.ANALYSIS_FAILED);
            } finally {
                Animated.timing(progress, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: false,
                }).start(() => {
                    setTimeout(() => setLoading(false), 200);
                });
            }
        };

        fetchData();
    }, [imageUri]);

    const getScoreColor = (score) => {
        if (score >= SCORE_THRESHOLDS.HIGH) return COLORS.success;
        if (score >= SCORE_THRESHOLDS.MEDIUM) return COLORS.warning;
        return COLORS.danger;
    };

    // Loading View
    if (loading) {
        const width = progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        });

        return (
            <View style={styles.container}>
                <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={20} />
                <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>{LOADING_MESSAGES.ANALYZING}</Text>
                    <Text style={styles.loadingSubText}>{LOADING_MESSAGES.IDENTIFYING}</Text>
                    <View style={styles.progressBarContainer}>
                        <Animated.View style={[styles.progressBarFill, { width }]} />
                    </View>
                    <Text style={styles.loadingPercent}>{LOADING_MESSAGES.SCANNING}</Text>
                </View>
            </View>
        );
    }

    if (error || !data) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={20} />
                <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>{UI_TEXT.ERROR}</Text>
                    <Text style={styles.loadingSubText}>{error || ERROR_MESSAGES.NO_DATA}</Text>
                </View>
            </View>
        );
    }

    const scoreColor = getScoreColor(data.overallWeightedHealthScore);

    return (
        <View style={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={10} />

            <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={{ height: 60 }} />

                {/* Score Section (Restored) */}
                <View style={styles.scoreSection}>
                    <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                        <Text style={[styles.scoreValue, { color: scoreColor }]}>{data.overallWeightedHealthScore}</Text>
                    </View>
                    <View style={styles.scoreTextContainer}>
                        <Text style={styles.scoreLabel}>{CARD_TITLES.HEALTH_SCORE}</Text>
                    </View>
                </View>

                {/* Interactive Cards */}
                <View style={styles.cardsContainer}>

                    {/* 1. Overall Analysis */}
                    <InfoCard
                        title={CARD_TITLES.OVERALL_ANALYSIS}
                        icon={FileText}
                        color={scoreColor}
                        delay={0}
                        onPress={() => setActiveModal(MODAL_TYPES.ANALYSIS)}
                    />

                    {/* 2. Ingredients List */}
                    <InfoCard
                        title={CARD_TITLES.INGREDIENTS_LIST}
                        icon={List}
                        color={COLORS.primary}
                        delay={100}
                        onPress={() => setActiveModal(MODAL_TYPES.INGREDIENTS)}
                    />

                    {/* 3. Potentially Harmful Components */}
                    <InfoCard
                        title={CARD_TITLES.HARMFUL_COMPONENTS}
                        icon={ShieldAlert}
                        color={COLORS.danger}
                        delay={200}
                        onPress={() => setActiveModal(MODAL_TYPES.HARMFUL)}
                    />

                    {/* 4. Potential Side Effects */}
                    <InfoCard
                        title={CARD_TITLES.POTENTIAL_SIDE_EFFECTS}
                        icon={AlertTriangle}
                        color={COLORS.warning}
                        delay={300}
                        onPress={() => setActiveModal(MODAL_TYPES.EFFECTS)}
                    />

                    {/* 5. Scholarly Sources */}
                    <InfoCard
                        title={CARD_TITLES.SCHOLARLY_SOURCES}
                        icon={BookOpen}
                        color={COLORS.secondary}
                        delay={500}
                        onPress={() => setActiveModal(MODAL_TYPES.SOURCES)}
                    />
                </View>
            </ScrollView>

            {/* --- Modals --- */}

            {/* Overall Analysis Modal */}
            <DetailModal
                visible={activeModal === MODAL_TYPES.ANALYSIS}
                onClose={() => setActiveModal(null)}
                title={CARD_TITLES.OVERALL_ANALYSIS}
                color={scoreColor}
                icon={FileText}
            >
                <Text style={styles.modalBodyText}>{data.overallAnalysis}</Text>
            </DetailModal>

            {/* Ingredients Modal */}
            <DetailModal
                visible={activeModal === MODAL_TYPES.INGREDIENTS}
                onClose={() => setActiveModal(null)}
                title={CARD_TITLES.INGREDIENTS_LIST}
                color={COLORS.primary}
                icon={List}
            >
                {data.ingredients && data.ingredients.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.listItem}
                        onPress={() => handleIngredientPress(item.name)}
                    >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.listItemTitle}>{item.name}</Text>
                            <ChevronRight size={16} color={COLORS.textSecondary} />
                        </View>
                        <Text style={styles.listItemText}>{item.function}</Text>
                    </TouchableOpacity>
                ))}
            </DetailModal>

            {/* Harmful Components Modal */}
            <DetailModal
                visible={activeModal === MODAL_TYPES.HARMFUL}
                onClose={() => setActiveModal(null)}
                title={CARD_TITLES.HARMFUL_COMPONENTS}
                color={COLORS.danger}
                icon={ShieldAlert}
            >
                {(!data.harmfulComponents || data.harmfulComponents.length === 0) ? (
                    <Text style={styles.modalBodyText}>{EMPTY_STATES.NO_HARMFUL_COMPONENTS}</Text>
                ) : (
                    data.harmfulComponents.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardBody}>{item.concern}</Text>
                            <Text style={styles.cardLabel}>{LABELS.SEVERITY} {item.severity}</Text>
                        </View>
                    ))
                )}
            </DetailModal>

            {/* Side Effects Modal */}
            <DetailModal
                visible={activeModal === MODAL_TYPES.EFFECTS}
                onClose={() => setActiveModal(null)}
                title={CARD_TITLES.POTENTIAL_SIDE_EFFECTS}
                color={COLORS.warning}
                icon={AlertTriangle}
            >
                {(!data.sideEffects || data.sideEffects.length === 0) ? (
                    <Text style={styles.modalBodyText}>{EMPTY_STATES.NO_SIDE_EFFECTS}</Text>
                ) : (
                    data.sideEffects.map((item, index) => (
                        <View key={index} style={styles.listItem}>
                            <Text style={styles.listItemTitle}>{item.effect}</Text>
                            <Text style={styles.listItemText}>{LABELS.FREQUENCY} {item.frequency}</Text>
                        </View>
                    ))
                )}
            </DetailModal>

            {/* Combos Modal */}
            <DetailModal
                visible={activeModal === MODAL_TYPES.COMBOS}
                onClose={() => setActiveModal(null)}
                title={CARD_TITLES.HARMFUL_COMBINATIONS}
                color={COLORS.danger}
                icon={XCircle}
            >
                {(!data.harmfulCombinations || data.harmfulCombinations.length === 0) ? (
                    <Text style={styles.modalBodyText}>{EMPTY_STATES.NO_COMBINATIONS}</Text>
                ) : (
                    data.harmfulCombinations.map((combo, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.cardTitle}>Combo #{index + 1}</Text>
                            <Text style={styles.cardBody}>{combo.combo}</Text>
                            <Text style={styles.cardLabel}>{LABELS.RISK}</Text>
                            <Text style={styles.cardRisk}>{combo.risk}</Text>
                        </View>
                    ))
                )}
            </DetailModal>

            {/* Sources Modal */}
            <DetailModal
                visible={activeModal === MODAL_TYPES.SOURCES}
                onClose={() => setActiveModal(null)}
                title={CARD_TITLES.SCHOLARLY_SOURCES}
                color={COLORS.secondary}
                icon={BookOpen}
            >
                {(!data.scholarlySources || data.scholarlySources.length === 0) ? (
                    <Text style={styles.modalBodyText}>{EMPTY_STATES.NO_SOURCES}</Text>
                ) : (
                    data.scholarlySources.map((source, index) => (
                        <TouchableOpacity key={index} style={styles.card} onPress={() => source.url && Linking.openURL(source.url)}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <LinkIcon size={16} color={COLORS.primary} />
                                <Text style={[styles.cardTitle, { color: COLORS.primary, marginBottom: 0 }]}>{LABELS.SOURCE} {index + 1}</Text>
                            </View>
                            <Text style={[styles.cardBody, { marginTop: 8 }]}>{source.citation}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </DetailModal>

            {/* Reusable Ingredient Popup */}
            <IngredientPopup
                visible={showIngredientPopup}
                onClose={() => setShowIngredientPopup(false)}
                data={selectedIngredient}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
        paddingHorizontal: SPACING.m,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.overlayMedium,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: SPACING.m,
        paddingTop: 80,
    },
    // Score Section
    scoreSection: {
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    scoreCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.s,
        backgroundColor: COLORS.overlayMedium,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: '800',
    },
    scoreTextContainer: {
        alignItems: 'center',
    },
    scoreLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    assessment: {
        fontSize: 24,
        fontWeight: '800',
    },
    // Cards Layout
    cardsContainer: {
        gap: SPACING.m,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        borderRadius: 20,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    cardMainTitle: {
        flex: 1,
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    // Loading Styles
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: SPACING.xs,
        letterSpacing: 0.5,
    },
    loadingSubText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginBottom: SPACING.xl,
    },
    progressBarContainer: {
        width: '80%',
        height: 6,
        backgroundColor: COLORS.borderLight,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: SPACING.s,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    loadingPercent: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.overlayDark,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        overflow: 'hidden',
    },
    modalHeader: {
        padding: SPACING.m,
        paddingTop: SPACING.l,
    },
    modalHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.black,
        flex: 1,
        marginLeft: SPACING.s,
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: SPACING.m,
    },
    modalBodyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
        marginBottom: SPACING.m,
    },
    listItem: {
        marginBottom: SPACING.m,
        paddingLeft: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingBottom: SPACING.s,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    listItemText: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    card: {
        backgroundColor: COLORS.cardBackgroundLight,
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    cardBody: {
        fontSize: 14,
        color: COLORS.text,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginTop: 8,
        marginBottom: 4,
    },
    cardRisk: {
        fontSize: 14,
        color: COLORS.danger,
        marginBottom: 2,
    },
    // Analysis Modal Specifics
    scoreBadgeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
        paddingBottom: SPACING.s,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    scoreBadgeText: {
        fontSize: 20,
        fontWeight: '800',
    },
    assessmentText: {
        fontSize: 18,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
