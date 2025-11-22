import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, AlertTriangle, XCircle, CheckCircle, BookOpen } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { uploadImage } from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ResultsScreen({ route, navigation }) {
    const { imageUri } = route.params;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the real API
                const result = await uploadImage(imageUri);

                // Backend returns: { ocr_raw_text: "...", analysis: {...} }
                // Extract the analysis object
                const analysisData = result.analysis || result;

                // Ensure scientificAnalysis structure exists for the UI if backend doesn't provide it exactly as expected
                // The new prompt returns 'positiveBenefitsSummary' and 'worstSideEffectsSummary'
                // We map these to the UI's expected 'scientificAnalysis' structure

                const formattedData = {
                    ...analysisData,
                    scientificAnalysis: {
                        summary: analysisData.appAssessment === "EXCELLENT" ? "This product appears to be well-formulated." : "This product has some potential concerns.",
                        drawbacks: (analysisData.worstSideEffectsSummary || []).map(effect => ({
                            title: "Potential Risk",
                            description: effect,
                            confidence: "High",
                            severity: "Medium"
                        })),
                        benefits: (analysisData.positiveBenefitsSummary || []).map(benefit => ({
                            title: "Potential Benefit",
                            description: benefit,
                            confidence: "High"
                        })),
                        citations: [] // The prompt asks for citations in 'scientificSupport' inside combos, we can extract them if needed
                    }
                };

                // Extract citations from badIngredientCombos if available
                if (analysisData.badIngredientCombos && analysisData.badIngredientCombos.length > 0) {
                    analysisData.badIngredientCombos.forEach(combo => {
                        if (combo.scientificSupport) {
                            combo.scientificSupport.forEach(cite => {
                                formattedData.scientificAnalysis.citations.push({
                                    title: "Supporting Evidence",
                                    author: "Examine.com / Study",
                                    year: "Recent",
                                    journal: cite
                                });
                            });
                        }
                    });
                }

                setData(formattedData);
            } catch (err) {
                console.error(err);
                setError("Failed to analyze image. Make sure the server is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [imageUri]);

    const getScoreColor = (score) => {
        if (score >= 80) return COLORS.success;
        if (score >= 50) return COLORS.warning;
        return COLORS.danger;
    };

    // Loading State
    if (loading) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={15} />
                <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingCircle}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                    <Text style={styles.loadingText}>Analyzing Ingredients...</Text>
                    <Text style={styles.loadingSubText}>Identifying additives & health risks</Text>
                </View>
            </View>
        );
    }

    // Error State
    if (error) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={15} />
                <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Error</Text>
                    <Text style={styles.loadingSubText}>{error}</Text>
                </View>
            </View>
        );
    }

    // Null data check
    if (!data) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={15} />
                <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </View>
        );
    }

    const scoreColor = getScoreColor(data.overallWeightedHealthScore);

    return (
        <View style={styles.container}>
            {/* Background Image (Fixed) */}
            <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={5} />

            {/* Fixed Header (Back Button) */}
            <View style={[styles.header, { paddingTop: insets.top + SPACING.s }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Scrollable Content "Sheet" */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Transparent Spacer to show image */}
                <View style={{ height: SCREEN_HEIGHT * 0.5 }} />

                {/* Actual Content Container */}
                <View style={[styles.sheetContent, { paddingBottom: insets.bottom + SPACING.xl }]}>
                    {/* Drag Handle Visual */}
                    <View style={styles.dragHandleContainer}>
                        <View style={styles.dragHandle} />
                    </View>

                    {/* Score Section */}
                    <View style={styles.scoreSection}>
                        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                            <Text style={[styles.scoreValue, { color: scoreColor }]}>{data.overallWeightedHealthScore}</Text>
                        </View>
                        <View style={styles.scoreTextContainer}>
                            <Text style={styles.scoreLabel}>Health Score</Text>
                            <Text style={[styles.assessment, { color: scoreColor }]}>{data.appAssessment}</Text>
                        </View>
                    </View>

                    {/* Worst Side Effects */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AlertTriangle size={20} color={COLORS.danger} />
                            <Text style={styles.sectionTitle}>Potential Side Effects</Text>
                        </View>
                        <View style={styles.card}>
                            {data.worstSideEffectsSummary.map((effect, index) => (
                                <View key={index} style={styles.bulletPoint}>
                                    <View style={styles.bullet} />
                                    <Text style={styles.bulletText}>{effect}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Bad Ingredient Combos */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <XCircle size={20} color={COLORS.warning} />
                            <Text style={styles.sectionTitle}>Harmful Combinations</Text>
                        </View>

                        {data.badIngredientCombos.map((combo, index) => (
                            <View key={index} style={styles.comboCard}>
                                <Text style={styles.comboTitle}>Combo #{index + 1}</Text>
                                <Text style={styles.comboIngredients}>{combo.combo}</Text>

                                <View style={styles.divider} />

                                <Text style={styles.subHeader}>Risk Factor:</Text>
                                <Text style={styles.reasonText}>{combo.risksFactor}</Text>

                                <View style={styles.divider} />

                                <Text style={styles.subHeader}>Risks:</Text>
                                {combo.comboRisks.map((risk, rIndex) => (
                                    <Text key={rIndex} style={styles.reasonText}>• {risk}</Text>
                                ))}

                                <View style={styles.divider} />

                                <Text style={styles.subHeader}>Evidence:</Text>
                                {combo.scientificSupport.map((support, sIndex) => (
                                    <Text key={sIndex} style={[styles.reasonText, { fontStyle: 'italic', fontSize: 12 }]}>{support}</Text>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Scientific Analysis Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Scientific Analysis</Text>
                        <Text style={styles.summaryText}>{data.scientificAnalysis.summary}</Text>
                    </View>

                    {/* Drawbacks Accordion */}
                    <View style={styles.accordionContainer}>
                        <View style={styles.accordionHeader}>
                            <View style={styles.accordionTitleRow}>
                                <AlertTriangle size={20} color={COLORS.danger} />
                                <Text style={styles.accordionTitle}>Potential Drawbacks</Text>
                            </View>
                            {/* In a real app, this would be interactive. For now, we show it expanded. */}
                        </View>
                        <View style={styles.accordionContent}>
                            {data.scientificAnalysis.drawbacks.map((item, index) => (
                                <View key={index} style={styles.evidenceCard}>
                                    <Text style={styles.evidenceTitle}>{item.title}</Text>
                                    <Text style={styles.evidenceDescription}>{item.description}</Text>
                                    <View style={styles.evidenceMeta}>
                                        <Text style={styles.evidenceTag}>Confidence: {item.confidence}</Text>
                                        <Text style={[styles.evidenceTag, { color: COLORS.danger }]}>Severity: {item.severity}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Benefits Accordion */}
                    <View style={styles.accordionContainer}>
                        <View style={styles.accordionHeader}>
                            <View style={styles.accordionTitleRow}>
                                <CheckCircle size={20} color={COLORS.success} />
                                <Text style={styles.accordionTitle}>Potential Benefits</Text>
                            </View>
                        </View>
                        <View style={styles.accordionContent}>
                            {data.scientificAnalysis.benefits.map((item, index) => (
                                <View key={index} style={styles.evidenceCard}>
                                    <Text style={styles.evidenceTitle}>{item.title}</Text>
                                    <Text style={styles.evidenceDescription}>{item.description}</Text>
                                    <View style={styles.evidenceMeta}>
                                        <Text style={[styles.evidenceTag, { color: COLORS.success }]}>Confidence: {item.confidence}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Citations Accordion */}
                    <View style={styles.accordionContainer}>
                        <View style={styles.accordionHeader}>
                            <View style={styles.accordionTitleRow}>
                                <BookOpen size={20} color={COLORS.textSecondary} />
                                <Text style={styles.accordionTitle}>Research & Citations</Text>
                            </View>
                        </View>
                        <View style={styles.accordionContent}>
                            {data.scientificAnalysis.citations.map((item, index) => (
                                <View key={index} style={styles.citationCard}>
                                    <Text style={styles.citationTitle}>"{item.title}"</Text>
                                    <Text style={styles.citationAuthor}>{item.author} • {item.year}</Text>
                                    <Text style={styles.citationJournal}>{item.journal}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* NEW: Better Alternatives Section */}
                    {data.alternatives && data.alternatives.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: COLORS.success }]}>✨ Better Alternatives</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Community suggested swaps for this item</Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alternativesContainer}>
                                {data.alternatives.map((alt) => (
                                    <View key={alt.id} style={styles.altCard}>
                                        <View style={styles.altImagePlaceholder}>
                                            {/* In a real app, use <Image source={{ uri: alt.image }} /> */}
                                            <Text style={styles.altEmoji}>🍎</Text>
                                        </View>
                                        <View style={styles.altContent}>
                                            <View style={styles.altHeader}>
                                                <Text style={styles.altName}>{alt.name}</Text>
                                                <View style={styles.altScoreBadge}>
                                                    <Text style={styles.altScore}>{alt.score}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.altBrand}>{alt.brand}</Text>
                                            <Text style={styles.altReason}>"{alt.reason}"</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // ... existing styles ...
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.4, // Darker for better text readability
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100, // Ensure back button is always on top
        paddingHorizontal: SPACING.m,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    loadingText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: SPACING.xs,
    },
    loadingSubText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    sheetContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.s,
        minHeight: SCREEN_HEIGHT * 0.6, // Ensure it takes up space
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.s,
        marginBottom: SPACING.s,
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#444',
        borderRadius: 3,
    },
    scoreSection: {
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    scoreCircle: {
        width: 80, // Smaller score circle
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xs,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    scoreTextContainer: {
        alignItems: 'center',
    },
    scoreLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    assessment: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 4,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.s,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: SPACING.xs,
    },
    sectionSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.m,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: SPACING.s,
        gap: SPACING.s,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.danger,
        marginTop: 8,
    },
    bulletText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        flex: 1,
    },
    comboCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    comboTitle: {
        color: COLORS.warning,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: SPACING.xs,
        textTransform: 'uppercase',
    },
    comboIngredients: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.m,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.s,
    },
    subHeader: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: SPACING.xs,
        textTransform: 'uppercase',
    },
    reasonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginTop: SPACING.xs,
    },
    tag: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: SPACING.s,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        color: COLORS.text,
        fontSize: 12,
    },
    summaryText: {
        color: COLORS.text,
        fontSize: 16,
        lineHeight: 24,
    },
    // Accordion Styles
    accordionContainer: {
        marginBottom: SPACING.m,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    accordionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    accordionTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '700',
    },
    accordionContent: {
        padding: SPACING.m,
    },
    evidenceCard: {
        marginBottom: SPACING.m,
    },
    evidenceTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    evidenceDescription: {
        color: COLORS.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    evidenceMeta: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    evidenceTag: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    citationCard: {
        marginBottom: SPACING.m,
        paddingLeft: SPACING.s,
        borderLeftWidth: 2,
        borderLeftColor: COLORS.primary,
    },
    citationTitle: {
        color: COLORS.text,
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 2,
    },
    citationAuthor: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
    },
    citationJournal: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    // Alternatives Styles
    alternativesContainer: {
        gap: SPACING.m,
        paddingRight: SPACING.m,
    },
    altCard: {
        width: 200,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    altImagePlaceholder: {
        height: 100,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    altEmoji: {
        fontSize: 40,
    },
    altContent: {
        padding: SPACING.m,
    },
    altHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    altName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    altScoreBadge: {
        backgroundColor: COLORS.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    altScore: {
        color: '#000',
        fontWeight: '800',
        fontSize: 12,
    },
    altBrand: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 8,
    },
    altReason: {
        color: COLORS.text,
        fontSize: 12,
        fontStyle: 'italic',
        opacity: 0.8,
    },
});
