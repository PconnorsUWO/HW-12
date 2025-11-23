import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, Easing, Modal, ScrollView, TouchableWithoutFeedback, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, XCircle, BookOpen, Activity, ChevronRight, List, ShieldAlert, Link as LinkIcon, FileText } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../constants/theme';
import { MODAL_TYPES, SCORE_THRESHOLDS, CARD_TITLES, LABELS, ERROR_MESSAGES, LOADING_MESSAGES, EMPTY_STATES, UI_TEXT } from '../constants/types';
import { uploadImage } from '../services/api';
import { AllergyWarning } from '../components/AllergyWarning';
import { AllergyService } from '../services/allergies';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Info Card Component ---
const InfoCard = ({ title, icon: Icon, color, onPress, delay = 0 }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay,
                useNativeDriver: true,
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
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                    <Icon size={24} color={color} />
                </View>
                <Text style={styles.cardMainTitle}>{title}</Text>
                <View style={[styles.arrowContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                </View>
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
                duration: 250,
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
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHeaderTop}>
                            <View style={[styles.modalIcon, { backgroundColor: color }]}>
                                {Icon && <Icon size={24} color={COLORS.black} />}
                            </View>
                            <Text style={styles.modalTitle}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <XCircle size={28} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {children}
                        <View style={{ height: 100 }} />
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

    // Allergy state
    const [userAllergies, setUserAllergies] = useState([]);
    const [dangerousIngredients, setDangerousIngredients] = useState([]);

    // Animation for loading bar
    const progress = useRef(new Animated.Value(0)).current;

    // Modal State
    const [activeModal, setActiveModal] = useState(null);

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

                // Check for allergies after getting the data
                await loadUserAllergies(analysisData);
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

    const loadUserAllergies = async (analysisData = data) => {
        try {
            const allergies = await AllergyService.getUserAllergies();
            setUserAllergies(allergies);

            // Check for dangerous ingredients
            if (analysisData?.ingredients) {
                const dangerous = AllergyService.checkForAllergies(
                    analysisData.ingredients,
                    allergies
                );
                setDangerousIngredients(dangerous);
            }
        } catch (error) {
            console.error('Failed to load allergies:', error);
        }
    };

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
                <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={30} />
                <View style={styles.overlayDark} />

                <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.loadingContainer}>
                    <Activity size={48} color={COLORS.primary} style={{ marginBottom: SPACING.l }} />
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
                <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={30} />
                <View style={styles.overlayDark} />

                <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.loadingContainer}>
                    <AlertTriangle size={48} color={COLORS.danger} style={{ marginBottom: SPACING.l }} />
                    <Text style={styles.loadingText}>{UI_TEXT.ERROR}</Text>
                    <Text style={styles.loadingSubText}>{error || ERROR_MESSAGES.NO_DATA}</Text>
                </View>
            </View>
        );
    }

    const scoreColor = getScoreColor(data.overallWeightedHealthScore);

    return (
        <View style={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={20} />
            <View style={styles.overlayDark} />

            <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={{ height: 40 }} />

                {/* Score Section with Allergy Warning */}
                <View style={styles.scoreSection}>
                    <View style={[styles.scoreCircle, { borderColor: scoreColor, shadowColor: scoreColor }]}>
                        <Text style={[styles.scoreValue, { color: scoreColor }]}>{data.overallWeightedHealthScore}</Text>
                        <Text style={styles.scoreTotal}>/100</Text>
                    </View>

                    <View style={styles.scoreTextContainer}>
                        <Text style={styles.scoreLabel}>{CARD_TITLES.HEALTH_SCORE}</Text>
                    </View>

                    <AllergyWarning
                        dangerousIngredients={dangerousIngredients}
                        visible={dangerousIngredients.length > 0}
                    />
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
                        delay={400}
                        onPress={() => setActiveModal(MODAL_TYPES.SOURCES)}
                    />
                </View>

                <View style={{ height: 40 }} />
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
                    <View key={index} style={styles.listItem}>
                        <View style={styles.listItemHeader}>
                            <View style={styles.bullet} />
                            <Text style={styles.listItemTitle}>{item.name}</Text>
                        </View>
                        <Text style={styles.listItemText}>{item.function}</Text>
                    </View>
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
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <View style={[styles.severityBadge, { backgroundColor: item.severity === 'High' ? COLORS.danger : COLORS.warning }]}>
                                    <Text style={styles.severityText}>{item.severity}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardBody}>{item.concern}</Text>
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
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <LinkIcon size={16} color={COLORS.primary} />
                                <Text style={[styles.cardTitle, { color: COLORS.primary, marginBottom: 0 }]}>{LABELS.SOURCE} {index + 1}</Text>
                            </View>
                            <Text style={styles.cardBody}>{source.citation}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </DetailModal>

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
        opacity: 0.4,
    },
    overlayDark: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
        paddingHorizontal: SPACING.m,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.overlayMedium,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    scrollContent: {
        padding: SPACING.m,
        paddingTop: 80,
    },
    // Score Section
    scoreSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.overlayMedium,
        marginBottom: SPACING.s,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    scoreValue: {
        fontSize: 42,
        fontWeight: '800',
    },
    scoreTotal: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginTop: -4,
    },
    scoreTextContainer: {
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    scoreLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '600',
    },
    // Cards Layout
    cardsContainer: {
        gap: SPACING.m,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        borderRadius: 24,
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardMainTitle: {
        flex: 1,
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.5,
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
        width: '70%',
        height: 4,
        backgroundColor: COLORS.borderLight,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: SPACING.s,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
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
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    modalContent: {
        backgroundColor: '#121212',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    modalHeader: {
        padding: SPACING.m,
        paddingTop: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        backgroundColor: '#1a1a1a',
    },
    modalHeaderTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: SPACING.l,
    },
    modalBodyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 26,
    },
    listItem: {
        marginBottom: SPACING.l,
        backgroundColor: COLORS.cardBackgroundLight,
        padding: SPACING.m,
        borderRadius: 16,
    },
    listItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginRight: 10,
    },
    listItemTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.white,
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
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.white,
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    severityText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardBody: {
        fontSize: 15,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
});